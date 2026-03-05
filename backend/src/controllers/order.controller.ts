import { Request, Response } from 'express';
import { OrderService } from '../services/order/order.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { OrderFilters } from '../types/order.types';

const orderService = new OrderService();

export class OrderController {
  // ========================================================================
  // GET ORDERS
  // ========================================================================

  async getAllOrders(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const filters: OrderFilters = {
        status: req.query.status as any,
        from_date: req.query.fromDate as string,
        to_date: req.query.toDate as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC',
      };

      if (req.query.buyerId) filters.buyer_id = req.query.buyerId as string;
      if (req.query.supplierId) filters.supplier_id = req.query.supplierId as string;

      const result = await orderService.getAllOrders(filters, userId, userRole);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;

      const order = await orderService.getOrderById(id, userId, userRole);
      
      res.json({
        success: true,
        data: { order }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get order error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getMyOrders(req: Request, res: Response) {
    try {
      const userId = req.user?.id!;
      const filters: OrderFilters = {
        status: req.query.status as any,
        from_date: req.query.fromDate as string,
        to_date: req.query.toDate as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC',
      };

      const result = await orderService.getMyOrders(userId, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get my orders error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getOrdersAsBuyer(req: Request, res: Response) {
    try {
      const userId = req.user?.id!;
      const filters: OrderFilters = {
        status: req.query.status as any,
        from_date: req.query.fromDate as string,
        to_date: req.query.toDate as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC',
      };

      const result = await orderService.getOrdersAsBuyer(userId, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get buyer orders error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getOrdersAsSupplier(req: Request, res: Response) {
    try {
      const userId = req.user?.id!;
      const filters: OrderFilters = {
        status: req.query.status as any,
        from_date: req.query.fromDate as string,
        to_date: req.query.toDate as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC',
      };

      const result = await orderService.getOrdersAsSupplier(userId, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get supplier orders error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // CREATE ORDER
  async createOrder(req: Request, res: Response) {
    try {
      const buyerId = req.user?.id!;
      const orderData = req.body;

      const order = await orderService.createOrder(buyerId, orderData);
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // UPDATE ORDER STATUS
  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;
      const { status, notes } = req.body;

      const order = await orderService.updateOrderStatus(id, userId, userRole, {
        status,
        notes
      });
      
      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: { order }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // CANCEL ORDER
  async cancelOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;
      const { reason } = req.body;

      const result = await orderService.cancelOrder(id, userId, userRole, reason);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Cancel order error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // ORDER STATS
  async getOrderStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const stats = await orderService.getOrderStats(userId, userRole);
      
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get order stats error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getOrderSummary(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id!;
      const userRole = req.user?.role!;

      const summary = await orderService.getOrderSummary(id, userId, userRole);
      
      res.json({
        success: true,
        data: { summary }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get order summary error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }
}