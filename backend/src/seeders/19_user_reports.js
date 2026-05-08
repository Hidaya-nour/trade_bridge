// src/seeders/19_user_reports.js
import { faker } from '@faker-js/faker';
import { UserReport } from '../models/user-report.model.ts';

const REPORT_REASONS = [
  'fraud', 'harassment', 'spam', 'counterfeit_products', 
  'late_delivery', 'poor_quality', 'wrong_item', 'other'
];
const REPORT_STATUSES = ['open', 'reviewed', 'dismissed'];

export default async function seedUserReports(seededData) {
  const users = seededData.users;
  const orders = seededData.orders;
  const activeUsers = users.filter(u => u.status === 'active');
  
  const reports = [];
  
  // 2% of users have reports against them
  const reportedUsers = activeUsers.filter(() => faker.datatype.boolean(0.02));
  
  for (const reportedUser of reportedUsers) {
    const numReports = faker.number.int({ min: 1, max: 3 });
    
    for (let i = 0; i < numReports; i++) {
      const reporter = faker.helpers.arrayElement(activeUsers.filter(u => u.id !== reportedUser.id));
      const relevantOrders = orders.filter(o => 
        (o.buyer_id === reporter.id && o.supplier_id === reportedUser.id) ||
        (o.supplier_id === reporter.id && o.buyer_id === reportedUser.id)
      );
      
      reports.push({
        id: faker.string.uuid(),
        reporter_id: reporter.id,
        reported_user_id: reportedUser.id,
        order_id: relevantOrders.length ? faker.helpers.arrayElement(relevantOrders).id : null,
        reason: faker.helpers.arrayElement(REPORT_REASONS),
        description: faker.datatype.boolean(0.7) ? faker.lorem.paragraph() : null,
        status: faker.helpers.arrayElement(REPORT_STATUSES),
        created_at: faker.date.recent({ days: 90 }),
        updated_at: faker.date.recent(),
        deleted_at: null,
      });
    }
  }
  
  if (reports.length) {
    await UserReport.bulkCreate(reports, { ignoreDuplicates: true });
  }
  
  return reports;
}
