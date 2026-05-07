// src/scripts/reset-database.ts
import sequelize from '../config/database.ts';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

async function resetDatabase(): Promise<void> {
  try {
    console.log('🗑️ Resetting database...');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');
    
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Get all tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('SequelizeMeta', 'SequelizeData')
    `) as any[];
    
    console.log(`Found ${tables.length} tables to drop\n`);
    
    // Drop all tables
    let droppedCount = 0;
    for (const table of tables) {
      try {
        const tableName = table.table_name || table.TABLE_NAME;
        if (!tableName) continue;
        await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
        console.log(`  ✓ Dropped ${tableName}`);
        droppedCount++;
      } catch (err: any) {
        console.log(
          `  ⚠️ Could not drop ${table.table_name || table.TABLE_NAME || 'unknown_table'}: ${err.message}`,
        );
      }
    }
    
    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log(`\n✅ Database reset complete (${droppedCount} tables dropped)`);
    console.log('🔄 Running migrations...');
    
    // Run migrations to recreate tables
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    
    console.log('✅ Migrations complete');
    console.log('\n💡 Next steps:');
    console.log('   Run: npm run db:seed');
    
  } catch (error: any) {
    console.error('❌ Error resetting database:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

resetDatabase();

export default resetDatabase;

