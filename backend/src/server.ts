import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize, { testConnection } from './config/database';
import authRoutes from './routes/auth.routes';
import logger from './utils/logger';

// 1️⃣ FIRST: Import models (order doesn't matter now)
import './models/user.model';
import './models/RefreshToken.model';

// 2️⃣ SECOND: Setup associations AFTER models are loaded
import { setupAssociations } from './models/associations';

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