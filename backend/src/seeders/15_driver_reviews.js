// src/seeders/15_driver_reviews.js
import { faker } from '@faker-js/faker';
import { DriverReview } from '../models/driver-review.model.js';

export default async function seedDriverReviews(seededData) {
  const deliveries = seededData.deliveries;
  const users = seededData.users;
  
  const deliveredDeliveries = deliveries.filter(d => d.status === 'delivered');
  const reviews = [];
  
  for (const delivery of deliveredDeliveries) {
    const order = seededData.orders.find(o => o.id === delivery.order_id);
    if (!order) continue;
    
    // 70% chance of review for completed deliveries
    if (!faker.datatype.boolean(0.7)) continue;
    
    const rating = faker.number.int({ min: 1, max: 5 });
    
    reviews.push({
      id: faker.string.uuid(),
      delivery_id: delivery.id,
      driver_user_id: delivery.driver_id,
      buyer_id: order.buyer_id,
      rating: rating,
      comment: faker.datatype.boolean(0.6) ? faker.lorem.sentence() : null,
      created_at: faker.date.between({ from: delivery.completed_at, to: new Date() }),
      updated_at: faker.date.recent(),
    });
  }
  
  if (reviews.length) {
    await DriverReview.bulkCreate(reviews, { ignoreDuplicates: true });
  }
  
  return reviews;
}