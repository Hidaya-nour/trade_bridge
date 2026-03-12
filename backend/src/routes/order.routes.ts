import express from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, authorize, requireVerifiedSupplier } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = express.Router();
const orderController = new OrderController();

// ========================================================================
// Validation Rules
// ========================================================================

const createOrderValidation = [
  body('supplier_id').isUUID().withMessage('Valid supplier ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_id').isUUID().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('payment_method').isString().notEmpty().withMessage('Payment method is required'),
  body('delivery_address').optional().isString(),
  body('notes').optional().isString(),
];

const updateStatusValidation = [
  param('id').isUUID().withMessage('Valid order ID is required'),
  body('status').isIn([
    'pending', 'approved', 'processing', 
    'shipped', 'delivered', 'cancelled'
  ]).withMessage('Invalid order status'),
  body('notes').optional().isString(),
];

const cancelOrderValidation = [
  param('id').isUUID().withMessage('Valid order ID is required'),
  body('reason').optional().isString(),
];

const orderIdValidation = [
  param('id').isUUID().withMessage('Valid order ID is required'),
];

// All order routes require authentication
router.use(authenticate);

// Get all orders (with filters) - Admin only
router.get(
  '/',
  authorize('admin'),
  orderController.getAllOrders
);

// Get my orders (as buyer or supplier)
router.get(
  '/my-orders',
  orderController.getMyOrders
);

// Get orders as buyer
router.get(
  '/as-buyer',
  orderController.getOrdersAsBuyer
);

// Get orders as supplier
router.get(
  '/as-supplier',
  authorize('distributor', 'factory'),
  orderController.getOrdersAsSupplier
);

// Get order statistics
router.get(
  '/stats',
  orderController.getOrderStats
);

// Get single order by ID
router.get(
  '/:id',
  orderIdValidation,
  orderController.getOrderById
);

// Get order summary
router.get(
  '/:id/summary',
  orderIdValidation,
  orderController.getOrderSummary
);


// Create new order
router.post(
  '/',
  validate(createOrderValidation),
  orderController.createOrder
);

// PATCH Routes
// Update order status
router.patch(
  '/:id/status',
  authorize('distributor', 'factory', 'admin'),
  requireVerifiedSupplier,
  validate(updateStatusValidation),
  orderController.updateOrderStatus
);

// Cancel order
router.patch(
  '/:id/cancel',
  validate(cancelOrderValidation),
  orderController.cancelOrder
);

export default router;
