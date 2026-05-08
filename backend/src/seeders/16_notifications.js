// src/seeders/16_notifications.js
import { faker } from '@faker-js/faker';
import { Notification } from '../models/notification.model.ts';

const NOTIFICATION_TYPES = ['order', 'payment', 'delivery', 'system', 'promotion', 'alert'];
const TITLES = {
  order: ['New Order Received', 'Order Status Updated', 'Order Confirmed', 'Order Shipped'],
  payment: ['Payment Received', 'Payment Confirmed', 'Payment Failed', 'Refund Processed'],
  delivery: ['Delivery Assigned', 'Delivery In Progress', 'Delivery Completed', 'Delivery Delayed'],
  system: ['Account Updated', 'Profile Verification', 'New Feature Available'],
  promotion: ['Special Offer', 'Discount Available', 'Limited Time Deal'],
  alert: ['Low Stock Alert', 'Suspicious Activity', 'Security Update'],
};

export default async function seedNotifications(seededData) {
  const users = seededData.users;
  const activeUsers = users.filter(u => u.status === 'active');
  const orders = seededData.orders;
  
  const notifications = [];
  
  // Generate 3-10 notifications per active user
  for (const user of activeUsers) {
    const numNotifications = faker.number.int({ min: 3, max: 15 });
    
    for (let i = 0; i < numNotifications; i++) {
      const type = faker.helpers.arrayElement(NOTIFICATION_TYPES);
      const title = faker.helpers.arrayElement(TITLES[type]);
      let orderId = null;
      
      if (type === 'order' || type === 'payment' || type === 'delivery') {
        const userOrders = orders.filter(o => o.buyer_id === user.id || o.supplier_id === user.id);
        if (userOrders.length) {
          orderId = faker.helpers.arrayElement(userOrders).id;
        }
      }
      
      notifications.push({
        id: faker.string.uuid(),
        user_id: user.id,
        type: type,
        title: title,
        message: faker.lorem.sentence({ min: 5, max: 15 }),
        is_read: faker.datatype.boolean(0.6) ? 1 : 0,
        created_at: faker.date.recent({ days: 30 }),
        updated_at: faker.date.recent(),
        deleted_at: null,
      });
    }
  }
  
  await Notification.bulkCreate(notifications, { ignoreDuplicates: true });
  return notifications;
}
