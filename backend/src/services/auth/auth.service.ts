import { UserRepository } from '../../repositories/user.repository';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { EmailService } from '../notification/email.service';
import { AppError, AuthError } from '../../utils/errors';
import logger from '../../utils/logger';
import { IUser, ITokens, UserRole } from '../../types/auth.types';
import crypto from 'crypto';

export interface RegisterDTO {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  business_name?: string;
  tin_number?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

// Type for safe user response (without sensitive data)
type SafeUser = Omit<IUser, 'password_hash'>;

export class AuthService {
  private userRepo = new UserRepository();
  private passwordService = new PasswordService();
  private tokenService = new TokenService();
  private emailService = new EmailService();

//   async register(data: RegisterDTO): Promise<{ user: SafeUser }> {
//     // Validate password strength
//     this.passwordService.validatePasswordStrength(data.password);

//     // Check if user exists
//     const existingUser = await this.userRepo.findByEmail(data.email);
//     if (existingUser) {
//       throw new AppError('User with this email already exists', 409);
//     }

//     // Hash password
//     const password_hash = await this.passwordService.hashPassword(data.password);

//     // Create user
//     const user = await this.userRepo.create({
//       email: data.email,
//       full_name: data.full_name,
//       role: data.role,
//       phone: data.phone,
//       password_hash,
//       business_name: data.business_name,
//       tin_number: data.tin_number,
//       status: data.role === 'admin' ? 'active' : 'pending'
//     });

//     // Send verification email
//     await this.emailService.sendWelcomeEmail(user.email, user.full_name);

//     // Log registration
//     logger.info(`User registered: ${user.id} (${user.role})`);

//     const userResponse = user.toJSON();
//     const { password_hash: _, ...safeUser } = userResponse;

//     return { user: safeUser as SafeUser };
//   }

async register(data: RegisterDTO): Promise<{ user: SafeUser }> {
  // Validate password strength
  this.passwordService.validatePasswordStrength(data.password);

  // Check if user exists
  const existingUser = await this.userRepo.findByEmail(data.email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const password_hash = await this.passwordService.hashPassword(data.password);

  // Create user
  const user = await this.userRepo.create({
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    phone: data.phone,
    password_hash,
    business_name: data.business_name,
    tin_number: data.tin_number,
    status: data.role === 'admin' ? 'active' : 'pending'
  });

  // ✅ COMMENT OUT EMAIL FOR NOW
  // await this.emailService.sendWelcomeEmail(user.email, user.full_name);

  // Log registration
  logger.info(`User registered: ${user.id} (${user.role})`);

  const userResponse = user.toJSON();
  const { password_hash: _, ...safeUser } = userResponse;

  return { user: safeUser as SafeUser };
}
  async login(data: LoginDTO): Promise<{ user: SafeUser; tokens: ITokens }> {
    // Find user by email
    const user = await this.userRepo.findByEmailWithPassword(data.email);
    if (!user) {
      throw new AuthError('Invalid email or password');
    }

    // Check if user is deleted
    if (user.deleted_at) {
      throw new AuthError('Account not found');
    }

    // Check account status
    if (user.status !== 'active') {
      throw new AppError(`Account is ${user.status}. Please contact support.`, 403);
    }

    // Verify password
    const isValidPassword = await this.passwordService.verifyPassword(
      data.password,
      user.password_hash
    );

    if (!isValidPassword) {
      throw new AuthError('Invalid email or password');
    }

    // Update last login
    await this.userRepo.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.tokenService.generateTokens(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      },
      data.userAgent,
      data.ipAddress
    );

    // Log login
    logger.info(`User logged in: ${user.id}`);

    const userResponse = user.toJSON();
    const { password_hash: _, ...safeUser } = userResponse;

    return { user: safeUser as SafeUser, tokens };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return this.tokenService.refreshAccessToken(refreshToken);
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(refreshToken: string, userId: string): Promise<void> {
    await this.tokenService.revokeToken(refreshToken);
    logger.info(`User logged out: ${userId}`);
  }

  /**
   * Logout user from all devices
   */
  async logoutAll(userId: string): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId);
    logger.info(`User logged out from all devices: ${userId}`);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists - just return silently
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store reset token in database (you'll need to add this field to your User model)
    // For now, we'll just log it (in production, you'd store this in a password_resets table)
    logger.info(`Password reset token generated for user ${user.id}: ${resetToken}`);

    // Send email with reset link
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    
    logger.info(`Password reset requested for user: ${user.id}`);
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate password strength
    this.passwordService.validatePasswordStrength(newPassword);

    // In a real implementation, you would:
    // 1. Look up the token in a password_resets table
    // 2. Check if it's expired
    // 3. Get the associated user ID
    
    // For now, this is a placeholder
    // You'll need to implement token storage in your database
    
    throw new AppError('Password reset functionality requires database token storage. Please implement a password_resets table.', 501);
    
    /* Example implementation when you add a password_resets table:
    
    // Find token in database
    const resetRecord = await this.passwordResetRepo.findValidToken(token);
    if (!resetRecord) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Find user
    const user = await this.userRepo.findById(resetRecord.userId);
    if (!user || user.deleted_at) {
      throw new AppError('User not found', 404);
    }

    // Hash new password
    const password_hash = await this.passwordService.hashPassword(newPassword);

    // Update password
    await this.userRepo.update(user.id, { password_hash } as any);

    // Revoke all refresh tokens (force re-login)
    await this.tokenService.revokeAllUserTokens(user.id);

    // Delete used token
    await this.passwordResetRepo.delete(token);

    logger.info(`Password reset completed for user: ${user.id}`);
    */
  }

  /**
   * Verify email (for future use)
   */
//   async verifyEmail(userId: string): Promise<void> {
//     await this.userRepo.update(userId, { verified: true } as any);
//     logger.info(`Email verified for user: ${userId}`);
//   }
}