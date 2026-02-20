import { Request, Response } from 'express';
import notificationService from '../services/notification/notification.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await notificationService.getUserNotifications(userId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Get notifications error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
 async getNotificationCounts(req: Request, res: Response) {
  try {
    const userId = req.user?.id as string;
    const counts = await notificationService.getNotificationCounts(userId);
    res.json({ success: true, data: counts });
  } catch (error) {
    logger.error('Get notification counts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
  async createNotification(req: Request, res: Response) {
    try {
      const payload = req.body;
      const created = await notificationService.createNotification(payload);
      res.status(201).json({ success: true, data: { notification: created } });
    } catch (error) {
      logger.error('Create notification error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id as string;
      const ok = await notificationService.markAsRead(id, userId);
      if (!ok) throw new AppError('Not found or no permission', 404);
      res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async markAllRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id as string;
      await notificationService.markAllRead(userId);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      logger.error('Mark all read error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new NotificationController();
