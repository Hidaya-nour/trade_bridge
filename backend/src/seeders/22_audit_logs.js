// src/seeders/22_audit_logs.js
import { faker } from '@faker-js/faker';
import { AuditLog } from '../models/audit-log.model.js';

const ACTIONS = ['create', 'update', 'delete', 'approve', 'reject', 'suspend', 'activate'];
const ENTITY_TYPES = ['user', 'product', 'order', 'payment', 'delivery', 'document', 'dispute'];

export default async function seedAuditLogs(seededData) {
  const users = seededData.users;
  const products = seededData.products;
  const orders = seededData.orders;
  const payments = seededData.payments;
  
  const logs = [];
  const activeUsers = users.filter(u => u.status === 'active');
  const admins = users.filter(u => u.role === 'admin');
  
  // Generate 500-1000 audit logs
  const numLogs = faker.number.int({ min: 500, max: 1000 });
  
  for (let i = 0; i < numLogs; i++) {
    const entityType = faker.helpers.arrayElement(ENTITY_TYPES);
    let entityId = null;
    
    switch (entityType) {
      case 'user':
        entityId = faker.helpers.arrayElement(users).id;
        break;
      case 'product':
        entityId = faker.helpers.arrayElement(products)?.id;
        break;
      case 'order':
        entityId = faker.helpers.arrayElement(orders)?.id;
        break;
      case 'payment':
        entityId = faker.helpers.arrayElement(payments)?.id;
        break;
      default:
        entityId = faker.string.uuid();
    }
    
    if (!entityId) continue;
    
    logs.push({
      id: faker.string.uuid(),
      user_id: faker.helpers.arrayElement([...admins, ...activeUsers]).id,
      action: faker.helpers.arrayElement(ACTIONS),
      entity_type: entityType,
      entity_id: entityId,
      ip_address: faker.internet.ip(),
      created_at: faker.date.recent({ days: 180 }),
    });
  }
  
  await AuditLog.bulkCreate(logs, { ignoreDuplicates: true });
  return logs;
}