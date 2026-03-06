import { Request, Response } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please wait for admin approval.',
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const userAgent = req.get('User-Agent');
      const ipAddress = req.ip;

      const result = await this.authService.login({
        email,
        password,
        userAgent,
        ipAddress
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Refresh token error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.id;

      if (refreshToken && userId) {
        await this.authService.logout(refreshToken, userId);
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  logoutAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (userId) {
        await this.authService.logoutAll(userId);
      }

      res.json({
        success: true,
        message: 'Logged out from all devices'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Logout all error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const user = await this.authService.getCurrentUser(userId);

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get me error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  updateMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const user = await this.authService.updateProfile(userId, req.body);
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      await this.authService.changePassword(userId, { currentPassword, newPassword });

      res.json({
        success: true,
        message: 'Password updated successfully. Please login again.'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      await this.authService.requestPasswordReset(email);

      res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Password reset request error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      await this.authService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Password reset error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };
}
