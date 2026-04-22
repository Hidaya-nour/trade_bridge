import { Router } from 'express';
import { query, param, body } from 'express-validator';
import { authenticateAllowPending } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import notificationController from '../controllers/notification.controller';

const router = Router();

router.use(authenticateAllowPending);

router.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isString(),
    query('is_read').optional().isIn(['0', '1']),
  ]),
  notificationController.getNotifications
);

router.get('/counts', notificationController.getNotificationCounts);

router.post(
  '/',
  validate([
    body('user_id').isUUID().withMessage('Valid user_id is required'),
    body('type').isString().notEmpty(),
    body('title').isString().notEmpty(),
    body('message').isString().notEmpty(),
  ]),
  notificationController.createNotification
);

router.patch(
  '/:id/read',
  validate([param('id').isUUID().withMessage('Invalid notification id')]),
  notificationController.markAsRead
);

router.patch('/mark-all-read', notificationController.markAllRead);

router.delete(
  '/:id',
  validate([param('id').isUUID().withMessage('Invalid notification id')]),
  notificationController.deleteNotification
);

router.delete('/clear-all', notificationController.clearAll);

export default router;
