import Payment from '../../models/payment.model';

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
