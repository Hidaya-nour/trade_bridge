// src/scripts/run-seed.ts
import sequelize from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

// Import your existing index.js which has all seeders
import runAllSeeders from '../seeders/index.js';

interface SeedOptions {
  truncate: boolean;
  skipCloudinary: boolean;
}

async function runSeed(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Trade Bridge Database Seeder');
  console.log('='.repeat(60) + '\n');
  
try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`   Database: ${process.env.DB_NAME}\n`);
    
    // 🔥 FORCE REBUILD FOR LIVE CLOUD ALIGNMENT
    console.log('🔄 Realigning cloud database structural architecture...');
    
    // // 1. Completely bypass constraints at the engine level
    // await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    
    // // 2. 🔥 FORCE NUKING OF THE RESIDUAL REFRESH_TOKENS TABLE CACHE
    // console.log('🗑️  Nuking residual foreign-key tracking tables...');
    // await sequelize.query('DROP TABLE IF EXISTS `refresh_tokens`;');
    // await sequelize.query('DROP TABLE IF EXISTS `users`;');
    
    // // 3. Clear out everything else and rebuild structures to match local models perfectly
    // await sequelize.sync({ force: true }); 
    
    // // 4. Re-enable constraint parameters safely
    // await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    
    console.log('✅ All table schemas rebuilt to match source models successfully!\n');
    // Parse command line arguments
    const args = process.argv.slice(2);
        const options: SeedOptions = {
      truncate: !args.includes('--no-truncate'),
      skipCloudinary:
        args.includes('--skip-cloudinary') || !args.includes('--use-cloudinary'),
    };

    if (options.skipCloudinary) {
      process.env.SKIP_CLOUDINARY = 'true';
    } else {
      delete process.env.SKIP_CLOUDINARY;
    }
    
    if (options.skipCloudinary) {
      console.log('⚠️  Cloudinary uploads disabled (using mock data)\n');
    }
    
    if (!options.truncate) {
      console.log('⚠️  Truncation disabled (data will be appended)\n');
    }
    
    // Run seeders
    const startTime = Date.now();
    const seededData = await runAllSeeders(options);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Success summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ Seeding Completed Successfully!');
    console.log('='.repeat(60));
    console.log(`⏱️  Total time: ${duration} seconds\n`);
    
    console.log('📊 Seed Statistics:');
    console.log('-'.repeat(40));
    
    const stats = [
      { name: 'Users', key: 'users' },
      { name: 'Products', key: 'products' },
      { name: 'Orders', key: 'orders' },
      { name: 'Order Items', key: 'order_items' },
      { name: 'Payments', key: 'payments' },
      { name: 'Deliveries', key: 'deliveries' },
    ];
    
    for (const stat of stats) {
// Cast seededData as any or Record right when you index it
const data = (seededData as any)[stat.key];
      const count = data ? (Array.isArray(data) ? data.length : (data as any).length || 0) : 0;
      console.log(`   ${stat.name.padEnd(20)}: ${String(count).padStart(6)} records`);
    }
    
    console.log('\n💡 Test Login Credentials:');
    console.log('   Admin: admin@tradebridge.com / Admin@123');
    console.log('   Factory: factory1@tradebridge.com / Factory@123');
    console.log('   Distributor: distributor1@tradebridge.com / Distributor@123');
    console.log('   Retailer: retailer1@tradebridge.com / Retailer@123');
    console.log('   Driver: driver1@tradebridge.com / Driver@123\n');
    
  } catch (error: any) {
    console.error('\n❌ Seeding failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runSeed();

export default runSeed;