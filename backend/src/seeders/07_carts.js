// src/seeders/07_carts.js
import { faker } from '@faker-js/faker';
import { Cart } from '../models/cart.model.js';
import { CartItem } from '../models/cart-item.model.js';
import { getRandomItems } from './seedHelpers.js';

export default async function seedCarts(seededData) {
  const users = seededData.users;
  const products = seededData.products;
  
  const retailers = users.filter(u => u.role === 'retailer' && u.status === 'active');
  const activeProducts = products.filter(p => p.is_available);
  
  const carts = [];
  const cartItems = [];
  
  for (const retailer of retailers) {
    // Create cart for active retailer (50% chance if they have no orders)
    const hasOrders = seededData.orders?.some(o => o.buyer_id === retailer.id);
    if (hasOrders && faker.datatype.boolean(0.3)) continue;
    
    const cartId = faker.string.uuid();
    
    carts.push({
      id: cartId,
      user_id: retailer.id,
      created_at: faker.date.recent({ days: 7 }),
      updated_at: faker.date.recent(),
    });
    
    // Add 1-8 items to cart
    const numItems = faker.number.int({ min: 1, max: 8 });
    const selectedProducts = getRandomItems(activeProducts, numItems);
    
    for (const product of selectedProducts) {
      cartItems.push({
        id: faker.string.uuid(),
        cart_id: cartId,
        product_id: product.id,
        quantity: faker.number.int({ min: 1, max: product.min_order_amount * 2 }),
      });
    }
  }
  
  if (carts.length) await Cart.bulkCreate(carts, { ignoreDuplicates: true });
  if (cartItems.length) await CartItem.bulkCreate(cartItems, { ignoreDuplicates: true });
  
  return { carts, cartItems };
}