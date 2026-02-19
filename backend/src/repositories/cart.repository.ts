import { BaseRepository } from "./base.repository";
import { Cart } from "../models/cart.model";
import { CartItem } from "../models/cart-item.model";
import { Product } from "../models/product.model";
import { CartWithItems, CartItemWithProduct } from "../types/cart.types";

export class CartRepository extends BaseRepository<Cart> {
  constructor() {
    super(Cart);
  }

  // ============================================================
  // Find Cart with Items
  // ============================================================

  async findCartWithItems(userId: string): Promise<CartWithItems | null> {
    const cart = await this.model.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'unit_type', 'images', 'supplier_id', 'is_available', 'stock_quantity', 'min_order_amount']
            }
          ]
        }
      ]
    });

    if (!cart) return null;

    // Calculate totals
    const items = (cart as any).items || [];
    const total_items = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const total_price = items.reduce((sum: number, item: any) =>
      sum + (item.product?.price || 0) * item.quantity, 0
    );

    return {
      id: cart.id,
      user_id: cart.user_id,
      items: items,
      total_items,
      total_price,
      created_at: cart.created_at,
      updated_at: cart.updated_at
    };
  }

  // ============================================================
  // Get or Create Cart
  // ============================================================

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.model.findOne({ where: { user_id: userId } });
    if (!cart) {
      cart = await this.model.create({ user_id: userId } as any);
    }
    return cart;
  }

  // ============================================================
  // Clear Cart
  // ============================================================

  async clearCart(cartId: string): Promise<number> {
    return CartItem.destroy({ where: { cart_id: cartId } });
  }
}

export class CartItemRepository extends BaseRepository<CartItem> {
  constructor() {
    super(CartItem);
  }

  // ============================================================
  // Find Cart Item
  // ============================================================

  async findByCartAndProduct(cartId: string, productId: string): Promise<CartItem | null> {
    return this.model.findOne({
      where: { cart_id: cartId, product_id: productId }
    });
  }

  // ============================================================
  // Update Quantity
  // ============================================================

  async updateQuantity(cartItemId: string, quantity: number): Promise<[number, CartItem[]]> {
    return this.model.update(
      { quantity } as any,
      { where: { id: cartItemId } as any, returning: true }
    );
  }

  // ============================================================
  // Remove Item
  // ============================================================

  async removeItem(cartId: string, productId: string): Promise<number> {
    return this.model.destroy({
      where: { cart_id: cartId, product_id: productId }
    });
  }
}