// src/seeders/20_broadcasts.js
import { faker } from '@faker-js/faker';
import { Broadcast } from '../models/broadcast.model.js';

const BROADCAST_TYPES = ['discount', 'bogo', 'free-shipping', 'bundle', 'clearance'];
const BROADCAST_STATUSES = ['draft', 'scheduled', 'active', 'expired', 'cancelled'];

export default async function seedBroadcasts(seededData) {
  const users = seededData.users;
  const adminsAndSuppliers = users.filter(u => 
    u.role === 'admin' || u.role === 'factory' || u.role === 'distributor'
  );
  
  const broadcasts = [];
  
  // Generate 30-50 broadcasts
  const numBroadcasts = faker.number.int({ min: 30, max: 50 });
  
  for (let i = 0; i < numBroadcasts; i++) {
    const owner = faker.helpers.arrayElement(adminsAndSuppliers);
    const type = faker.helpers.arrayElement(BROADCAST_TYPES);
    const startDate = faker.date.recent({ days: 60 });
    const endDate = faker.date.future({ years: 1, refDate: startDate });
    const status = faker.helpers.arrayElement(BROADCAST_STATUSES);
    
    broadcasts.push({
      id: faker.string.uuid(),
      owner_id: owner.id,
      owner_role: owner.role === 'admin' ? 'admin' : (owner.role === 'factory' ? 'factory' : 'distributor'),
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      summary: faker.lorem.sentence(),
      type: type,
      discount_type: type === 'discount' ? faker.helpers.arrayElement(['percentage', 'fixed']) : null,
      discount_value: type === 'discount' ? parseFloat(faker.commerce.price({ min: 5, max: 50 })) : null,
      min_order: type === 'discount' ? parseFloat(faker.commerce.price({ min: 100, max: 1000 })) : null,
      max_discount: type === 'discount' ? parseFloat(faker.commerce.price({ min: 50, max: 500 })) : null,
      start_date: startDate,
      end_date: endDate,
      status: status,
      created_by: owner.id,
      sent_count: faker.number.int({ min: 0, max: 500 }),
      viewed_count: faker.number.int({ min: 0, max: 300 }),
      redeemed_count: faker.number.int({ min: 0, max: 100 }),
      code: type !== 'clearance' ? faker.string.alphanumeric(8).toUpperCase() : null,
      priority: faker.helpers.arrayElement(['high', 'medium', 'low']),
      target_audience: faker.helpers.arrayElement(['all', 'segment', 'specific']),
      audience_segments: [],
      created_at: startDate,
      updated_at: startDate,
    });
  }
  
  await Broadcast.bulkCreate(broadcasts, { ignoreDuplicates: true });
  return broadcasts;
}