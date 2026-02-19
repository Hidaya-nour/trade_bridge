import { Request, Response } from 'express';
import { CartService } from '../services/cart/cart.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { AddToCartDTO, UpdateCartItemDTO } from '../types/cart.types';
import { body, param, query } from 'express-validator';

const cartService = new CartService();

export class CartController {
  // ========================================================================
  // GET CART
  // ========================================================================

  async getCart(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const cart = await cartService.getCart(userId);

      res.json({
        success: true,
        data: cart || {
          id: null,
          user_id: userId,
          items: [],
          total_items: 0,
          total_price: 0,
          created_at: null,
          updated_at: null
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get cart error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // ========================================================================
  // ADD TO CART
  // ========================================================================

  async addToCart(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const itemData: AddToCartDTO = req.body;

      const cart = await cartService.addToCart(userId, itemData);

      res.json({
        success: true,
        data: cart,
        message: 'Item added to cart successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // ========================================================================
  // UPDATE CART ITEM
  // ========================================================================

  async updateCartItem(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { productId } = req.params;
      const updateData: UpdateCartItemDTO = req.body;

      const cart = await cartService.updateCartItem(userId, productId, updateData);

      res.json({
        success: true,
        data: cart,
        message: 'Cart item updated successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Update cart item error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // ========================================================================
  // REMOVE FROM CART
  // ========================================================================

  async removeFromCart(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { productId } = req.params;

      const cart = await cartService.removeFromCart(userId, productId);

      res.json({
        success: true,
        data: cart,
        message: 'Item removed from cart successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Remove from cart error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // ========================================================================
  // CLEAR CART
  // ========================================================================

  async clearCart(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const result = await cartService.clearCart(userId);

      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Clear cart error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // ========================================================================
  // VALIDATE CART FOR CHECKOUT
  // ========================================================================

  async validateCart(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const result = await cartService.validateCartForCheckout(userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Validate cart error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }
}