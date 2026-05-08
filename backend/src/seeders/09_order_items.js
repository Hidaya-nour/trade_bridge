// src/seeders/09_order_items.js
import { faker } from '@faker-js/faker';
import { OrderItems } from '../models/order-item.model.ts';
import { Order } from '../models/order.model.ts';
import { getRandomItems } from './seedHelpers.js';

export default async function seedOrderItems(seededData) {
  const orders = seededData.orders;
  const products = seededData.products;
  
  const orderItems = [];
  const ordersToUpdate = [];
  
  for (const order of orders) {
    // Get products from same supplier
    const supplierProducts = products.filter(p => p.supplier_id === order.supplier_id && p.is_available);
    if (supplierProducts.length === 0) continue;
    
    const numItems = faker.number.int({ min: 1, max: 5 });
    const selectedProducts = getRandomItems(supplierProducts, numItems);
    
    let orderTotal = 0;
    
    for (const product of selectedProducts) {
      const quantity = faker.number.int({ 
        min: Math.max(1, product.min_order_amount), 
        max: product.min_order_amount * faker.number.int({ min: 1, max: 10 })
      });
      
      const unitPrice = parseFloat(product.price) * (1 + faker.number.float({ min: -0.1, max: 0.1 }));
      const itemTotal = unitPrice * quantity;
      orderTotal += itemTotal;
      
      orderItems.push({
        id: faker.string.uuid(),
        order_id: order.id,
        product_id: product.id,
        quantity: quantity,
        unit_price: unitPrice,
        created_at: order.created_at,
        updated_at: order.updated_at,
        deleted_at: null,
      });
    }
    
    ordersToUpdate.push({
      id: order.id,
      total_price: parseFloat(orderTotal.toFixed(2)),
      delivery_fee: faker.number.float({ min: 0, max: 500 }),
    });
  }
  
  await OrderItems.bulkCreate(orderItems, { ignoreDuplicates: true });
  
  // Update order totals
  for (const update of ordersToUpdate) {
    await Order.update(
      { total_price: update.total_price, delivery_fee: update.delivery_fee },
      { where: { id: update.id } }
    );
  }
  
  return orderItems;
}
