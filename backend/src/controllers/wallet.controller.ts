import { Request, Response } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import Order from '../models/order.model';
import sellerWalletService from '../services/wallet/seller-wallet.service';
import { recordAuditLog } from '../utils/audit';

class WalletController {
  private isSupplier(role?: string) {
    return role === 'distributor' || role === 'factory';
  }

  private isAdmin(role?: string) {
    return role === 'admin';
  }

  private handleError(res: Response, err: unknown, context: string): Response {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    const message = err instanceof Error ? err.message : 'Internal server error';
    logger.error(`${context}: ${message}`, err);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? message : 'Internal server error',
    });
  }

  async getBalance(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      if (!this.isSupplier(req.user.role) && !this.isAdmin(req.user.role)) {
        throw new AppError('Only suppliers can view seller balance', 403);
      }

      const supplierId =
        this.isAdmin(req.user.role) && req.query.supplier_id
          ? String(req.query.supplier_id)
          : req.user.id;

      const balance = await sellerWalletService.getBalance(supplierId);
      return res.json({ success: true, data: balance });
    } catch (err) {
      return this.handleError(res, err, 'Get balance error');
    }
  }

  async requestWithdrawal(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      if (!this.isSupplier(req.user.role)) {
        throw new AppError('Only suppliers can request withdrawals', 403);
      }

      const { amount, bank_provider, bank_account_name, bank_account_number } = req.body;
      const withdrawal = await sellerWalletService.requestWithdrawal(req.user.id, amount, {
        bank_provider,
        bank_account_name,
        bank_account_number,
      });

      await recordAuditLog({
        userId: req.user.id,
        action: 'wallet.withdraw.requested',
        entityType: 'withdrawal',
        entityId: withdrawal.id,
      });

      return res.status(201).json({ success: true, data: { withdrawal } });
    } catch (err) {
      return this.handleError(res, err, 'Request withdrawal error');
    }
  }

  async listMyWithdrawals(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      if (!this.isSupplier(req.user.role)) {
        throw new AppError('Only suppliers can view withdrawals', 403);
      }

      const withdrawals = await sellerWalletService.listWithdrawalsForSupplier(req.user.id);
      return res.json({ success: true, data: { withdrawals } });
    } catch (err) {
      return this.handleError(res, err, 'List withdrawals error');
    }
  }

  async listPendingWithdrawals(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      if (!this.isAdmin(req.user.role)) {
        throw new AppError('Admin access required', 403);
      }

      const withdrawals = await sellerWalletService.listPendingWithdrawals();
      return res.json({ success: true, data: { withdrawals } });
    } catch (err) {
      return this.handleError(res, err, 'List pending withdrawals error');
    }
  }

  async approveWithdrawal(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      if (!this.isAdmin(req.user.role)) {
        throw new AppError('Admin access required', 403);
      }

      const { id } = req.params;
      const { admin_notes } = req.body;
      const withdrawal = await sellerWalletService.approveWithdrawal(
        id,
        req.user.id,
        admin_notes,
      );

      await recordAuditLog({
        userId: req.user.id,
        action: 'wallet.withdraw.approved',
        entityType: 'withdrawal',
        entityId: withdrawal.id,
      });

      return res.json({ success: true, data: { withdrawal } });
    } catch (err) {
      return this.handleError(res, err, 'Approve withdrawal error');
    }
  }

  async settleOrder(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      const { orderId } = req.params;
      const order = await Order.findByPk(orderId);
      if (!order) throw new AppError('Order not found', 404);

      if (
        !this.isAdmin(req.user.role) &&
        order.supplier_id !== req.user.id
      ) {
        throw new AppError('You cannot settle this order', 403);
      }

      const result = await sellerWalletService.settleOrderFunds(orderId);
      return res.json({ success: true, data: { payment: result } });
    } catch (err) {
      return this.handleError(res, err, 'Settle order funds error');
    }
  }

  async rejectWithdrawal(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError('Authentication required', 401);
      if (!this.isAdmin(req.user.role)) {
        throw new AppError('Admin access required', 403);
      }

      const { id } = req.params;
      const { admin_notes } = req.body;
      const withdrawal = await sellerWalletService.rejectWithdrawal(
        id,
        req.user.id,
        admin_notes,
      );

      await recordAuditLog({
        userId: req.user.id,
        action: 'wallet.withdraw.rejected',
        entityType: 'withdrawal',
        entityId: withdrawal.id,
      });

      return res.json({ success: true, data: { withdrawal } });
    } catch (err) {
      return this.handleError(res, err, 'Reject withdrawal error');
    }
  }
}

export default new WalletController();
