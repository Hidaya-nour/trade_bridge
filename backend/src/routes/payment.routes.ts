import { Router } from 'express';
import { body, param } from 'express-validator';
import paymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Public callback endpoint for app-payment redirects/webhooks.
router.get('/chapa/callback', (req, res) => paymentController.chapaCallback(req, res));
router.post('/chapa/callback', (req, res) => paymentController.chapaCallback(req, res));

// Public return endpoint for Chapa redirects
router.get('/chapa/return', (req, res) => paymentController.chapaReturn(req, res));

router.use(authenticate);

const paymentMethodValues = [
  'app_payment',
  'mobile_banking',
  'credit',
];

const paymentStatusValues = [
  'pending',
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

router.post('/', validate(createPaymentValidation), (req, res) => paymentController.create(req, res));
router.get(
  '/order/:orderId',
  validate([param('orderId').isUUID().withMessage('Valid orderId is required')]),
  (req, res) => paymentController.getByOrderId(req, res),
);
router.post(
  '/order/:orderId/submit',
  validate(submitPaymentByOrderValidation),
  (req, res) => paymentController.submitByOrder(req, res),
);
router.patch(
  '/:id/status',
  validate(updatePaymentStatusValidation),
  (req, res) => paymentController.updateStatus(req, res),
);
router.post('/chapa/subaccount', (req, res) => paymentController.registerSubaccount(req, res));

export default router;
