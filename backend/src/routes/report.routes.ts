import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import reportController from '../controllers/report.controller';

const router = Router();

// Create report (authenticated)
router.post(
  '/',
  authenticate,
  validate([
    body('reported_user_id').isUUID().withMessage('reported_user_id must be a valid UUID'),
    body('reason').isString().trim().notEmpty().withMessage('reason is required'),
    body('description').optional().isString(),
    body('order_id').optional().isUUID().withMessage('order_id must be a valid UUID'),
  ]),
  (req, res) => reportController.create(req, res),
);

// Admin endpoints (auth required; controller enforces admin role)
router.get('/admin/summary', authenticate, (req, res) => reportController.adminSummary(req, res));

router.get(
  '/admin/user/:userId',
  authenticate,
  validate([
    param('userId').isUUID().withMessage('userId must be a valid UUID'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  (req, res) => reportController.adminReportsForUser(req, res),
);

export default router;

