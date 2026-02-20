import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import notificationController from '../controllers/notification.controller';

const router = Router();

router.use(authenticate);

// Get current user's notifications
router.get('/', notificationController.getNotifications);

router.get('/counts', authenticate, notificationController.getNotificationCounts);

// Create a notification (could be used by internal systems)
router.post('/', authenticate, notificationController.createNotification);

// Mark single notification as read
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// Mark all as read
router.patch('/mark-all-read', authenticate, notificationController.markAllRead);

export default router;
