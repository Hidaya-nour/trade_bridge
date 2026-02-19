import express from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';

const router = express.Router();
const cartController = new CartController();

// ========================================================================
// Validation Rules
// ========================================================================

const addToCartValidation = [
  body('product_id').isUUID().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const updateCartItemValidation = [
  param('productId').isUUID().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or greater'),
];

const productIdValidation = [
  param('productId').isUUID().withMessage('Valid product ID is required'),
];

// ========================================================================
// Routes
// ========================================================================

// All cart routes require authentication
router.use(authenticate);

// ========================================================================
// GET Routes
// ========================================================================

// GET /api/cart - Get user's cart
router.get('/', cartController.getCart);

// GET /api/cart/validate - Validate cart for checkout
router.get('/validate', cartController.validateCart);

// ========================================================================
// POST Routes
// ========================================================================

// POST /api/cart - Add item to cart
router.post('/', validate(addToCartValidation), cartController.addToCart);

// ========================================================================
// PUT Routes
// ========================================================================

// PUT /api/cart/:productId - Update cart item quantity
router.put('/:productId', validate(updateCartItemValidation), cartController.updateCartItem);

// ========================================================================
// DELETE Routes
// ========================================================================

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', validate(productIdValidation), cartController.removeFromCart);

// DELETE /api/cart - Clear entire cart
router.delete('/', cartController.clearCart);

export default router;