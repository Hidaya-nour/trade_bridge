// src/seeders/11_deliveries.js
import { faker } from '@faker-js/faker';
import { Delivery } from '../models/delivery.model.js';

const DELIVERY_STATUSES = ['pending', 'assigned', 'picked_up', 'delivered', 'failed', 'cancelled'];
const STATUS_WEIGHTS = [0.1, 0.2, 0.25, 0.35, 0.05, 0.05];

export default async function seedDeliveries(seededData) {
  const orders = seededData.orders;
  const drivers = seededData.drivers;
  
  const deliveries = [];
  
  for (const order of orders) {
    // Only create delivery for completed or in-progress orders
    if (order.order_status === 'cancelled') continue;
    
    let deliveryStatus = 'pending';
    
    if (['delivered', 'closed'].includes(order.order_status)) {
      deliveryStatus = 'delivered';
    } else if (order.order_status === 'shipped') {
      deliveryStatus = 'picked_up';
    } else if (order.order_status === 'processing') {
      deliveryStatus = 'assigned';
    } else {
      deliveryStatus = faker.helpers.arrayElement(DELIVERY_STATUSES);
    }
    
    const assignedDriver = deliveryStatus !== 'pending' ? faker.helpers.arrayElement(drivers) : null;
    
    const startedAt = deliveryStatus !== 'pending' 
      ? faker.date.between({ from: order.created_at, to: new Date() })
      : null;
    
    const completedAt = deliveryStatus === 'delivered'
      ? faker.date.between({ from: startedAt, to: new Date() })
      : null;
    
    deliveries.push({
      id: faker.string.uuid(),
      order_id: order.id,
      driver_id: assignedDriver?.id || null,
      pickup_location: faker.location.streetAddress(),
      dropoff_location: faker.location.streetAddress(),
      status: deliveryStatus,
      started_at: startedAt,
      completed_at: completedAt,
      notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
      created_at: order.created_at,
      updated_at: completedAt || startedAt || order.updated_at,
      deleted_at: null,
    });
  }
  
  await Delivery.bulkCreate(deliveries, { ignoreDuplicates: true });
  return deliveries;
}