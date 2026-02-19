import { Request, Response } from 'express';
import { LoginAttemptService } from '../services/login-attempt/login-attempt.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { param, query } from 'express-validator';

const loginAttemptService = new LoginAttemptService();

export class LoginAttemptController {
  // Get login attempts for a user (admin only)
  async getUserAttempts(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const { limit } = req.query;

      const attempts = await loginAttemptService.getRecentAttempts(email, limit ? Number(limit) : 50);

      res.json({ success: true, data: attempts });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get user attempts error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get failed attempts for a user
  async getFailedAttempts(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const { hours } = req.query;

      const attempts = await loginAttemptService.getFailedAttempts(email, hours ? Number(hours) : 24);

      res.json({ success: true, data: attempts });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get failed attempts error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get login stats for a user
  async getLoginStats(req: Request, res: Response) {
    try {
      const { email } = req.params;

      const stats = await loginAttemptService.getLoginStats(email);

      res.json({ success: true, data: stats });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get login stats error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Check if account is blocked
  async checkBlockedStatus(req: Request, res: Response) {
    try {
      const { email } = req.params;

      const isBlocked = await loginAttemptService.isAccountBlocked(email);

      res.json({ success: true, data: { email, isBlocked } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Check blocked status error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Validation rules
  static emailValidation = [
    param('email').isEmail().withMessage('Invalid email address')
  ];

  static failedAttemptsValidation = [
    param('email').isEmail().withMessage('Invalid email address'),
    query('hours').optional().isInt({ min: 1, max: 168 }).withMessage('Hours must be between 1 and 168')
  ];
}