// src/seeders/18_disputes.js
import { faker } from '@faker-js/faker';
import { Dispute } from '../models/dispute.model.ts';

const DISPUTE_STATUSES = ['open', 'under_review', 'resolved', 'rejected'];
const STATUS_WEIGHTS = [0.3, 0.3, 0.25, 0.15];

export default async function seedDisputes(seededData) {
  const orders = seededData.orders;
  const users = seededData.users;
  const admins = users.filter(u => u.role === 'admin');
  
  const disputes = [];
  
  // 5% of orders have disputes
  const disputedOrders = orders.filter(() => faker.datatype.boolean(0.05));
  
  for (const order of disputedOrders) {
    const isBuyerRaised = faker.datatype.boolean(0.6);
    const raisedBy = isBuyerRaised ? order.buyer_id : order.supplier_id;
    const againstUser = isBuyerRaised ? order.supplier_id : order.buyer_id;
    const status = faker.helpers.arrayElement(DISPUTE_STATUSES);
    const resolvedBy = status === 'resolved' || status === 'rejected' 
      ? faker.helpers.arrayElement(admins)?.id 
      : null;
    
    disputes.push({
      id: faker.string.uuid(),
      order_id: order.id,
      raised_by: raisedBy,
      against_user: againstUser,
      description: faker.lorem.paragraph(),
      status: status,
      resolved_by: resolvedBy,
      resolved_at: resolvedBy ? faker.date.between({ from: order.created_at, to: new Date() }) : null,
      created_at: faker.date.between({ from: order.created_at, to: new Date() }),
    });
  }
  
  if (disputes.length) {
    await Dispute.bulkCreate(disputes, { ignoreDuplicates: true });
  }
  
  return disputes;
}
