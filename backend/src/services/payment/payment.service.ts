import Payment from '../../models/payment.model';
import { Order } from '../../models/order.model';
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
  async createPayment(orderId: string, total: number, method: string) {
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
    return Payment.findOne({ where: { order_id: orderId } });
  }

  async submitPaymentByOrderId(orderId: string, payload: SubmitPaymentPayload) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    let payment = await Payment.findOne({ where: { order_id: orderId } });
    const selectedMethod = (payload.payment_method ||
      payment?.payment_method ||
      'cash') as PaymentMethod;

    if (!payment) {
      payment = await this.createPayment(
        orderId,
        Number(order.total_price),
        selectedMethod,
      );
    }

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

    if (selectedMethod === 'chapa') {
      payment.chapa_transaction_id = payload.payment_details?.chapaTxRef;
      payment.chapa_payment_url = payload.payment_details?.chapaPaymentUrl;
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
    return payment;
  }

  async updatePaymentStatusById(paymentId: string, status: string, amountPaid?: number) {
    const payment = await Payment.findByPk(paymentId);
    if (!payment) return null;
    if (amountPaid !== undefined) payment.amount_paid = amountPaid as any;
    payment.payment_status = status as any;
    await payment.save();
    return payment;
  }

  async updatePaymentStatusByOrderId(orderId: string, status: string, amountPaid?: number) {
    const payment = await Payment.findOne({ where: { order_id: orderId } });
    if (!payment) return null;
    if (amountPaid !== undefined) payment.amount_paid = amountPaid as any;
    payment.payment_status = status as any;
    await payment.save();
    return payment;
  }
}

export default new PaymentService();
