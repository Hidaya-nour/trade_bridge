import express from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';

const router = express.Router();
const cartController = new CartController();


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
router.post('/', cartController.addToCart);

// ========================================================================
// PUT Routes
// ========================================================================

// PUT /api/cart/:productId - Update cart item quantity
router.put('/:productId', cartController.updateCartItem);

// ========================================================================
// DELETE Routes
// ========================================================================

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId',  cartController.removeFromCart);

// DELETE /api/cart - Clear entire cart
router.delete('/', cartController.clearCart);

export default router;