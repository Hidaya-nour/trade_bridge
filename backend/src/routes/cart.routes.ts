import express from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';

const router = express.Router();
const cartController = new CartController();

// All cart routes require authentication
router.use(authenticate);
router.get('/', cartController.getCart);
router.get('/validate', cartController.validateCart);
router.post('/', cartController.addToCart);
router.put('/items/:itemId', cartController.updateCartItem);
router.delete('/:itemId',  cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;