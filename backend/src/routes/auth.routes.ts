import express from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, authenticateAllowPending, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  emailSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../validations/auth.validation';
import { uploadProfileImageMiddleware } from '../middleware/upload.middleware';

const router = express.Router();
const authController = new AuthController();

// Rate limiting for auth routes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { success: false, message: 'Too many login attempts. Please try again later.' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: { success: false, message: 'Too many registration attempts. Please try again later.' }
});

// Public routes
router.post(
  '/register',
  registerLimiter,
//   validate(registerSchema),
  authController.register
);

router.post(
  '/login',
//   loginLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken
);

router.post('/logout', authController.logout);

// router.post(
//   '/password-reset-request',
//   validate(emailSchema),
//   authController.requestPasswordReset
// );

// router.post(
//   '/password-reset',
//   validate(resetPasswordSchema),
//   authController.resetPassword
// );

// Protected routes
router.get('/me', authenticateAllowPending, authController.getMe);
router.patch('/me', authenticateAllowPending, validate(updateProfileSchema), authController.updateMe);
router.patch('/change-password', authenticateAllowPending, validate(changePasswordSchema), authController.changePassword);
router.post('/profile-image', authenticateAllowPending, uploadProfileImageMiddleware, authController.uploadProfileImage);
router.post('/logout-all', authenticate, authController.logoutAll);

// Admin routes
router.post('/admin/approve/:id', authenticate, authorize('admin'), authController.approveUser);
router.get('/admin/users', authenticate, authorize('admin'), authController.getUsers);
router.get('/admin/recent-users', authenticate, authorize('admin'), authController.getRecentUsers);

export default router;
