import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import paymentController from '../controllers/payment.controller';

const router = Router();

router.use(authenticate);

const paymentMethodValues = [
  'cash',
  'credit',
  'cheque',
  'mobile_banking',
  'bank_transfer',
  'chapa',
];

const paymentStatusValues = [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
];

const createPaymentValidation = [
  body('order_id').isUUID().withMessage('Valid order_id is required'),
  body('total_amount').isFloat({ min: 0 }).withMessage('total_amount must be a positive number'),
  body('payment_method')
    .isIn(paymentMethodValues)
    .withMessage('Invalid payment method'),
];

const submitPaymentByOrderValidation = [
  param('orderId').isUUID().withMessage('Valid orderId is required'),
  body('payment_method')
    .optional()
    .isIn(paymentMethodValues)
    .withMessage('Invalid payment method'),
  body('amount_paid')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('amount_paid must be a positive number'),
  body('proof_document_id')
    .optional()
    .isUUID()
    .withMessage('proof_document_id must be a valid UUID'),
  body('notes').optional().isString(),
  body('payment_details').optional().isObject(),
];

const updatePaymentStatusValidation = [
  param('id').isUUID().withMessage('Valid payment id is required'),
  body('status')
    .isIn(paymentStatusValues)
    .withMessage('Invalid payment status'),
  body('amount_paid')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('amount_paid must be a positive number'),
];

router.post('/', validate(createPaymentValidation), paymentController.create);
router.get(
  '/order/:orderId',
  validate([param('orderId').isUUID().withMessage('Valid orderId is required')]),
  paymentController.getByOrderId,
);
router.post(
  '/order/:orderId/submit',
  validate(submitPaymentByOrderValidation),
  paymentController.submitByOrder,
);
router.patch(
  '/:id/status',
  validate(updatePaymentStatusValidation),
  paymentController.updateStatus,
);

export default router;
