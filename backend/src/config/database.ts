import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'defaultdb',
  process.env.DB_USER || 'avnadmin',
  process.env.DB_PASSWORD || '1234567890',
  {
    host: process.env.DB_HOST || 'mysql-11c9a362-nourhidaya921-a902.l.aivencloud.com',
    port: parseInt(process.env.DB_PORT || '21581'),
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false // Required for Aiven
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
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