import Payment from '../../models/payment.model';
import { Order } from '../../models/order.model';
import User from '../../models/user.model';
import { initializeChapaTransaction, verifyChapaTransaction } from '../../config/chapa';
import { AppError } from '../../utils/errors';

type PaymentMethod =
  | 'cash'
  | 'credit'
  | 'cheque'
  | 'mobile_banking'
  | 'bank_transfer'
  | 'chapa';

interface SubmitPaymentPayload {
  payment_method?: PaymentMethod;
  amount_paid?: number;
  notes?: string;
  proof_document_id?: string;
  payment_details?: {
    chequeNumber?: string;
    bankName?: string;
    chequeDate?: string;
    transactionId?: string;
    transferDate?: string;
    chapaTxRef?: string;
    chapaPaymentUrl?: string;
  };
}

class PaymentService {
  private async closeOrderIfPaidAndDelivered(orderId: string) {
    const order = await Order.findByPk(orderId);
    if (!order) return;
    if (order.order_status !== 'delivered') return;
    const payment = await Payment.findOne({ where: { order_id: orderId } });
    if (!payment) return;
    if (payment.payment_status !== 'completed') return;
    order.order_status = 'closed' as any;
    await order.save();
  }
  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private async getOrRestorePaymentByOrderId(orderId: string) {
    const existing = await Payment.findOne({
      where: { order_id: orderId },
      paranoid: false,
    });

    if (existing && existing.deleted_at) {
      await existing.restore();
    }

    return existing || null;
  }

  async createPayment(orderId: string, total: number, method: string) {
    const existing = await this.getOrRestorePaymentByOrderId(orderId);
    if (existing) {
      existing.payment_method = method as any;
      existing.total_amount = total as any;
      existing.amount_paid = 0 as any;
      existing.payment_status = 'pending';
      await existing.save();
      return existing;
    }

    const payment = await Payment.create({
      order_id: orderId,
      payment_method: method,
      total_amount: total,
      amount_paid: 0,
      payment_status: 'pending'
    } as any);

    return payment;
  }

  async getPaymentByOrderId(orderId: string) {
    return this.getOrRestorePaymentByOrderId(orderId);
  }

  async submitPaymentByOrderId(orderId: string, payload: SubmitPaymentPayload) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    let payment = await this.getOrRestorePaymentByOrderId(orderId);
    const selectedMethod = (payload.payment_method ||
      payment?.payment_method ||
      'cash') as PaymentMethod;

    let paymentCreatedInThisRequest = false;
    if (!payment) {
      payment = await this.createPayment(
        orderId,
        Number(order.total_price),
        selectedMethod,
      );
      paymentCreatedInThisRequest = true;
    }

    try {
      payment.payment_method = selectedMethod as any;
      payment.notes = payload.notes;
      payment.proof_document_id = payload.proof_document_id;

      if (typeof payload.amount_paid === 'number') {
        payment.amount_paid = payload.amount_paid as any;
      }

      // Method-specific fields
      if (selectedMethod === 'cheque') {
        payment.cheque_number = payload.payment_details?.chequeNumber;
        payment.cheque_bank = payload.payment_details?.bankName;
        payment.cheque_date = payload.payment_details?.chequeDate
          ? new Date(payload.payment_details.chequeDate)
          : undefined;
        payment.cheque_status = 'submitted';
      }

      if (selectedMethod === 'mobile_banking') {
        const transactionId = payload.payment_details?.transactionId;
        const transferDate = payload.payment_details?.transferDate;
        payment.notes = [payment.notes, transactionId && `tx:${transactionId}`, transferDate && `date:${transferDate}`]
          .filter(Boolean)
          .join(' | ');
      }

      let chapaCheckoutUrl: string | null = null;

      if (selectedMethod === 'chapa') {
        const buyer = await User.findByPk(order.buyer_id);
        if (!buyer?.email || !buyer?.full_name) {
          throw new AppError('Buyer profile must include name and email for Chapa payment', 400);
        }
        if (!this.isValidEmail(buyer.email)) {
          throw new AppError(
            'Your account email is invalid for Chapa. Please update your profile email and try again.',
            400,
          );
        }

        const txRef =
          payload.payment_details?.chapaTxRef ||
          `tb-${order.id.slice(0, 8)}-${Date.now()}`;
        const [firstName, ...restNames] = buyer.full_name.split(' ');
        const lastName = restNames.join(' ') || firstName;
        const backendBaseUrl =
          process.env.BACKEND_URL ||
          `http://localhost:${process.env.PORT || 5000}`;
        const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const callbackUrl =
          process.env.CHAPA_CALLBACK_URL ||
          `${backendBaseUrl}/api/payments/chapa/callback`;
        const returnUrl =
          process.env.CHAPA_RETURN_URL || `${frontendBaseUrl}/retailer/orders`;

        const initialized = await initializeChapaTransaction({
          amount: String(Number(order.total_price).toFixed(2)),
          currency: process.env.CHAPA_CURRENCY || 'ETB',
          email: buyer.email,
          first_name: firstName,
          last_name: lastName,
          tx_ref: txRef,
          callback_url: callbackUrl,
          return_url: returnUrl,
          phone_number: buyer.phone || undefined,
          customization: {
            title: 'TradeBridge',
            description: `Order ${order.id.slice(0, 8)} payment`,
          },
        });

        chapaCheckoutUrl =
          payload.payment_details?.chapaPaymentUrl ||
          initialized?.data?.checkout_url ||
          null;

        if (!chapaCheckoutUrl) {
          throw new AppError('Chapa checkout URL was not returned', 400);
        }

        payment.chapa_transaction_id = txRef;
        payment.chapa_payment_url = chapaCheckoutUrl;
      }

      // Default flow per method.
      if (selectedMethod === 'cash') {
        payment.payment_status = 'pending';
      } else if (selectedMethod === 'credit') {
        payment.payment_status = 'processing';
      } else {
        payment.payment_status = 'processing';
      }

      await payment.save();
      return {
        payment,
        chapa: chapaCheckoutUrl
          ? {
              tx_ref: payment.chapa_transaction_id,
              checkout_url: chapaCheckoutUrl,
            }
          : undefined,
      };
    } catch (error) {
      // If we created the payment row in this request and failed to initialize Chapa,
      // cleanup to avoid stale pending records without checkout URL.
      if (paymentCreatedInThisRequest && selectedMethod === 'chapa') {
        await payment.destroy();
      }
      throw error;
    }
  }

  async verifyChapaByTxRef(txRef: string) {
    const verification = await verifyChapaTransaction(txRef);
    const payment = await Payment.findOne({
      where: { chapa_transaction_id: txRef },
    });

    if (!payment) {
      throw new AppError('Payment not found for tx_ref', 404);
    }

    const verificationStatus =
      String(verification?.data?.status || verification?.status || '').toLowerCase();
    const isSuccess =
      verificationStatus === 'success' ||
      verificationStatus === 'completed' ||
      verificationStatus === 'paid';

    payment.payment_status = isSuccess ? 'completed' : 'failed';
    if (isSuccess) {
      payment.amount_paid = payment.total_amount as any;
      payment.payment_date = new Date();
    }
    await payment.save();
    if (isSuccess) {
      await this.closeOrderIfPaidAndDelivered(payment.order_id);
    }

    return {
      payment,
      verification,
    };
  }

  async updatePaymentStatusById(paymentId: string, status: string, amountPaid?: number) {
    const payment = await Payment.findByPk(paymentId);
    if (!payment) return null;
    if (amountPaid !== undefined) payment.amount_paid = amountPaid as any;
    payment.payment_status = status as any;
    await payment.save();
    if (status === 'completed') {
      await this.closeOrderIfPaidAndDelivered(payment.order_id);
    }
    return payment;
  }

  async updatePaymentStatusByOrderId(orderId: string, status: string, amountPaid?: number) {
    const payment = await Payment.findOne({ where: { order_id: orderId } });
    if (!payment) return null;
    if (amountPaid !== undefined) payment.amount_paid = amountPaid as any;
    payment.payment_status = status as any;
    await payment.save();
    if (status === 'completed') {
      await this.closeOrderIfPaidAndDelivered(orderId);
    }
    return payment;
  }
}

export default new PaymentService();
