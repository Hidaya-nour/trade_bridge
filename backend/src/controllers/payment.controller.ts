import { Request, Response } from 'express';
import paymentService from '../services/payment/payment.service';
import Payment from '../models/payment.model';
import Order from '../models/order.model';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';
import { recordAuditLog } from '../utils/audit';
import { createChapaSubaccount } from '../config/chapa';

class PaymentController {
  private isAdmin(role?: string) {
    return role === 'admin';
  }

  private isSupplierRole(role?: string) {
    return role === 'distributor' || role === 'factory';
  }

  private ensureAuthenticated(req: Request) {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
  }

  private ensureOrderAccess(order: Order, req: Request) {
    const user = req.user;
    this.ensureAuthenticated(req);
    if (!user) return;

    if (this.isAdmin(user.role)) return;

    if (order.buyer_id === user.id || order.supplier_id === user.id) {
      return;
    }

    throw new AppError('You do not have permission to view this payment', 403);
  }

  private ensureSupplierAccess(order: Order, req: Request) {
    const user = req.user;
    this.ensureAuthenticated(req);
    if (!user) return;

    if (this.isAdmin(user.role)) return;

    if (this.isSupplierRole(user.role) && order.supplier_id === user.id) {
      return;
    }

    throw new AppError('You do not have permission to manage this payment', 403);
  }

  private ensureBuyerAccess(order: Order, req: Request) {
    const user = req.user;
    this.ensureAuthenticated(req);
    if (!user) return;

    if (this.isAdmin(user.role)) return;

    if (order.buyer_id === user.id) {
      return;
    }

    throw new AppError('You do not have permission to submit this payment', 403);
  }

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
      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      this.ensureOrderAccess(order, req);
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
      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      this.ensureBuyerAccess(order, req);
      const result = await paymentService.submitPaymentByOrderId(orderId, req.body);
      await recordAuditLog({
        userId: req.user?.id,
        action: 'payment.submitted',
        entityType: 'payment',
        entityId: result.payment.id,
      });
      return res.json({ success: true, data: result });
    } catch (err) {
      return this.handleError(res, err, 'Submit payment by order error');
    }
  }

  async chapaCallback(req: Request, res: Response): Promise<any> {
    try {
      const txRef = String(
        req.query.trx_ref ||
          req.query.tx_ref ||
          req.body?.trx_ref ||
          req.body?.tx_ref ||
          '',
      );
      if (!txRef) {
        return res.status(400).json({ success: false, message: 'tx_ref is required' });
      }

      const result = await paymentService.verifyChapaByTxRef(txRef);
      return res.json({ success: true, data: result });
    } catch (err) {
      return this.handleError(res, err, 'Chapa callback error');
    }
  }

  async chapaReturn(req: Request, res: Response): Promise<any> {
    const redirectTo = String(req.query.redirect_to || '');
    try {
      const txRef = String(
        req.query.trx_ref ||
        req.query.tx_ref ||
        ''
      );

      logger.info(`Chapa return hit with txRef: ${txRef}, redirectTo: ${redirectTo}`);

      if (txRef) {
        try {
          const verifyResult = await paymentService.verifyChapaByTxRef(txRef);
          logger.info(`Chapa verification result for ${txRef}: ${verifyResult.payment.payment_status}`);
        } catch (verifyErr: any) {
          logger.error(`Chapa verification failed during return for txRef ${txRef}: ${verifyErr?.message}`, verifyErr);
        }
      } else {
        logger.warn('Chapa return hit without tx_ref');
      }

      if (redirectTo) {
        res.status(302).setHeader('Location', redirectTo);
        return res.send(`
          <html>
            <head><meta http-equiv="refresh" content="0;url=${redirectTo}"></head>
            <body>Redirecting to <a href="${redirectTo}">${redirectTo}</a>...</body>
          </html>
        `);
      }

      return res.send('Payment flow completed.');
    } catch (err) {
      logger.error('Chapa return error', err);
      if (redirectTo) {
        res.status(302).setHeader('Location', redirectTo);
        return res.send(`
          <html>
            <head><meta http-equiv="refresh" content="0;url=${redirectTo}"></head>
            <body>Redirecting to <a href="${redirectTo}">${redirectTo}</a>...</body>
          </html>
        `);
      }
      return res.status(500).send('Error during payment return.');
    }
  }

  async registerSubaccount(req: Request, res: Response): Promise<any> {
    try {
      const user = req.user;
      this.ensureAuthenticated(req);
      if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
      
      if (!this.isSupplierRole(user.role)) {
        return res.status(403).json({ success: false, message: 'Only suppliers can register subaccounts' });
      }

      const { business_name, account_name, bank_code, account_number } = req.body;
      
      if (!business_name || !account_name || !bank_code || !account_number) {
        return res.status(400).json({ success: false, message: 'Missing required bank details' });
      }

      // Map bank_code to one of the verified active Chapa slugs
      const bankNameToChapaCode: Record<string, string> = {
        'telebirr': 'telebirr',
        'cbe birr': 'cbebirr',
        'cbebirr': 'cbebirr',
        'm-pesa': 'mpesa',
        'mpesa': 'mpesa',
        'yaya': 'yaya',
        'kacha': 'kacha',
        'commercial bank of ethiopia': 'cbebirr',
        'cbe': 'cbebirr',
        'wegagen bank': 'wegagen_bank',
        'wegagen': 'wegagen_bank',
        'berhan bank': 'berhan_bank',
        'berhan': 'berhan_bank',
        'enat bank': 'enat_bank',
        'enat': 'enat_bank',
        'addis international bank': 'addis_int_bank',
        'addis': 'addis_int_bank',
        'ahadu bank': 'ahadu_bank',
        'ahadu': 'ahadu_bank',
        'global bank': 'global_bank',
        'global': 'global_bank',
        'lion bank': 'anbesa_bank',
        'anbesa bank': 'anbesa_bank',
        'lion': 'anbesa_bank'
      };

      const normalized = String(bank_code || '').trim().toLowerCase();
      let activeBankCode = 'cbebirr'; // default fallback
      let foundMatch = false;

      // First try exact or substring matches
      for (const [key, value] of Object.entries(bankNameToChapaCode)) {
        if (normalized === key || normalized.includes(key) || key.includes(normalized)) {
          activeBankCode = value;
          foundMatch = true;
          break;
        }
      }

      // If no match found but it is already one of the active values, preserve it
      if (!foundMatch && Object.values(bankNameToChapaCode).includes(normalized)) {
        activeBankCode = normalized;
      }

      // Default platform fee: 2% (0.02)
      const platformFee = Number(process.env.CHAPA_PLATFORM_FEE_PERCENTAGE || 0.02);

      const chapaResponse = await createChapaSubaccount({
        business_name,
        account_name,
        bank_code: activeBankCode,
        account_number,
        split_type: 'percentage',
        split_value: platformFee, 
      });

      const subaccountId = chapaResponse.data?.subaccount_id;
      if (!subaccountId) {
        throw new AppError('Chapa did not return a subaccount ID', 500);
      }

      // Save to user
      const userRecord = await require('../models/user.model').User.findByPk(user.id);
      if (!userRecord) {
        throw new AppError('User not found', 404);
      }

      userRecord.chapa_subaccount_id = subaccountId;
      await userRecord.save();

      return res.json({ success: true, message: 'Subaccount registered successfully', subaccount_id: subaccountId });
    } catch (err) {
      return this.handleError(res, err, 'Register subaccount error');
    }
  }

  async updateStatus(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { status, amount_paid } = req.body;
      const paymentRecord = await Payment.findByPk(id);
      if (!paymentRecord) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
      const order = await Order.findByPk(paymentRecord.order_id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      this.ensureSupplierAccess(order, req);
      const payment = await paymentService.updatePaymentStatusById(id, status, amount_paid);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
      await recordAuditLog({
        userId: req.user?.id,
        action: `payment.status.${status}`,
        entityType: 'payment',
        entityId: payment.id,
      });
      return res.json({ success: true, data: { payment } });
    } catch (err) {
      return this.handleError(res, err, 'Update payment status error');
    }
  }
}

export default new PaymentController();
