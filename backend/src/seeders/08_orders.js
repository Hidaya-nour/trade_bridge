// src/seeders/08_orders.js
import { faker } from '@faker-js/faker';
import { Order } from '../models/order.model.ts';
import { getRandomItems, getRandomStatus, getOrderStatusTimeline } from './seedHelpers.js';

const ORDER_STATUSES = ['pending', 'approved', 'processing', 'shipped', 'delivered', 'closed', 'cancelled'];
const STATUS_WEIGHTS = [0.05, 0.1, 0.15, 0.2, 0.3, 0.1, 0.1];

export default async function seedOrders(seededData) {
  const users = seededData.users;
  const retailers = users.filter(u => u.role === 'retailer' && u.status === 'active');
  const suppliers = users.filter(u => (u.role === 'factory' || u.role === 'distributor') && u.status === 'active');
  
  const orders = [];
  const startDate = faker.date.past({ years: 1 });
  const endDate = new Date();
  
  // Generate 3000+ orders
  const targetOrders = 3500;
  let orderCounter = 0;
  
  while (orderCounter < targetOrders) {
    const retailer = faker.helpers.arrayElement(retailers);
    const supplier = faker.helpers.arrayElement(suppliers);
    const orderDate = faker.date.between({ from: startDate, to: endDate });
    const orderStatus = getRandomStatus(ORDER_STATUSES, STATUS_WEIGHTS);
    const timeline = getOrderStatusTimeline(orderDate, orderStatus);
    
    orders.push({
      id: faker.string.uuid(),
      buyer_id: retailer.id,
      supplier_id: supplier.id,
      total_price: 0, // Will be updated after order items
      delivery_fee: 0,
      order_status: orderStatus,
      created_at: timeline.created_at,
      updated_at: timeline.created_at,
      deleted_at: null,
    });
    
    orderCounter++;
    
    // Add orders distribution by month (more recent orders)
    if (orderCounter % 100 === 0) {
      console.log(`  Generated ${orderCounter} orders...`);
    }
  }
  
  await Order.bulkCreate(orders, { ignoreDuplicates: true });
  return orders;
}
