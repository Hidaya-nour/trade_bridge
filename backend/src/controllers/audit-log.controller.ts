import { Request, Response } from 'express';
import { AuditLogService } from '../services/audit-log/audit-log.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { body, param, query } from 'express-validator';

const auditLogService = new AuditLogService();

export class AuditLogController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      data.user_id = (req as any).user.id;
      data.ip_address = req.ip || req.connection.remoteAddress;

      const log = await auditLogService.createLog(data);
      res.status(201).json({ success: true, data: log });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Create audit log error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getUserLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const limit = parseInt(req.query.limit as string) || 100;

      const logs = await auditLogService.getUserLogs(userId, limit);
      res.json({ success: true, data: logs });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get user logs error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getEntityLogs(req: Request, res: Response): Promise<void> {
    try {
      const { entityType, entityId } = req.params;
      const logs = await auditLogService.getEntityLogs(entityType, entityId);
      res.json({ success: true, data: logs });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get entity logs error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getLogsByAction(req: Request, res: Response): Promise<void> {
    try {
      const { action } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const logs = await auditLogService.getLogsByAction(action, limit);
      res.json({ success: true, data: logs });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get logs by action error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getLogsByEntityType(req: Request, res: Response): Promise<void> {
    try {
      const { entityType } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;

      const logs = await auditLogService.getLogsByEntityType(entityType, limit);
      res.json({ success: true, data: logs });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get logs by entity type error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getLogsInTimeRange(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime } = req.query;
      const limit = parseInt(req.query.limit as string) || 500;

      if (!startTime || !endTime) {
        res.status(400).json({ success: false, message: 'startTime and endTime are required' });
        return;
      }

      const start = new Date(startTime as string);
      const end = new Date(endTime as string);

      const logs = await auditLogService.getLogsInTimeRange(start, end, limit);
      res.json({ success: true, data: logs });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get logs in time range error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  static createValidation = [
    body('action').isString().notEmpty(),
    body('entity_type').isString().notEmpty(),
    body('entity_id').isUUID(),
    body('ip_address').optional().isIP()
  ];

  static entityValidation = [
    param('entityType').isString().notEmpty(),
    param('entityId').isUUID()
  ];

  static actionValidation = [param('action').isString().notEmpty()];
  static entityTypeValidation = [param('entityType').isString().notEmpty()];
}