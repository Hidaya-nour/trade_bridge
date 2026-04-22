import { BaseRepository } from "./base.repository";
import { Cart } from "../models/cart.model";
import { CartItem } from "../models/cart-item.model";
import { Product } from "../models/product.model";
import User from "../models/user.model";
import { CartWithItems } from "../types/cart.types";
import { BroadcastRepository } from "./broadcast.repository";

export class CartRepository extends BaseRepository<Cart> {
  private broadcastRepo = new BroadcastRepository();

  constructor() {
    super(Cart);
  }
  // Find Cart with Items
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
              attributes: [
                'id',
                'name',
                'sku',
                'price',
                'unit_type',
                'images',
                'supplier_id',
                'is_available',
                'stock_quantity',
                'min_order_amount',
                'delivery_available',
                'delivery_pricing',
                'delivery_fee_per_km',
                'free_delivery_max_distance_km',
              ],
              include: [
                {
                  model: User,
                  as: 'supplier',
                  attributes: [
                    'id',
                    'full_name',
                    'business_name',
                    'verified',
                    'is_vat_registered',
                    'vat_rate',
                  ],
                },
              ],
            }
          ]
        }
      ]
    });

    if (!cart) return null;

    // Calculate totals
    const items = (cart as any).items || [];
    const total_items = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    const toNumber = (value: any, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const applyDiscountPromotion = (
      baseUnitPrice: number,
      quantity: number,
      promotion: any,
    ) => {
      if (!promotion) return baseUnitPrice;
      if (promotion.type !== 'discount') return baseUnitPrice;

      const discountType = promotion.discount_type;
      const discountValue = toNumber(promotion.discount_value, 0);
      const minOrder = promotion.min_order !== null && promotion.min_order !== undefined
        ? toNumber(promotion.min_order, 0)
        : null;
      const maxDiscount = promotion.max_discount !== null && promotion.max_discount !== undefined
        ? toNumber(promotion.max_discount, 0)
        : null;

      if (minOrder !== null && minOrder > 0 && quantity < minOrder) return baseUnitPrice;
      if (!discountType || discountValue <= 0) return baseUnitPrice;

      let perUnitDiscount = 0;
      if (discountType === 'percentage') {
        perUnitDiscount = baseUnitPrice * Math.min(100, discountValue) / 100;
      } else if (discountType === 'fixed') {
        perUnitDiscount = discountValue;
      }

      let totalDiscount = perUnitDiscount * quantity;
      if (maxDiscount !== null && maxDiscount > 0) {
        totalDiscount = Math.min(totalDiscount, maxDiscount);
      }

      const unitPrice = baseUnitPrice - totalDiscount / Math.max(1, quantity);
      return Math.max(0, Number(unitPrice.toFixed(2)));
    };

    let original_total = 0;
    let discount_total = 0;
    const applied_promotions: any[] = [];

    for (const item of items) {
      const product = item?.product;
      if (!product) continue;

      const baseUnitPrice = toNumber(product.price, 0);
      original_total += baseUnitPrice * toNumber(item.quantity, 0);

      const code = String(product.sku || '').trim();
      const supplierId = String(product.supplier_id || '').trim();
      if (!code || !supplierId) continue;

      const promotion = await this.broadcastRepo.findActiveDiscountByOwnerAndCode(
        supplierId,
        code,
      );

      const quantity = toNumber(item.quantity, 0);
      const discountedUnitPrice = applyDiscountPromotion(baseUnitPrice, quantity, promotion);

      if (discountedUnitPrice !== baseUnitPrice) {
        // Surface original price to the client without changing the schema.
        product.setDataValue?.('original_price', baseUnitPrice);
        product.price = discountedUnitPrice;

        discount_total += (baseUnitPrice - discountedUnitPrice) * quantity;

        if (promotion) {
          applied_promotions.push({
            broadcast_id: promotion.id,
            code: promotion.code,
            discount_type: promotion.discount_type,
            discount_value: promotion.discount_value,
          });
        }
      }
    }

    const final_total = Math.max(0, Number((original_total - discount_total).toFixed(2)));
    discount_total = Math.max(0, Number(discount_total.toFixed(2)));

    return {
      id: cart.id,
      user_id: cart.user_id,
      items: items,
      total_items,
      original_total,
      discount_total,
      final_total,
      applied_promotions,
      created_at: cart.created_at,
      updated_at: cart.updated_at
    };
  }

  // Get or Create Cart
  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.model.findOne({ where: { user_id: userId } });
    if (!cart) {
      cart = await this.model.create({ user_id: userId } as any);
    }
    return cart;
  }

  // Clear Cart
  async clearCart(cartId: string): Promise<number> {
    return CartItem.destroy({ where: { cart_id: cartId } });
  }
}

export class CartItemRepository extends BaseRepository<CartItem> {
  constructor() {
    super(CartItem);
  }

  // Find Cart Item
  async findByCartAndProduct(cartId: string, productId: string): Promise<CartItem | null> {
    return this.model.findOne({
      where: { cart_id: cartId, product_id: productId }
    });
  }

  // Update Quantity
  async updateQuantity(cartItemId: string, quantity: number): Promise<[number, CartItem[]]> {
    return this.model.update(
      { quantity } as any,
      { where: { id: cartItemId } as any, returning: true }
    );
  }

  // Remove Item
  async removeItem( itemId: string): Promise<number> {
    return this.model.destroy({
      where: {id: itemId }
    });
  }
}
