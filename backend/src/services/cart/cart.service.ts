import { CartRepository, CartItemRepository } from '../../repositories/cart.repository';
import { ProductRepository } from '../../repositories/product.repository';
import { UserRepository } from '../../repositories/user.repository';
import { AppError } from '../../utils/errors';
import { AddToCartDTO, UpdateCartItemDTO, CartWithItems } from '../../types/cart.types';
import logger from '../../utils/logger';

export class CartService {
  private cartRepo = new CartRepository();
  private cartItemRepo = new CartItemRepository();
  private productRepo = new ProductRepository();
  private userRepo = new UserRepository();

  // ============================================================
  // HELPER: Get User Info
  // ============================================================

  private async getUserInfo(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return {
      role: user.role,
      region: 'all' // Can be extended to get from user profile
    };
  }

  // ============================================================
  // GET CART
  // ============================================================

  async getCart(userId: string): Promise<CartWithItems | null> {
    const { role, region } = await this.getUserInfo(userId);
    return this.cartRepo.findCartWithItems(userId, role, region);
  }

  // ============================================================
  // ADD TO CART
  // ============================================================

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
    const { role, region } = await this.getUserInfo(userId);
    const updatedCart = await this.cartRepo.findCartWithItems(userId, role, region);
    if (!updatedCart) {
      throw new AppError('Failed to retrieve updated cart', 500);
    }

    return updatedCart;
  }

  // ============================================================
  // UPDATE CART ITEM
  // ============================================================

  async updateCartItem(userId: string, productId: string, updateData: UpdateCartItemDTO): Promise<CartWithItems> {
    const { quantity } = updateData;

    // Get cart
    const cart = await this.cartRepo.getOrCreateCart(userId);

    // Check if item exists
    const cartItem = await this.cartItemRepo.findByCartAndProduct(cart.id, productId);
    if (!cartItem) {
      throw new AppError('Item not found in cart', 404);
    }

    // Validate product
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await this.cartItemRepo.removeItem(cart.id, productId);
    } else {
      // Validate quantity
      if (quantity < product.min_order_amount) {
        throw new AppError(`Minimum order quantity is ${product.min_order_amount}`, 400);
      }

      if (quantity > product.stock_quantity) {
        throw new AppError('Insufficient stock', 400);
      }

      // Update quantity
      await this.cartItemRepo.updateQuantity(cartItem.id, quantity);
    }

    // Update cart timestamp
    await cart.update({ updated_at: new Date() });

    logger.info(`User ${userId} updated cart item ${productId} quantity to ${quantity}`);

    // Return updated cart
    const { role, region } = await this.getUserInfo(userId);
    const updatedCart = await this.cartRepo.findCartWithItems(userId, role, region);
    if (!updatedCart) {
      throw new AppError('Failed to retrieve updated cart', 500);
    }

    return updatedCart;
  }

  // ============================================================
  // REMOVE FROM CART
  // ============================================================

  async removeFromCart(userId: string, productId: string): Promise<CartWithItems> {
    // Get cart
    const cart = await this.cartRepo.getOrCreateCart(userId);

    // Remove item
    const deleted = await this.cartItemRepo.removeItem(cart.id, productId);
    if (deleted === 0) {
      throw new AppError('Item not found in cart', 404);
    }

    // Update cart timestamp
    await cart.update({ updated_at: new Date() });

    logger.info(`User ${userId} removed product ${productId} from cart`);

    // Return updated cart
    const { role, region } = await this.getUserInfo(userId);
    const updatedCart = await this.cartRepo.findCartWithItems(userId, role, region);
    if (!updatedCart) {
      throw new AppError('Failed to retrieve updated cart', 500);
    }

    return updatedCart;
  }

  // ============================================================
  // CLEAR CART
  // ============================================================

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

  // ============================================================
  // VALIDATE CART FOR CHECKOUT
  // ============================================================

  async validateCartForCheckout(userId: string): Promise<{
    valid: boolean;
    issues: string[];
    cart: CartWithItems;
  }> {
    const { role, region } = await this.getUserInfo(userId);
    const cart = await this.cartRepo.findCartWithItems(userId, role, region);
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