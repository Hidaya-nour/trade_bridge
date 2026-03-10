import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import sequelize, { testConnection } from './config/database';
import authRoutes from './routes/auth.routes';
import logger from './utils/logger';
import './models/user.model';
import './models/RefreshToken.model';
import './models/cart.model';
import './models/cart-item.model';
import './models/promotion.model';
import './models/inventory-movement.model';
import './models/chat-message.model';
import './models/login-attempt.model';
import './models/document.model';
import './models/address.model';
import './models/driver-location.model';
import './models/audit-log.model';
import './models/supplier-payment-method.model';
import './models/factory-agent.model';
import './models/rating-reviews.model';
import './models/driver.model';

import { setupAssociations } from './models/associations';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import cartRoutes from './routes/cart.routes';
import notificationRoutes from './routes/notification.routes';
import disputeRoutes from './routes/dispute.routes';
import paymentRoutes from './routes/payment.routes';
import deliveryRoutes from './routes/delivery.routes';
import promotionRoutes from './routes/promotion.routes';
import inventoryMovementRoutes from './routes/inventory-movement.routes';
import chatMessageRoutes from './routes/chat-message.route';
import loginAttemptRoutes from './routes/login-attempt.routes';
import documentRoutes from './routes/document.routes';
import addressRoutes from './routes/address.routes';
import driverLocationRoutes from './routes/driver-location.routes';
import auditLogRoutes from './routes/audit-log.routes';
import supplierPaymentMethodRoutes from './routes/supplier-payment-method.routes';
import factoryAgentRoutes from './routes/factory-agent.routes';
import ratingReviewRoutes from './routes/rating-review.routes';
import supplierRoutes from './routes/supplier.routes'
import driverRoutes from './routes/driver.routes';
import { AppError, ValidationError } from './utils/errors';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const corsOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.FRONTEND_URL ||
  'http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// 3️⃣ THIRD: Call setup function
setupAssociations();

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow native apps/tools with no browser origin header.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (corsOrigins.includes(origin) || localhostOriginPattern.test(origin)) {
      callback(null, true);
      return;
    }

    // Deny cleanly without throwing a server error.
    callback(null, false);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/inventory-movements', inventoryMovementRoutes);
app.use('/api/messages', chatMessageRoutes);
app.use('/api/login-attempts', loginAttemptRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/driver-locations', driverLocationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/supplier-payment-methods', supplierPaymentMethodRoutes);
app.use('/api/factory-agents', factoryAgentRoutes);
app.use('/api/reviews', ratingReviewRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/drivers', driverRoutes);


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
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large. Max size is 10MB.' : err.message,
    });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

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
  await sequelize.sync()
    logger.info('✅ Database synced');
  }

  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
