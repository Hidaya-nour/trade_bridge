import { Request, Response } from 'express';
import { body, param } from 'express-validator';

import { BroadcastService } from '../services/broadcast/broadcast.service';
import {
  BroadcastOwnerRole,
  CreateBroadcastDTO,
  UpdateBroadcastDTO,
} from '../types/broadcast.types';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

const broadcastService = new BroadcastService();

const ensureOwnerRole = (role?: string): BroadcastOwnerRole => {
  if (!role || !['factory', 'distributor', 'admin'].includes(role)) {
    throw new AppError('Only factory and distributor accounts can manage broadcasts', 403);
  }

  return role as BroadcastOwnerRole;
};

export class BroadcastController {
  async createBroadcast(req: Request, res: Response) {
    try {
      const ownerId = req.user?.id;
      const ownerRole = ensureOwnerRole(req.user?.role);

      if (!ownerId) {
        throw new AppError('Authentication required', 401);
      }

      const data: CreateBroadcastDTO = req.body;
      const broadcast = await broadcastService.createBroadcast(ownerId, ownerRole, data);

      res.status(201).json({
        success: true,
        message: 'Broadcast created successfully',
        data: broadcast,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Create broadcast error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getMyBroadcasts(req: Request, res: Response) {
    try {
      const ownerId = req.user?.id;
      const ownerRole = ensureOwnerRole(req.user?.role);

      if (!ownerId) {
        throw new AppError('Authentication required', 401);
      }

      const broadcasts = await broadcastService.getBroadcastsForOwner(ownerId, ownerRole);

      res.json({
        success: true,
        data: broadcasts,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get broadcasts error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getBroadcastById(req: Request, res: Response) {
    try {
      const ownerId = req.user?.id;
      const ownerRole = ensureOwnerRole(req.user?.role);

      if (!ownerId) {
        throw new AppError('Authentication required', 401);
      }

      const broadcast = await broadcastService.getBroadcastById(
        req.params.id,
        ownerId,
        ownerRole,
      );

      if (!broadcast) {
        res.status(404).json({ success: false, message: 'Broadcast not found' });
        return;
      }

      res.json({
        success: true,
        data: broadcast,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get broadcast by id error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async updateBroadcast(req: Request, res: Response) {
    try {
      const ownerId = req.user?.id;
      const ownerRole = ensureOwnerRole(req.user?.role);

      if (!ownerId) {
        throw new AppError('Authentication required', 401);
      }

      const data: UpdateBroadcastDTO = req.body;
      const broadcast = await broadcastService.updateBroadcast(
        req.params.id,
        ownerId,
        ownerRole,
        data,
      );

      res.json({
        success: true,
        message: 'Broadcast updated successfully',
        data: broadcast,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Update broadcast error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async deleteBroadcast(req: Request, res: Response) {
    try {
      const ownerId = req.user?.id;
      const ownerRole = ensureOwnerRole(req.user?.role);

      if (!ownerId) {
        throw new AppError('Authentication required', 401);
      }

      const result = await broadcastService.deleteBroadcast(
        req.params.id,
        ownerId,
        ownerRole,
      );

      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Delete broadcast error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  static createBroadcastValidation = [
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('description').isString().notEmpty().withMessage('Description is required'),
    body('summary').optional({ nullable: true }).isString(),
    body('type')
      .isIn(['discount', 'bogo', 'free-shipping', 'bundle', 'clearance'])
      .withMessage('Invalid broadcast type'),
    body('discount_type')
      .optional({ nullable: true })
      .isIn(['percentage', 'fixed'])
      .withMessage('Invalid discount type'),
    body('discount_value')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('Discount value must be zero or greater'),
    body('min_order')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('Minimum order must be zero or greater'),
    body('max_discount')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('Maximum discount must be zero or greater'),
    body('start_date').isISO8601().withMessage('Invalid start date'),
    body('end_date').isISO8601().withMessage('Invalid end date'),
    body('status')
      .isIn(['draft', 'scheduled', 'active', 'expired', 'cancelled'])
      .withMessage('Invalid status'),
    body('created_by').isString().notEmpty().withMessage('created_by is required'),
    body('sent_count')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sent_count must be zero or greater'),
    body('viewed_count')
      .optional()
      .isInt({ min: 0 })
      .withMessage('viewed_count must be zero or greater'),
    body('redeemed_count')
      .optional()
      .isInt({ min: 0 })
      .withMessage('redeemed_count must be zero or greater'),
    body('code').optional({ nullable: true }).isString(),
    body('priority')
      .isIn(['high', 'medium', 'low'])
      .withMessage('Invalid priority'),
    body('target_audience')
      .optional()
      .isIn(['all', 'segment', 'specific'])
      .withMessage('Invalid target audience'),
    body('audience_segments').optional().isArray().withMessage('Audience segments must be an array'),
  ];

  static updateBroadcastValidation = [
    param('id').isUUID().withMessage('Invalid broadcast id'),
    body('title').optional().isString().notEmpty().withMessage('Title cannot be empty'),
    body('description')
      .optional()
      .isString()
      .notEmpty()
      .withMessage('Description cannot be empty'),
    body('summary').optional({ nullable: true }).isString(),
    body('type')
      .optional()
      .isIn(['discount', 'bogo', 'free-shipping', 'bundle', 'clearance'])
      .withMessage('Invalid broadcast type'),
    body('discount_type')
      .optional({ nullable: true })
      .isIn(['percentage', 'fixed'])
      .withMessage('Invalid discount type'),
    body('discount_value')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('Discount value must be zero or greater'),
    body('min_order')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('Minimum order must be zero or greater'),
    body('max_discount')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('Maximum discount must be zero or greater'),
    body('start_date').optional().isISO8601().withMessage('Invalid start date'),
    body('end_date').optional().isISO8601().withMessage('Invalid end date'),
    body('status')
      .optional()
      .isIn(['draft', 'scheduled', 'active', 'expired', 'cancelled'])
      .withMessage('Invalid status'),
    body('created_by').optional().isString().notEmpty().withMessage('created_by cannot be empty'),
    body('sent_count')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sent_count must be zero or greater'),
    body('viewed_count')
      .optional()
      .isInt({ min: 0 })
      .withMessage('viewed_count must be zero or greater'),
    body('redeemed_count')
      .optional()
      .isInt({ min: 0 })
      .withMessage('redeemed_count must be zero or greater'),
    body('code').optional({ nullable: true }).isString(),
    body('priority')
      .optional()
      .isIn(['high', 'medium', 'low'])
      .withMessage('Invalid priority'),
    body('target_audience')
      .optional()
      .isIn(['all', 'segment', 'specific'])
      .withMessage('Invalid target audience'),
    body('audience_segments').optional().isArray().withMessage('Audience segments must be an array'),
  ];

  static updateBroadcastStatusValidation = [
    param('id').isUUID().withMessage('Invalid broadcast id'),
    body('status')
      .isIn(['draft', 'scheduled', 'active', 'expired', 'cancelled'])
      .withMessage('Invalid status'),
  ];

  static broadcastIdValidation = [param('id').isUUID().withMessage('Invalid broadcast id')];
}
