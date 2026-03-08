import { Request, Response } from 'express';
import paymentService from '../services/payment/payment.service';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

class PaymentController {
  private handleError(res: Response, err: unknown, context: string): Response {
    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    logger.error(context, err);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }

  async create(req: Request, res: Response): Promise<any> {
    try {
      const { order_id, total_amount, payment_method } = req.body;
      const payment = await paymentService.createPayment(order_id, total_amount, payment_method);
      return res.status(201).json({ success: true, data: { payment } });
    } catch (err) {
      return this.handleError(res, err, 'Create payment error');
    }
  }

  async getByOrderId(req: Request, res: Response): Promise<any> {
    try {
      const { orderId } = req.params;
      const payment = await paymentService.getPaymentByOrderId(orderId);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
      return res.json({ success: true, data: { payment } });
    } catch (err) {
      return this.handleError(res, err, 'Get payment by order error');
    }
  }

  async submitByOrder(req: Request, res: Response): Promise<any> {
    try {
      const { orderId } = req.params;
      const payment = await paymentService.submitPaymentByOrderId(orderId, req.body);
      return res.json({ success: true, data: { payment } });
    } catch (err) {
      return this.handleError(res, err, 'Submit payment by order error');
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
      return this.handleError(res, err, 'Update payment status error');
    }
  }
}

export default new PaymentController();
