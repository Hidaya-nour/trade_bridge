import { Request, Response } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import User from '../models/user.model';
import SuspensionAppeal from '../models/suspension-appeal.model';

export class AuthController {
  private authService = new AuthService();
  private ensureAppealsTableReady: Promise<void> | null = null;

  private async ensureAppealsTable() {
    if (!this.ensureAppealsTableReady) {
      this.ensureAppealsTableReady = SuspensionAppeal.sync().then(() => undefined);
    }
    await this.ensureAppealsTableReady;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      const role = req.body?.role;
      const needsApproval = role === 'factory' || role === 'distributor';
      res.status(201).json({
        success: true,
        message: needsApproval
          ? 'Registration successful. Please upload your business license for admin approval.'
          : 'Registration successful.',
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
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
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
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
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
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
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
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
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
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
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
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
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
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
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
      } else {
        logger.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  approveUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const user = await this.authService.approveUser(id, adminId);

      res.json({
        success: true,
        message: 'User approved successfully',
        data: { user }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
      } else {
        logger.error('Approve user error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  appealSuspension = async (req: Request, res: Response): Promise<void> => {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const message = String(req.body?.message || '').trim();

      if (!email) {
        res.status(400).json({ success: false, message: 'email is required' });
        return;
      }
      if (!message) {
        res.status(400).json({ success: false, message: 'message is required' });
        return;
      }

      const user = await User.findOne({ where: { email } as any });
      if (!user) {
        res.status(404).json({ success: false, message: 'Account not found' });
        return;
      }

      if ((user as any).deleted_at) {
        res.status(404).json({ success: false, message: 'Account not found' });
        return;
      }

      if (user.status !== 'suspended') {
        res.status(400).json({ success: false, message: 'This account is not suspended' });
        return;
      }

      await this.ensureAppealsTable();

      const existing = await SuspensionAppeal.findOne({
        where: { user_id: user.id, status: 'open' } as any,
        order: [['created_at', 'DESC']],
      });

      const appeal = existing
        ? await existing.update({ message, updated_at: new Date() } as any)
        : await SuspensionAppeal.create({ user_id: user.id, message, status: 'open' } as any);

      res.status(201).json({
        success: true,
        message: 'Appeal submitted successfully',
        data: { appeal },
      });
    } catch (error) {
      logger.error('Suspension appeal error:', error);
      res.status(500).json({ success: false, message: 'Failed to submit appeal' });
    }
  };

  suspendUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const user = await this.authService.suspendUser(id);

      res.json({
        success: true,
        message: 'User suspended successfully',
        data: { user }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
      } else {
        logger.error('Suspend user error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  reactivateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const user = await this.authService.reactivateUser(id);

      res.json({
        success: true,
        message: 'User reactivated successfully',
        data: { user }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
      } else {
        logger.error('Reactivate user error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const {
        limit = '50',
        offset = '0',
        role,
        status,
        search,
        orderBy = 'created_at',
        orderDirection = 'DESC'
      } = req.query;

      const options = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        role: role as any,
        status: status as any,
        search: search as string,
        orderBy: orderBy as any,
        orderDirection: orderDirection as any
      };

      const result = await this.authService.getUsers(options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
      } else {
        logger.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  getRecentUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const users = await this.authService.getRecentUsers(limit);

      res.json({
        success: true,
        data: { users }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
      } else {
        logger.error('Get recent users error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const file = req.file as Express.Multer.File | undefined;
      const imageUrl = await this.authService.uploadProfileImage(userId, file as Express.Multer.File);

      res.status(201).json({
        success: true,
        data: { imageUrl }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
      } else {
        logger.error('Upload profile image error:', error);
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
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
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
        res.status(error.statusCode).json({
          success: false,
          ...(error.code ? { code: error.code } : {}),
          message: error.message
        });
      } else {
        logger.error('Password reset error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };
}
