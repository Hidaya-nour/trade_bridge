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
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error(`${context}: ${message}`, err);
    return res
      .status(500)
      .json({
        success: false,
        message:
          process.env.NODE_ENV === 'development'
            ? message
            : 'Internal server error',
      });
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
      const result = await paymentService.submitPaymentByOrderId(orderId, req.body);
      return res.json({ success: true, data: result });
    } catch (err) {
      return this.handleError(res, err, 'Submit payment by order error');
    }
  }

  async chapaCallback(req: Request, res: Response): Promise<any> {
    try {
      const txRef = String(req.query.tx_ref || req.body?.tx_ref || '');
      if (!txRef) {
        return res.status(400).json({ success: false, message: 'tx_ref is required' });
      }

      const result = await paymentService.verifyChapaByTxRef(txRef);
      const returnUrl =
        process.env.CHAPA_RETURN_URL ||
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/retailer/orders`;

      if (req.method === 'GET') {
        return res.redirect(
          `${returnUrl}?payment=success&tx_ref=${encodeURIComponent(txRef)}`,
        );
      }

      return res.json({ success: true, data: result });
    } catch (err) {
      return this.handleError(res, err, 'Chapa callback error');
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
