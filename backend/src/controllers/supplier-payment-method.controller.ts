import { Request, Response } from 'express';
import { SupplierPaymentMethodService } from '../services/supplier-payment-method/supplier-payment-method.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { body, param } from 'express-validator';

const paymentMethodService = new SupplierPaymentMethodService();

export class SupplierPaymentMethodController {
  private ensureSupplierRole(req: Request): void {
    const role = (req as any).user?.role;
    if (role !== 'factory' && role !== 'distributor') {
      throw new AppError('Only factory and distributor accounts can manage supplier payment methods', 403);
    }
  }

  async create(req: Request, res: Response) {
    try {
      this.ensureSupplierRole(req);
      const data = req.body;
      data.supplier_id = (req as any).user.id;

      const paymentMethod = await paymentMethodService.createPaymentMethod(data);
      res.status(201).json({ success: true, data: paymentMethod });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Create payment method error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getSupplierPaymentMethods(req: Request, res: Response) {
    try {
      this.ensureSupplierRole(req);
      const supplierId = (req as any).user.id;
      const paymentMethods = await paymentMethodService.getSupplierPaymentMethods(supplierId);
      res.json({ success: true, data: paymentMethods });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get payment methods error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getActivePaymentMethods(req: Request, res: Response) {
    try {
      this.ensureSupplierRole(req);
      const supplierId = (req as any).user.id;
      const paymentMethods = await paymentMethodService.getActiveSupplierPaymentMethods(supplierId);
      res.json({ success: true, data: paymentMethods });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get active payment methods error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getPrimaryPaymentMethod(req: Request, res: Response) {
    try {
      this.ensureSupplierRole(req);
      const supplierId = (req as any).user.id;
      const paymentMethod = await paymentMethodService.getPrimaryPaymentMethod(supplierId);
      res.json({ success: true, data: paymentMethod });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get primary payment method error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getActivePaymentMethodsForSupplier(req: Request, res: Response) {
    try {
      const { supplierId } = req.params;
      if (!supplierId) {
        throw new AppError('Supplier ID is required', 400);
      }

      const paymentMethods = await paymentMethodService.getActiveSupplierPaymentMethods(supplierId);
      res.json({ success: true, data: paymentMethods });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get active payment methods for supplier error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      this.ensureSupplierRole(req);
      const { id } = req.params;
      const data = req.body;
      await paymentMethodService.updatePaymentMethod(id, data);
      res.json({ success: true, message: 'Payment method updated' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Update payment method error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async setPrimary(req: Request, res: Response) {
    try {
      this.ensureSupplierRole(req);
      const { id } = req.params;
      const supplierId = (req as any).user.id;
      await paymentMethodService.setPrimaryPaymentMethod(supplierId, id);
      res.json({ success: true, message: 'Primary payment method set' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Set primary payment method error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async remove(req: Request, res: Response) {
    try {
      this.ensureSupplierRole(req);
      const { id } = req.params;
      await paymentMethodService.deletePaymentMethod(id);
      res.json({ success: true, message: 'Payment method deleted' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Delete payment method error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  static createValidation = [
    body('method_type').isIn(['mobile_money', 'credit_card', 'mobile_banking', 'chapa']),
    body('provider_name').isString().notEmpty(),
    body('account_holder_name').isString().notEmpty(),
    body('account_identifier').isString().notEmpty(),
    body('account_display').optional().isString(),
    body('is_primary').optional().isBoolean()
  ];

  static idValidation = [param('id').isUUID().withMessage('Invalid payment method ID')];
}
