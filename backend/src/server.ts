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
import './models/broadcast.model';
import './models/inventory-movement.model';
import './models/chat-message.model';
import './models/login-attempt.model';
import './models/document.model';
import './models/address.model';
import './models/driver-location.model';
import './models/driver-issue-report.model';
import './models/audit-log.model';
import './models/supplier-payment-method.model';
import './models/factory-agent.model';
import './models/rating-reviews.model';
import './models/driver.model';
import './models/cart.model';
import './models/cart-item.model';
import './models/broadcast.model';
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
import './models/supplier-review.model';
import UserReport from './models/user-report.model';
import SuspensionAppeal from './models/suspension-appeal.model';
import './models/driver.model';
import './models/dispute.model';
import './models/payment.model';
import './models/withdrawal.model';

import { setupAssociations } from './models/associations';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import cartRoutes from './routes/cart.routes';
import notificationRoutes from './routes/notification.routes';
import disputeRoutes from './routes/dispute.routes';
import broadcastRoutes from './routes/broadcast.routes';
import paymentRoutes from './routes/payment.routes';
import walletRoutes from './routes/wallet.routes';
import inventoryMovementRoutes from './routes/inventory-movement.routes';
import chatMessageRoutes from './routes/chat-message.route';
import loginAttemptRoutes from './routes/login-attempt.routes';
import documentRoutes from './routes/document.routes';
import addressRoutes from './routes/address.routes';
import driverLocationRoutes from './routes/driver-location.routes';
import driverIssueReportRoutes from './routes/driver-issue-report.routes';
import auditLogRoutes from './routes/audit-log.routes';
import supplierPaymentMethodRoutes from './routes/supplier-payment-method.routes';
import factoryAgentRoutes from './routes/factory-agent.routes';
import ratingReviewRoutes from './routes/rating-review.routes';
import supplierRoutes from './routes/supplier.routes'
import driverRoutes from './routes/driver.routes';
import deliveryRoutes from './routes/delivery.routes';
import forecastRoutes from './routes/forecast.routes';
import reportRoutes from './routes/report.routes';
import Withdrawal from './models/withdrawal.model';
import { AppError, ValidationError } from './utils/errors';
import { ensureWalletSchema } from './utils/ensure-wallet-schema';
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
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/inventory-movements', inventoryMovementRoutes);
// Prefer "stock" naming going forward; keep inventory route for backward compatibility.
app.use('/api/stock-movements', inventoryMovementRoutes);
app.use('/api/messages', chatMessageRoutes);
app.use('/api/login-attempts', loginAttemptRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/driver-locations', driverLocationRoutes);
app.use('/api/driver-issues', driverIssueReportRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/supplier-payment-methods', supplierPaymentMethodRoutes);
app.use('/api/factory-agents', factoryAgentRoutes);
app.use('/api/reviews', ratingReviewRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/reports', reportRoutes);

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

  if (process.env.NODE_ENV !== 'production') {
    try {
      await sequelize.sync({ alter: false });
      logger.info('✅ Database synced');
    } catch (error) {
      logger.error('❌ Database sync failed', error);
      process.exit(1);
    }
  }

  try {
    await ensureWalletSchema();
    logger.info('✅ Wallet schema ready');
  } catch (error) {
    logger.error('❌ Wallet schema migration failed', error);
    process.exit(1);
  }

  if (process.env.NODE_ENV !== 'production') {
    try {
      await sequelize.query(
        "UPDATE supplier_payment_methods SET method_type='mobile_banking' WHERE method_type='' OR method_type IS NULL",
      );
      await sequelize.query(
        "ALTER TABLE `supplier_payment_methods` MODIFY `method_type` VARCHAR(50) NOT NULL",
      );
      await sequelize.query(
        "ALTER TABLE `products` MODIFY `delivery_pricing` ENUM('free','paid') NULL DEFAULT 'free'",
      );
      await sequelize.query(
        "UPDATE `products` SET `delivery_pricing`=NULL WHERE `delivery_available`=false",
      );
      await sequelize.query(
        "ALTER TABLE `supplier_payment_methods` ADD COLUMN IF NOT EXISTS `credit_due_days` INT NULL",
      );
      await sequelize.query(
        "ALTER TABLE `supplier_payment_methods` ADD COLUMN IF NOT EXISTS `credit_limit` DECIMAL(12,2) NULL",
      );
      await sequelize.query(
        "ALTER TABLE `payments` MODIFY `payment_method` ENUM('mobile_banking','chapa','credit','cod') NOT NULL",
      );
    } catch (error) {
      logger.warn(
        'Skipping development database normalization (tables may not exist yet)',
        error,
      );
    }
  }

   try {
    await UserReport.sync();
  } catch (error) {
    logger.warn('Failed to ensure user_reports table exists', error);
  }
 try {
    await SuspensionAppeal.sync();
  } catch (error) {
    logger.warn('Failed to ensure suspension_appeals table exists', error);
  }
  try {
    await Withdrawal.sync();
  } catch (error) {
    logger.warn('Failed to ensure withdrawals table exists', error);
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
};

startServer();


