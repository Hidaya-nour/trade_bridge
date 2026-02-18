import { Request, Response } from 'express';
import paymentService from '../services/payment/payment.service';
import logger from '../utils/logger';

class PaymentController {
  async create(req: Request, res: Response): Promise<any> {
    try {
      const { order_id, total_amount, payment_method } = req.body;
      const payment = await paymentService.createPayment(order_id, total_amount, payment_method);
      return res.status(201).json({ success: true, data: { payment } });
    } catch (err) {
      logger.error('Create payment error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { status, amount_paid } = req.body;
      const payment = await paymentService.updatePaymentStatusById(id, status, amount_paid);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
      return res.json({ success: true, data: { payment } });
    } catch (err) {
      logger.error('Update payment status error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new PaymentController();
