import { Op } from 'sequelize';
import sequelize from '../../config/database';
import Order from '../../models/order.model';
import Payment from '../../models/payment.model';
import User from '../../models/user.model';
import Withdrawal from '../../models/withdrawal.model';
import Notification from '../../models/notification.model';
import SupplierPaymentMethod from '../../models/supplier-payment-method.model';
import { createChapaTransfer } from '../../config/chapa';
import { AppError } from '../../utils/errors';
import {
  mapBankNameToChapaTransferCode,
  resolveChapaTransferBankCode,
} from '../../utils/chapa-bank.util';
import logger from '../../utils/logger';
const roundMoney = (value: number) => Math.round(value * 100) / 100;

const formatReserved = (amount: number) => `ETB ${amount.toLocaleString()}`;

const ACTIVE_WITHDRAWAL_STATUSES = ['pending', 'processing'] as const;

export class SellerWalletService {
  getWithdrawalLimits() {
    return {
      min_amount: Number(process.env.MIN_WITHDRAWAL_AMOUNT || 10000),
      max_per_day: Number(process.env.MAX_WITHDRAWALS_PER_DAY || 2),
      cooldown_hours: Number(process.env.WITHDRAWAL_COOLDOWN_HOURS || 4),
    };
  }

  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /** Enforce one active withdrawal, daily cap, and cooldown between requests. */
  async assertWithdrawalAllowed(supplierId: string) {
    const limits = this.getWithdrawalLimits();

    const inProgress = await Withdrawal.findOne({
      where: {
        supplier_id: supplierId,
        status: { [Op.in]: [...ACTIVE_WITHDRAWAL_STATUSES] },
      },
    });
    if (inProgress) {
      throw new AppError(
        'You already have a withdrawal in progress. Please wait until it is completed before requesting another.',
        400,
      );
    }

    const todayCount = await Withdrawal.count({
      where: {
        supplier_id: supplierId,
        status: { [Op.notIn]: ['rejected'] },
        created_at: { [Op.gte]: this.startOfToday() },
      },
    });
    if (todayCount >= limits.max_per_day) {
      throw new AppError(
        `Daily withdrawal limit reached (maximum ${limits.max_per_day} per day).`,
        400,
      );
    }

    const cooldownMs = limits.cooldown_hours * 60 * 60 * 1000;
    const cooldownSince = new Date(Date.now() - cooldownMs);
    const recent = await Withdrawal.findOne({
      where: {
        supplier_id: supplierId,
        status: { [Op.notIn]: ['rejected'] },
        created_at: { [Op.gte]: cooldownSince },
      },
      order: [['created_at', 'DESC']],
    });
    if (recent) {
      throw new AppError(
        `Please wait ${limits.cooldown_hours} hours between withdrawal requests.`,
        400,
      );
    }
  }

  getPlatformFeeRate(): number {
    const rate = Number(process.env.CHAPA_PLATFORM_FEE_PERCENTAGE || 0.02);
    if (!Number.isFinite(rate) || rate < 0 || rate >= 1) return 0.02;
    return rate;
  }

  calculateSellerNet(totalAmount: number) {
    const feeRate = this.getPlatformFeeRate();
    const total = roundMoney(Number(totalAmount));
    const platformFee = roundMoney(total * feeRate);
    const sellerNet = roundMoney(total - platformFee);
    return { total, platformFee, sellerNet, feeRate };
  }

  async getBalance(supplierId: string) {
    const user = await User.findByPk(supplierId);
    if (!user) throw new AppError('Supplier not found', 404);
    return {
      pending_balance: roundMoney(Number((user as any).pending_balance || 0)),
      available_balance: roundMoney(Number((user as any).available_balance || 0)),
      platform_fee_percentage: this.getPlatformFeeRate(),
      withdrawal_limits: this.getWithdrawalLimits(),
    };
  }

  /**
   * When buyer payment is verified: credit supplier pending balance (escrow).
   */
  async creditPendingOnPaymentComplete(paymentId: string) {
    const payment = await Payment.findByPk(paymentId);
    if (!payment || payment.payment_status !== 'completed') return null;

    if (payment.settlement_status && payment.settlement_status !== 'none') {
      return payment;
    }

    const order = await Order.findByPk(payment.order_id);
    if (!order) throw new AppError('Order not found for payment settlement', 404);

    const paidAmount = Number(payment.amount_paid || payment.total_amount);
    const { platformFee, sellerNet } = this.calculateSellerNet(paidAmount);

    if (sellerNet <= 0) return payment;

    const transaction = await sequelize.transaction();
    try {
      const lockedPayment = await Payment.findByPk(paymentId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!lockedPayment || lockedPayment.settlement_status !== 'none') {
        await transaction.commit();
        return lockedPayment;
      }

      const supplier = await User.findByPk(order.supplier_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!supplier) throw new AppError('Supplier not found', 404);

      const currentPending = Number((supplier as any).pending_balance || 0);
      (supplier as any).pending_balance = roundMoney(currentPending + sellerNet);
      await supplier.save({ transaction });

      lockedPayment.seller_net_amount = sellerNet as any;
      lockedPayment.platform_fee_amount = platformFee as any;
      lockedPayment.settlement_status = 'pending';
      await lockedPayment.save({ transaction });

      await Notification.create(
        {
          user_id: order.supplier_id,
          type: 'payment',
          title: 'Payment Secured',
          message: `ETB ${sellerNet.toLocaleString()} from order ${order.id.slice(0, 8)} is held until delivery is confirmed.`,
          is_read: 0,
        } as any,
        { transaction },
      );

      await transaction.commit();

      await this.tryReleaseOnDelivery(order.id);
      return lockedPayment;
    } catch (error) {
      await transaction.rollback();
      logger.error('creditPendingOnPaymentComplete failed', error);
      throw error;
    }
  }

  /**
   * Credit escrow if needed, then release to available when order is delivered/closed.
   */
  async settleOrderFunds(orderId: string) {
    const payment = await Payment.findOne({ where: { order_id: orderId } });
    if (!payment || payment.payment_status !== 'completed') return null;

    if (!payment.settlement_status || payment.settlement_status === 'none') {
      await this.creditPendingOnPaymentComplete(payment.id);
    }

    return this.tryReleaseOnDelivery(orderId);
  }

  /**
   * After delivery: move seller share from pending → available.
   */
  async tryReleaseOnDelivery(orderId: string) {
    const order = await Order.findByPk(orderId);
    if (!order) return null;

    const deliveredStatuses = ['delivered', 'closed'];
    if (!deliveredStatuses.includes(String(order.order_status))) return null;

    const payment = await Payment.findOne({ where: { order_id: orderId } });
    if (!payment || payment.payment_status !== 'completed') return null;
    if (payment.settlement_status !== 'pending') return null;

    const sellerNet = Number(payment.seller_net_amount || 0);
    if (sellerNet <= 0) return payment;

    const transaction = await sequelize.transaction();
    try {
      const lockedPayment = await Payment.findByPk(payment.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!lockedPayment || lockedPayment.settlement_status !== 'pending') {
        await transaction.commit();
        return lockedPayment;
      }

      const supplier = await User.findByPk(order.supplier_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!supplier) throw new AppError('Supplier not found', 404);

      const pending = Number((supplier as any).pending_balance || 0);
      const available = Number((supplier as any).available_balance || 0);
      const releaseAmount = Number(lockedPayment.seller_net_amount || 0);

      (supplier as any).pending_balance = roundMoney(Math.max(0, pending - releaseAmount));
      (supplier as any).available_balance = roundMoney(available + releaseAmount);
      await supplier.save({ transaction });

      lockedPayment.settlement_status = 'released';
      await lockedPayment.save({ transaction });

      await Notification.create(
        {
          user_id: order.supplier_id,
          type: 'payment',
          title: 'Funds Available',
          message: `ETB ${releaseAmount.toLocaleString()} from order ${order.id.slice(0, 8)} is now available to withdraw.`,
          is_read: 0,
        } as any,
        { transaction },
      );

      await transaction.commit();
      return lockedPayment;
    } catch (error) {
      await transaction.rollback();
      logger.error('tryReleaseOnDelivery failed', error);
      throw error;
    }
  }

  async requestWithdrawal(
    supplierId: string,
    amount: number,
    bankDetails?: {
      bank_provider?: string;
      bank_account_name?: string;
      bank_account_number?: string;
    },
  ) {
    await this.assertWithdrawalAllowed(supplierId);

    const withdrawAmount = roundMoney(Number(amount));
    if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
      throw new AppError('Withdrawal amount must be greater than zero', 400);
    }

    const { min_amount: minWithdrawal } = this.getWithdrawalLimits();
    if (withdrawAmount < minWithdrawal) {
      throw new AppError(
        `Minimum withdrawal amount is ETB ${minWithdrawal.toLocaleString()}`,
        400,
      );
    }

    const balance = await this.getBalance(supplierId);
    const pendingWithdrawals = await Withdrawal.sum('amount', {
      where: {
        supplier_id: supplierId,
        status: { [Op.in]: [...ACTIVE_WITHDRAWAL_STATUSES] },
      },
    });
    const reserved = roundMoney(Number(pendingWithdrawals || 0));
    const spendable = roundMoney(balance.available_balance - reserved);
    if (withdrawAmount > spendable) {
      throw new AppError(
        reserved > 0
          ? `Insufficient available balance (${formatReserved(reserved)} already requested)`
          : 'Insufficient available balance',
        400,
      );
    }

    let bankProvider = bankDetails?.bank_provider;
    let bankAccountName = bankDetails?.bank_account_name;
    let bankAccountNumber = bankDetails?.bank_account_number;

    if (!bankAccountNumber) {
      const primaryMethod = await SupplierPaymentMethod.findOne({
        where: { supplier_id: supplierId, is_active: true, is_primary: true },
      });
      const fallbackMethod =
        primaryMethod ||
        (await SupplierPaymentMethod.findOne({
          where: { supplier_id: supplierId, is_active: true },
          order: [['created_at', 'DESC']],
        }));

      if (fallbackMethod) {
        bankProvider = bankProvider || fallbackMethod.provider_name;
        bankAccountName = bankAccountName || fallbackMethod.account_holder_name;
        bankAccountNumber = bankAccountNumber || fallbackMethod.account_identifier;
      }
    }

    const bankCode = mapBankNameToChapaTransferCode(bankProvider || '');

    if (!bankAccountNumber) {
      throw new AppError(
        'Add a primary payment method with bank details before withdrawing',
        400,
      );
    }

    const withdrawal = await Withdrawal.create({
      supplier_id: supplierId,
      amount: withdrawAmount,
      status: 'pending',
      bank_provider: bankProvider,
      bank_account_name: bankAccountName,
      bank_account_number: bankAccountNumber,
      bank_code: bankCode,
    } as any);

    const autoPayoutOnRequest =
      String(process.env.CHAPA_INSTANT_WITHDRAW || '').toLowerCase() === 'true';
    if (autoPayoutOnRequest) {
      return this.executeWithdrawalPayout(withdrawal.id, supplierId, true);
    }

    await Notification.create({
      user_id: supplierId,
      type: 'payment',
      title: 'Withdrawal Requested',
      message: `Your withdrawal request for ETB ${withdrawAmount.toLocaleString()} is pending admin approval.`,
      is_read: 0,
    } as any);

    return withdrawal;
  }

  async listWithdrawalsForSupplier(supplierId: string) {
    return Withdrawal.findAll({
      where: { supplier_id: supplierId },
      order: [['created_at', 'DESC']],
    });
  }

  async listPendingWithdrawals() {
    return Withdrawal.findAll({
      where: { status: { [Op.in]: ['pending', 'processing'] } },
      order: [['created_at', 'ASC']],
    });
  }

  private isAutoPayoutEnabled() {
    return String(process.env.CHAPA_AUTO_PAYOUT || 'true').toLowerCase() !== 'false';
  }

  private async sendChapaPayout(withdrawal: Withdrawal) {
    const bankCode = resolveChapaTransferBankCode(
      withdrawal.bank_code,
      withdrawal.bank_provider,
    );
    const reference = `tb-wd-${withdrawal.id.slice(0, 8)}-${Date.now()}`;

    const transfer = await createChapaTransfer({
      account_name: withdrawal.bank_account_name || 'Seller',
      account_number: String(withdrawal.bank_account_number || ''),
      amount: String(Number(withdrawal.amount).toFixed(2)),
      currency: process.env.CHAPA_CURRENCY || 'ETB',
      reference,
      bank_code: Number(bankCode),
    });

    return {
      reference,
      transfer,
    };
  }

  /**
   * Deduct balance and optionally send Chapa transfer (when CHAPA_AUTO_PAYOUT=true).
   */
  async executeWithdrawalPayout(
    withdrawalId: string,
    adminId: string,
    _skipAdminRoleCheck = false,
  ) {
    const withdrawal = await Withdrawal.findByPk(withdrawalId);
    if (!withdrawal) throw new AppError('Withdrawal not found', 404);
    if (!['pending', 'processing'].includes(withdrawal.status)) {
      throw new AppError('Withdrawal is not pending', 400);
    }

    const amount = Number(withdrawal.amount);
    const supplier = await User.findByPk(withdrawal.supplier_id);
    if (!supplier) throw new AppError('Supplier not found', 404);

    const available = Number((supplier as any).available_balance || 0);
    if (amount > available) {
      throw new AppError('Supplier has insufficient available balance', 400);
    }

    withdrawal.status = 'processing';
    await withdrawal.save();

    let chapaReference: string | undefined;
    if (this.isAutoPayoutEnabled()) {
      try {
        const payout = await this.sendChapaPayout(withdrawal);
        chapaReference = payout.reference;
      } catch (error: any) {
        withdrawal.status = 'pending';
        await withdrawal.save();
        logger.error('Chapa payout failed', error);
        throw new AppError(
          error?.message || 'Chapa transfer failed. Check merchant balance and bank details.',
          400,
        );
      }
    }

    const transaction = await sequelize.transaction();
    try {
      const lockedWithdrawal = await Withdrawal.findByPk(withdrawalId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (
        !lockedWithdrawal ||
        !['pending', 'processing'].includes(lockedWithdrawal.status)
      ) {
        throw new AppError('Withdrawal is no longer pending', 400);
      }

      const lockedSupplier = await User.findByPk(withdrawal.supplier_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!lockedSupplier) throw new AppError('Supplier not found', 404);

      const currentAvailable = Number((lockedSupplier as any).available_balance || 0);
      if (amount > currentAvailable) {
        throw new AppError('Supplier has insufficient available balance', 400);
      }

      (lockedSupplier as any).available_balance = roundMoney(currentAvailable - amount);
      await lockedSupplier.save({ transaction });

      lockedWithdrawal.status = 'completed';
      lockedWithdrawal.approved_by = adminId;
      lockedWithdrawal.approved_at = new Date();
      lockedWithdrawal.completed_at = new Date();
      if (chapaReference) {
        (lockedWithdrawal as any).chapa_transfer_ref = chapaReference;
      }
      await lockedWithdrawal.save({ transaction });

      await Notification.create(
        {
          user_id: withdrawal.supplier_id,
          type: 'payment',
          title: this.isAutoPayoutEnabled() ? 'Withdrawal Paid' : 'Withdrawal Approved',
          message: this.isAutoPayoutEnabled()
            ? `ETB ${amount.toLocaleString()} was sent to your bank account via Chapa.`
            : `ETB ${amount.toLocaleString()} was approved for payout.`,
          is_read: 0,
        } as any,
        { transaction },
      );

      await transaction.commit();
      return lockedWithdrawal;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async approveWithdrawal(withdrawalId: string, adminId: string, adminNotes?: string) {
    const withdrawal = await Withdrawal.findByPk(withdrawalId);
    if (!withdrawal) throw new AppError('Withdrawal not found', 404);
    if (adminNotes) {
      withdrawal.admin_notes = adminNotes;
      await withdrawal.save();
    }
    return this.executeWithdrawalPayout(withdrawalId, adminId);
  }

  async rejectWithdrawal(withdrawalId: string, adminId: string, adminNotes?: string) {
    const withdrawal = await Withdrawal.findByPk(withdrawalId);
    if (!withdrawal) throw new AppError('Withdrawal not found', 404);
    if (withdrawal.status !== 'pending') {
      throw new AppError('Withdrawal is not pending', 400);
    }

    withdrawal.status = 'rejected';
    withdrawal.approved_by = adminId;
    withdrawal.approved_at = new Date();
    if (adminNotes) withdrawal.admin_notes = adminNotes;
    await withdrawal.save();

    await Notification.create({
      user_id: withdrawal.supplier_id,
      type: 'payment',
      title: 'Withdrawal Rejected',
      message: adminNotes || 'Your withdrawal request was rejected. Contact support for details.',
      is_read: 0,
    } as any);

    return withdrawal;
  }
}

export default new SellerWalletService();
