import { Request, Response } from 'express';
import { InventoryMovementService } from '../services/inventory-movement/inventory-movement.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { body, param } from 'express-validator';

const inventoryService = new InventoryMovementService();

export class InventoryMovementController {
  // Create inventory movement
  async createMovement(req: Request, res: Response) {
    try {
      const { product_id, movement_type, quantity, reason } = req.body;
      const user_id = (req as any).user.id; // From auth middleware

      const movement = await inventoryService.createMovement({
        product_id,
        movement_type,
        quantity,
        reason,
        user_id
      });

      res.status(201).json({ success: true, data: { movement } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Create inventory movement error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get all inventory movements
  async getAllMovements(req: Request, res: Response) {
    try {
      const filters = {
        product_id: req.query.productId as string,
        movement_type: req.query.movementType as 'in' | 'out' | 'adjustment',
        user_id: req.query.userId as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20
      };

      const result = await inventoryService.getAllMovements(filters);
      res.json({
        success: true,
        data: result.movements,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.total,
          pages: Math.ceil(result.total / filters.limit)
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get inventory movements error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get inventory movement by ID
  async getMovementById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const movement = await inventoryService.getMovementById(id);

      if (!movement) {
        return res.status(404).json({ success: false, message: 'Inventory movement not found' });
      }

      res.json({ success: true, data: { movement } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get inventory movement error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get movements by product
  async getMovementsByProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const movements = await inventoryService.getMovementsByProduct(productId);

      res.json({ success: true, data: movements });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get movements by product error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Validation rules
  static createMovementValidation = [
    body('product_id').isUUID().withMessage('Invalid product ID'),
    body('movement_type').isIn(['in', 'out', 'adjustment']).withMessage('Invalid movement type'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason must be a string with max 500 characters')
  ];

  static movementIdValidation = [
    param('id').isUUID().withMessage('Invalid movement ID')
  ];

  static productIdValidation = [
    param('productId').isUUID().withMessage('Invalid product ID')
  ];
}