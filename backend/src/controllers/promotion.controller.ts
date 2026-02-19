import { Request, Response } from 'express';
import { PromotionService } from '../services/promotion/promotion.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { CreatePromotionDTO, UpdatePromotionDTO } from '../types/promotion.types';
import { body, param } from 'express-validator';

const promotionService = new PromotionService();

export class PromotionController {
  // ========================================================================
  // CREATE PROMOTION
  // ========================================================================

  async createPromotion(req: Request, res: Response) {
    try {
      const data: CreatePromotionDTO = req.body;

      const promotion = await promotionService.createPromotion(data);

      res.status(201).json({
        success: true,
        message: 'Promotion created successfully',
        data: promotion
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Create promotion error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // ========================================================================
  // GET ALL PROMOTIONS
  // ========================================================================

  async getAllPromotions(_req: Request, res: Response) {
    try {
      const promotions = await promotionService.getAllPromotions();

      res.json({
        success: true,
        data: promotions
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get all promotions error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // ========================================================================
  // GET PROMOTION BY ID
  // ========================================================================

  async getPromotionById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const promotion = await promotionService.getPromotionById(id);

      if (!promotion) {
        res.status(404).json({ success: false, message: 'Promotion not found' });
        return;
      }

      res.json({
        success: true,
        data: promotion
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get promotion by ID error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // ========================================================================
  // UPDATE PROMOTION
  // ========================================================================

  async updatePromotion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdatePromotionDTO = req.body;

      const promotion = await promotionService.updatePromotion(id, data);

      res.json({
        success: true,
        message: 'Promotion updated successfully',
        data: promotion
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Update promotion error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // ========================================================================
  // DEACTIVATE PROMOTION
  // ========================================================================

  async deactivatePromotion(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await promotionService.deactivatePromotion(id);

      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Deactivate promotion error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // ========================================================================
  // VALIDATION RULES
  // ========================================================================

  static createPromotionValidation = [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('discount_type').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    body('discount_value').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
    body('start_date').isISO8601().withMessage('Invalid start date'),
    body('end_date').isISO8601().withMessage('Invalid end date'),
    body('target_role').isIn(['retailer', 'distributor', 'factory', 'driver', 'admin', 'all']).withMessage('Invalid target role'),
    body('target_region').isString().notEmpty().withMessage('Target region is required'),
    body('minimum_order_amount').optional().isFloat({ min: 0 }).withMessage('Minimum order amount must be positive')
  ];

  static updatePromotionValidation = [
    param('id').isUUID().withMessage('Invalid promotion ID'),
    body('name').optional().isString().notEmpty().withMessage('Name cannot be empty'),
    body('discount_type').optional().isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    body('discount_value').optional().isFloat({ min: 0 }).withMessage('Discount value must be positive'),
    body('start_date').optional().isISO8601().withMessage('Invalid start date'),
    body('end_date').optional().isISO8601().withMessage('Invalid end date'),
    body('target_role').optional().isIn(['retailer', 'distributor', 'factory', 'driver', 'admin', 'all']).withMessage('Invalid target role'),
    body('target_region').optional().isString().notEmpty().withMessage('Target region cannot be empty'),
    body('minimum_order_amount').optional().isFloat({ min: 0 }).withMessage('Minimum order amount must be positive'),
    body('is_active').optional().isBoolean().withMessage('is_active must be boolean')
  ];

  static promotionIdValidation = [
    param('id').isUUID().withMessage('Invalid promotion ID')
  ];
}