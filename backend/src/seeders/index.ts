// src/seeders/index.js
import sequelize from '../config/database.js';
import seedUsers from './01_users.js';
import seedDocuments from './02_documents.js';
import seedAddresses from './03_addresses.js';
import seedProducts from './04_products.js';
import seedPaymentMethods from './05_payment_methods.js';
import seedDrivers from './06_drivers.js';
import seedCarts from './07_carts.js';
import seedOrders from './08_orders.js';
import seedOrderItems from './09_order_items.js';
import seedPayments from './10_payments.js';
import seedDeliveries from './11_deliveries.js';
import seedDeliveryEvents from './12_delivery_events.js';
import seedInventoryMovements from './13_inventory_movements.js';
import seedReviews from './14_reviews.js';
import seedDriverReviews from './15_driver_reviews.js';
import seedNotifications from './16_notifications.js';
import seedChatMessages from './17_chat_messages.js';
import seedDisputes from './18_disputes.js';
import seedUserReports from './19_user_reports.js';
import seedBroadcasts from './20_broadcasts.js';
import seedLoginAttempts from './21_login_attempts.js';
import seedAuditLogs from './22_audit_logs.js';

const SEEDERS = [
  { name: 'Users', fn: seedUsers },
  { name: 'Documents', fn: seedDocuments },
  { name: 'Addresses', fn: seedAddresses },
  { name: 'Products', fn: seedProducts },
  { name: 'Payment Methods', fn: seedPaymentMethods },
  { name: 'Drivers', fn: seedDrivers },
  { name: 'Carts', fn: seedCarts },
  { name: 'Orders', fn: seedOrders },
  { name: 'Order Items', fn: seedOrderItems },
  { name: 'Payments', fn: seedPayments },
  { name: 'Deliveries', fn: seedDeliveries },
  { name: 'Delivery Events', fn: seedDeliveryEvents },
  { name: 'Inventory Movements', fn: seedInventoryMovements },
  { name: 'Reviews', fn: seedReviews },
  { name: 'Driver Reviews', fn: seedDriverReviews },
  { name: 'Notifications', fn: seedNotifications },
  { name: 'Chat Messages', fn: seedChatMessages },
  { name: 'Disputes', fn: seedDisputes },
  { name: 'User Reports', fn: seedUserReports },
  { name: 'Broadcasts', fn: seedBroadcasts },
  { name: 'Login Attempts', fn: seedLoginAttempts },
  { name: 'Audit Logs', fn: seedAuditLogs },
];

export default async function runAllSeeders(options = { truncate: true }) {
  console.log('🌱 Starting database seeding...\n');
  
  if (options.truncate) {
    console.log('🗑️  Truncating all tables...');
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('SequelizeMeta', 'SequelizeData')
      `);
      
      for (const table of tables) {
        const tableName = table.table_name || table.TABLE_NAME;
        if (!tableName) continue;
        try {
          await sequelize.query(`TRUNCATE TABLE \`${tableName}\``);
          console.log(`  ✓ Truncated ${tableName}`);
        } catch (err) {
          // Skip if can't truncate
        }
      }
      
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('✅ Tables truncated\n');
    } catch (err) {
      console.log('⚠️  Could not truncate tables, continuing...\n');
    }
  }
  
  const seededData = {};
  
  for (const seeder of SEEDERS) {
    try {
      console.log(`📦 Seeding ${seeder.name}...`);
      const data = await seeder.fn(seededData, options);
      seededData[seeder.name.toLowerCase().replace(/\s/g, '_')] = data;
      
      const count = Array.isArray(data) ? data.length : (data?.count || Object.keys(data).length || 0);
      console.log(`✅ ${seeder.name} seeded: ${count} records\n`);
    } catch (error) {
      console.error(`❌ Error seeding ${seeder.name}:`, error.message);
      throw error;
    }
  }
  
  console.log('🎉 Database seeding completed successfully!');
  return seededData;
}

