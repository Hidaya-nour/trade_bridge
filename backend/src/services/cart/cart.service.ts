import { CartRepository, CartItemRepository } from '../../repositories/cart.repository';
import { ProductRepository } from '../../repositories/product.repository';
import { AppError } from '../../utils/errors';
import { AddToCartDTO, CartWithItems } from '../../types/cart.types';
import logger from '../../utils/logger';

export class CartService {
  private cartRepo = new CartRepository();
  private cartItemRepo = new CartItemRepository();
  private productRepo = new ProductRepository();

  // GET CART
  async getCart(userId: string): Promise<CartWithItems | null> {
    return this.cartRepo.findCartWithItems(userId);
  }

  // ADD TO CART
  async addToCart(userId: string, itemData: AddToCartDTO): Promise<CartWithItems> {
    const { product_id, quantity } = itemData;

    // Validate product exists and is available
    const product = await this.productRepo.findById(product_id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!product.is_available) {
      throw new AppError('Product is not available', 400);
    }

    if (quantity < product.min_order_amount) {
      throw new AppError(`Minimum order quantity is ${product.min_order_amount}`, 400);
    }

    if (quantity > product.stock_quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    // Get or create cart
    const cart = await this.cartRepo.getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItem = await this.cartItemRepo.findByCartAndProduct(cart.id, product_id);

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock_quantity) {
        throw new AppError('Insufficient stock for requested quantity', 400);
      }
      await this.cartItemRepo.updateQuantity(existingItem.id, newQuantity);
    } else {
      // Add new item
      await this.cartItemRepo.create({
        cart_id: cart.id,
        product_id,
        quantity
      } as any);
    }

    // Update cart timestamp
    await cart.update({ updated_at: new Date() });

    logger.info(`User ${userId} added ${quantity} of product ${product_id} to cart`);

    // Return updated cart
    const updatedCart = await this.cartRepo.findCartWithItems(userId);
    if (!updatedCart) {
      throw new AppError('Failed to retrieve updated cart', 500);
    }

    return updatedCart;
  }

  // UPDATE CART ITEM 
  async updateCartItemById(userId: string, itemId: string, quantity: number): Promise<CartWithItems | null> {
    const cartItem = await this.cartItemRepo.findById(itemId);
    if (!cartItem) return null;

    const cart = await this.cartRepo.getOrCreateCart(userId);
    if (cartItem.cart_id !== cart.id) {
      throw new AppError('You do not have permission to update this cart item', 403);
    }

    if (quantity <= 0) {
      await cartItem.destroy();
      await cart.update({ updated_at: new Date() });
      return this.cartRepo.findCartWithItems(userId);
    }

    const product = await this.productRepo.findById(cartItem.product_id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!product.is_available) {
      throw new AppError('Product is not available', 400);
    }

    if (quantity < product.min_order_amount) {
      throw new AppError(`Minimum order quantity is ${product.min_order_amount}`, 400);
    }

    if (quantity > product.stock_quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    await cartItem.update({ quantity });
    await cart.update({ updated_at: new Date() });

    return this.cartRepo.findCartWithItems(userId);
  }
  // REMOVE FROM CART
  async removeFromCart(userId: string, itemId: string): Promise<CartWithItems> {
    // Get cart
    // const cart = await this.cartRepo.getOrCreateCart(userId);

    // Remove item
    const deleted = await this.cartItemRepo.removeItem( itemId);
    if (deleted === 0) {
      throw new AppError('Item not found in cart', 404);
    }

    // Update cart timestamp
    // await cart.update({ updated_at: new Date() });

    logger.info(`User ${userId} removed product ${itemId} from cart`);

    // Return updated cart
    const updatedCart = await this.cartRepo.findCartWithItems(userId);
    if (!updatedCart) {
      throw new AppError('Failed to retrieve updated cart', 500);
    }

    return updatedCart;
  }

  // CLEAR CART
  async clearCart(userId: string): Promise<{ success: boolean; message: string }> {
    // Get cart
    const cart = await this.cartRepo.getOrCreateCart(userId);
    // Clear all items
    await this.cartRepo.clearCart(cart.id);
    // Update cart timestamp
    await cart.update({ updated_at: new Date() });
    logger.info(`User ${userId} cleared their cart`);
    return {
      success: true,
      message: 'Cart cleared successfully'
    };
  }

  // VALIDATE CART FOR CHECKOUT
  async validateCartForCheckout(userId: string): Promise<{
    valid: boolean;
    issues: string[];
    cart: CartWithItems;
  }> {
    const cart = await this.cartRepo.findCartWithItems(userId);
    if (!cart || cart.items.length === 0) {
      return {
        valid: false,
        issues: ['Cart is empty'],
        cart: cart || { id: '', user_id: userId, items: [], total_items: 0, original_total: 0, discount_total: 0, final_total: 0, applied_promotions: [], created_at: new Date(), updated_at: new Date() }
      };
    }

    const issues: string[] = [];

    for (const item of cart.items) {
      if (!item.product) {
        issues.push(`Product ${item.product_id} not found`);
        continue;
      }

      if (!item.product.is_available) {
        issues.push(`Product ${item.product.name} is not available`);
      }

      if (item.quantity > item.product.stock_quantity) {
        issues.push(`Insufficient stock for ${item.product.name}. Available: ${item.product.stock_quantity}`);
      }

      if (item.quantity < item.product.min_order_amount) {
        issues.push(`Minimum order quantity for ${item.product.name} is ${item.product.min_order_amount}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      cart
    };
  }
}
