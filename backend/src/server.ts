import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize, { testConnection } from './config/database';
import authRoutes from './routes/auth.routes';
import logger from './utils/logger';
import './models/user.model';
import './models/RefreshToken.model';


import { setupAssociations } from './models/associations';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import notificationRoutes from './routes/notification.routes';
import disputeRoutes from './routes/dispute.routes';
import paymentRoutes from './routes/payment.routes';
import deliveryRoutes from './routes/delivery.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 3️⃣ THIRD: Call setup function
setupAssociations();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/deliveries', deliveryRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  const dbConnected = await testConnection();

  if (!dbConnected) {
    logger.error('❌ Failed to connect to database. Exiting...');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'development') {
    await sequelize.sync({ alter: true });
    logger.info('✅ Database synced');
  }

  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });
};

startServer();