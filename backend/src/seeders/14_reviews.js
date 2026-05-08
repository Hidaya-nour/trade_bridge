// src/seeders/14_reviews.js
import { faker } from '@faker-js/faker';
import { Review } from '../models/rating-reviews.model.ts';
import { Product } from '../models/product.model.ts';

export default async function seedReviews(seededData) {
  const products = seededData.products;
  const users = seededData.users;
  const orders = seededData.orders;
  
  const reviews = [];
  const productReviews = new Map();
  
  // Get buyers who have completed orders
  const completedOrders = orders.filter(o => o.order_status === 'closed');
  const buyersWithOrders = new Set(completedOrders.map(o => o.buyer_id));
  
  for (const product of products) {
    // Get orders that include this product
    const productOrders = seededData.order_items?.filter(oi => oi.product_id === product.id) || [];
    const uniqueBuyers = [...new Set(productOrders.map(oi => {
      const order = orders.find(o => o.id === oi.order_id);
      return order?.buyer_id;
    }))].filter(b => b);
    
    if (uniqueBuyers.length === 0) continue;
    
    const numReviews = Math.min(uniqueBuyers.length, faker.number.int({ min: 1, max: 20 }));
    const selectedBuyers = uniqueBuyers.slice(0, numReviews);
    
    let totalRating = 0;
    let reviewCount = 0;
    
    for (const buyerId of selectedBuyers) {
      const rating = faker.number.float({ min: 2, max: 5, precision: 0.1 });
      totalRating += rating;
      reviewCount++;
      
      reviews.push({
        id: faker.string.uuid(),
        product_id: product.id,
        user_id: buyerId,
        rating: rating,
        comment: faker.datatype.boolean(0.8) ? faker.lorem.paragraph() : null,
        created_at: faker.date.between({ from: product.created_at, to: new Date() }),
        updated_at: faker.date.recent(),
      });
    }
    
    productReviews.set(product.id, { totalRating, reviewCount });
  }
  
  await Review.bulkCreate(reviews, { ignoreDuplicates: true });
  
  // Update product ratings
  for (const [productId, { totalRating, reviewCount }] of productReviews) {
    await Product.update(
      { rating: parseFloat((totalRating / reviewCount).toFixed(1)), review_count: reviewCount },
      { where: { id: productId } }
    );
  }
  
  return reviews;
}
