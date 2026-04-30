import { Request, Response } from 'express';
import { SupplierPaymentMethodService } from '../services/supplier-payment-method/supplier-payment-method.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { body, param } from 'express-validator';
import { createChapaSubaccount } from '../config/chapa';
import User from '../models/user.model';

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

  async registerChapaSubaccount(req: Request, res: Response) {
    try {
      this.ensureSupplierRole(req);
      const supplierId = (req as any).user.id;
      const { bank_code, account_number, account_name, business_name, split_type, split_value } = req.body;

      const subaccountData = await createChapaSubaccount({
        business_name: business_name || account_name,
        account_name,
        bank_code,
        account_number,
        split_type: split_type || 'percentage',
        split_value: split_value || 0.05
      });

      const subaccountId = subaccountData.data?.subaccount_id || subaccountData.subaccount_id || subaccountData.data;
      if (!subaccountId || typeof subaccountId !== 'string') {
        throw new AppError('Subaccount ID not returned from Chapa', 500);
      }

      await User.update({ chapa_subaccount_id: subaccountId }, { where: { id: supplierId } });

      res.json({ success: true, message: 'Chapa subaccount created', data: { subaccount_id: subaccountId } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        // @ts-ignore
        logger.error('Register Chapa subaccount error:', error);
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
