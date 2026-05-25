import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Detect environment status
const isProduction = process.env.NODE_ENV === 'production';
const dbSslEnabled = String(process.env.DB_SSL || '').toLowerCase() === 'true' || isProduction;

const sequelize = new Sequelize(
  isProduction ? process.env.MYSQL_DB! : (process.env.DB_NAME || 'trade_bridge'),
  isProduction ? process.env.MYSQL_USER! : (process.env.DB_USER || 'root'),
  isProduction ? process.env.MYSQL_PASSWORD! : (process.env.DB_PASSWORD || 'root'),
  {
    host: isProduction ? process.env.MYSQL_HOST! : (process.env.DB_HOST || 'localhost'),
    port: Number(isProduction ? process.env.MYSQL_PORT : (process.env.DB_PORT || 3308)),
    dialect: 'mysql',
    
    dialectOptions: {
      ssl: dbSslEnabled
        ? {
            rejectUnauthorized: false // Required for secure Aiven connection handshakes
          }
        : false,
    },
    
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    pool: {
      max: isProduction ? 5 : 10, // Keeps connection numbers low on serverless Vercel functions
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', (error as Error).message);
    return false;
  }
};

export default sequelize;