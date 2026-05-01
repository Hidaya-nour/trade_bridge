// Restart triggered for .env reload
import Payment from '../../models/payment.model';
import { Order } from '../../models/order.model';
import User from '../../models/user.model';
import { initializeChapaTransaction, verifyChapaTransaction } from '../../config/chapa';
import { AppError } from '../../utils/errors';
import { SupplierPaymentMethodService } from '../supplier-payment-method/supplier-payment-method.service';

type PaymentMethod =
  | 'app_payment'
  | 'mobile_banking'
  | 'chapa';

const supplierPaymentToOrderMethodMap: Record<string, PaymentMethod | null> = {
  mobile_money: 'mobile_banking',
  mobile_banking: 'mobile_banking',
  credit_card: 'app_payment',
  chapa: 'app_payment',
};

interface SubmitPaymentPayload {
  payment_method?: PaymentMethod;
  amount_paid?: number;
  notes?: string;
  proof_document_id?: string;
  payment_details?: {
    transactionId?: string;
    mobileProvider?: string;
    phoneNumber?: string;
    transferDate?: string;
  };
}

class PaymentService {
  private supplierPaymentMethodService = new SupplierPaymentMethodService();

  private toStoredPaymentMethod(method: string): 'mobile_banking' | 'chapa' {
    // Frontend/API uses "app_payment" to mean "platform checkout". In the DB we store this as "chapa".
    if (method === 'app_payment' || method === 'chapa') return 'chapa';
    return 'mobile_banking';
  }

  private toChapaPhoneNumber(phone?: string | null): string | undefined {
    if (!phone) return undefined;
    const digits = String(phone).replace(/\D/g, '');

    // Chapa docs: if provided, must be 10 digits in 09xxxxxxxx or 07xxxxxxxx format.
    const toLocal = (raw: string) => {
      if (raw.length === 10 && (raw.startsWith('09') || raw.startsWith('07'))) return raw;
      if (raw.length === 9 && (raw.startsWith('9') || raw.startsWith('7'))) return `0${raw}`;
      if (raw.startsWith('251') && raw.length === 12) return `0${raw.slice(3)}`;
      return raw;
    };

    const local = toLocal(digits);
    if (local.length !== 10) return undefined;
    if (!local.startsWith('09') && !local.startsWith('07')) return undefined;
    return local;
  }

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
    const storedMethod = this.toStoredPaymentMethod(method);
    const existing = await this.getOrRestorePaymentByOrderId(orderId);
    if (existing) {
      existing.payment_method = storedMethod as any;
      existing.total_amount = total as any;
      existing.amount_paid = 0 as any;
      existing.payment_status = 'pending';
      await existing.save();
      return existing;
    }

    const payment = await Payment.create({
      order_id: orderId,
      payment_method: storedMethod,
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

    if (order.order_status === 'pending') {
      throw new AppError('Order must be approved by the supplier before payment can be submitted.', 400);
    }

    let payment = await this.getOrRestorePaymentByOrderId(orderId);
    const selectedMethod = (
      payload.payment_method ||
      (payment?.payment_method === 'chapa'
        ? 'app_payment'
        : payment?.payment_method) ||
      'app_payment'
    ) as PaymentMethod;

    // validate method against supplier payment methods
    const supplierPaymentMethods = await this.supplierPaymentMethodService.getActiveSupplierPaymentMethods(order.supplier_id);
    const mappedMethods = supplierPaymentMethods
      .map((m: any) => supplierPaymentToOrderMethodMap[m.method_type])
      .filter(Boolean) as PaymentMethod[];
    const allowedMethods = Array.from(new Set(mappedMethods));

    if (!allowedMethods.includes(selectedMethod)) {
      throw new AppError(
        `Payment method '${selectedMethod}' is not permitted by supplier`,
        400,
      );
    }

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
      payment.payment_method = this.toStoredPaymentMethod(selectedMethod) as any;
      payment.total_amount = Number(order.total_price) as any;
      payment.notes = payload.notes;
      payment.proof_document_id = payload.proof_document_id;

      if (typeof payload.amount_paid === 'number') {
        payment.amount_paid = payload.amount_paid as any;
      }

      // Method-specific fields
      if (selectedMethod === 'mobile_banking') {
        const transactionId = payload.payment_details?.transactionId;
        const mobileProvider = payload.payment_details?.mobileProvider;
        const phoneNumber = payload.payment_details?.phoneNumber;
        const transferDate = payload.payment_details?.transferDate;
        payment.notes = [
          payment.notes,
          mobileProvider && `provider:${mobileProvider}`,
          phoneNumber && `phone:${phoneNumber}`,
          transactionId && `tx:${transactionId}`,
          transferDate && `date:${transferDate}`,
        ]
          .filter(Boolean)
          .join(' | ');
      }

      let chapaCheckoutUrl: string | null = null;

      if (selectedMethod === 'app_payment') {
        const buyer = await User.findByPk(order.buyer_id);
        const supplier = await User.findByPk(order.supplier_id);

        if (!buyer?.email || !buyer?.full_name) {
          throw new AppError('Buyer profile must include name and email for app payment', 400);
        }
        if (!this.isValidEmail(buyer.email)) {
          throw new AppError(
            'Your account email is invalid for app payment. Please update your profile email and try again.',
            400,
          );
        }

        const txRef = `tb-${order.id.slice(0, 8)}-${Date.now()}`;
        const fullName = String(buyer.full_name || '').trim();
        if (!fullName) {
          throw new AppError('Buyer profile must include name for app payment', 400);
        }
        const [firstName, ...restNames] = fullName.split(' ');
        const lastName = restNames.join(' ') || firstName;
        const backendBaseUrl =
          process.env.BACKEND_URL ||
          `http://localhost:${process.env.PORT || 5000}`;
        const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const buyerOrdersPath =
          buyer.role === 'distributor' ? '/distributor/purchase-orders' : '/retailer/orders';
        const frontendReturnPath = `${frontendBaseUrl}${buyerOrdersPath}/${order.id}/receipt?payment=chapa&tx_ref=${encodeURIComponent(txRef)}`;
        const returnUrl =
          `${backendBaseUrl}/api/payments/chapa/return?tx_ref=${txRef}&redirect_to=${encodeURIComponent(frontendReturnPath)}`;

        const chapaPhone = this.toChapaPhoneNumber(buyer.phone);

        const initialized = await initializeChapaTransaction({
          amount: String(Number(order.total_price).toFixed(2)),
          currency: process.env.CHAPA_CURRENCY || 'ETB',
          email: buyer.email,
          first_name: firstName,
          last_name: lastName,
          tx_ref: txRef,
          callback_url: `${backendBaseUrl}/api/payments/chapa/callback?tx_ref=${encodeURIComponent(txRef)}`,
          return_url: returnUrl,
          phone_number: chapaPhone,
          ...((supplier as any)?.chapa_subaccount_id
            ? { 'subaccounts[id]': (supplier as any).chapa_subaccount_id }
            : {}),
          customization: {
            title: 'TradeBridge',
            description: `Order ${order.id.slice(0, 8)} payment`,
          },
          // Provide a safe meta object (Chapa checkout has been observed to be fragile if meta/customization are missing).
          meta: {
            order_id: order.id,
            buyer_id: order.buyer_id,
            supplier_id: order.supplier_id,
            invoices: [
              { key: 'order_id', value: order.id },
              { key: 'amount', value: String(Number(order.total_price).toFixed(2)) },
            ],
          },
        });

        chapaCheckoutUrl = initialized?.data?.checkout_url || null;

        if (!chapaCheckoutUrl) {
          throw new AppError('Chapa checkout URL was not returned', 400);
        }

        payment.chapa_transaction_id = txRef;
        payment.chapa_payment_url = chapaCheckoutUrl;
      }

      // Default flow per method.
      payment.payment_status =
        selectedMethod === 'mobile_banking' ? 'processing' : 'pending';

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
      if (paymentCreatedInThisRequest && selectedMethod === 'app_payment') {
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
    const isFailure =
      verificationStatus === 'failed' ||
      verificationStatus === 'cancelled' ||
      verificationStatus === 'canceled' ||
      verificationStatus === 'declined';

    payment.payment_status = isSuccess
      ? 'completed'
      : isFailure
        ? 'failed'
        : 'pending';
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
