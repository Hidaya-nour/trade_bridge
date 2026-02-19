import express from 'express';
import { LoginAttemptController } from '../controllers/login-attempt.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authorize } from '../middleware/auth.middleware';

const router = express.Router();
const loginAttemptController = new LoginAttemptController();

// ========================================================================
// Routes
// ========================================================================

// All login attempt routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// ========================================================================
// GET Routes
// ========================================================================

// GET /api/login-attempts/user/:email - Get login attempts for a user
router.get('/user/:email', validate(LoginAttemptController.emailValidation), loginAttemptController.getUserAttempts);

// GET /api/login-attempts/failed/:email - Get failed attempts for a user
router.get('/failed/:email', validate(LoginAttemptController.failedAttemptsValidation), loginAttemptController.getFailedAttempts);

// GET /api/login-attempts/stats/:email - Get login stats for a user
router.get('/stats/:email', validate(LoginAttemptController.emailValidation), loginAttemptController.getLoginStats);

// GET /api/login-attempts/blocked/:email - Check if account is blocked
router.get('/blocked/:email', validate(LoginAttemptController.emailValidation), loginAttemptController.checkBlockedStatus);

export default router;