import { Request, Response } from 'express';
import notificationService from '../services/notification/notification.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class NotificationController {
  getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id as string;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const type = req.query.type as string | undefined;
      const is_read =
        typeof req.query.is_read === 'string'
          ? Number(req.query.is_read)
          : undefined;

      const result = await notificationService.getUserNotifications(userId, {
        page,
        limit,
        type,
        is_read,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Get notifications error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  getNotificationCounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id as string;
      const counts = await notificationService.getNotificationCounts(userId);
      res.json({ success: true, data: counts });
    } catch (error) {
      logger.error('Get notification counts error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  createNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = req.body;
      const created = await notificationService.createNotification(payload);
      res.status(201).json({ success: true, data: { notification: created } });
    } catch (error) {
      logger.error('Create notification error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id as string;
      const ok = await notificationService.markAsRead(id, userId);
      if (!ok) throw new AppError('Notification not found', 404);
      res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  markAllRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id as string;
      await notificationService.markAllRead(userId);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      logger.error('Mark all read error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  deleteNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id as string;
      const ok = await notificationService.deleteNotification(id, userId);
      if (!ok) throw new AppError('Notification not found', 404);
      res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Delete notification error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  clearAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id as string;
      const deletedCount = await notificationService.clearAll(userId);
      res.json({
        success: true,
        message: 'All notifications deleted',
        data: { deletedCount },
      });
    } catch (error) {
      logger.error('Clear notifications error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
}

export default new NotificationController();

