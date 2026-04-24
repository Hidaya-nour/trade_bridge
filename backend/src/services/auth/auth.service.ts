import { UserRepository } from '../../repositories/user.repository';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { EmailService } from '../notification/email.service';
import { AppError, AuthError } from '../../utils/errors';
import logger from '../../utils/logger';
import { IUser, ITokens, UserRole, UserStatus } from '../../types/auth.types';
import crypto from 'crypto';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '../../config/cloudinary';

export interface RegisterDTO {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  business_name?: string;
  tin_number?: string;
  is_vat_registered?: boolean;
  vat_rate?: number;
}

export interface LoginDTO {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface UpdateProfileDTO {
  full_name?: string;
  phone?: string;
  business_name?: string;
  tin_number?: string;
  is_vat_registered?: boolean;
  vat_rate?: number;
  profile_image?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
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

  const status = 'active';

  // Create user
  const user = await this.userRepo.create({
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    phone: data.phone,
    password_hash,
    business_name: data.business_name,
    tin_number: data.tin_number,
    is_vat_registered: data.is_vat_registered === true,
    vat_rate:
      data.vat_rate !== undefined && data.vat_rate !== null
        ? Number(data.vat_rate)
        : 0.15,
    status
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

    // Verify password
    const isValidPassword = await this.passwordService.verifyPassword(
      data.password,
      user.password_hash
    );

    if (!isValidPassword) {
      throw new AuthError('Invalid email or password');
    }

    if (user.status === 'suspended') {
      throw new AppError(
        'Your account has been suspended. Please contact the admin to appeal.',
        403,
        true,
        'ACCOUNT_SUSPENDED',
      );
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

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await this.userRepo.findById(userId);
    if (!user || user.deleted_at) {
      throw new AppError('User not found', 404);
    }

    const userResponse = user.toJSON() as any;
    const { password_hash: _, ...safeUser } = userResponse;
    return safeUser as SafeUser;
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<SafeUser> {
    const user = await this.userRepo.findById(userId);
    if (!user || user.deleted_at) {
      throw new AppError('User not found', 404);
    }

    const updates: UpdateProfileDTO = {};
    if (typeof data.full_name === 'string') updates.full_name = data.full_name.trim();
    if (typeof data.phone === 'string') updates.phone = data.phone.trim();
    if (typeof data.business_name === 'string') updates.business_name = data.business_name.trim();
    if (typeof data.tin_number === 'string') updates.tin_number = data.tin_number.trim();
    if (typeof data.is_vat_registered === 'boolean') {
      updates.is_vat_registered = data.is_vat_registered;
    }
    if (data.vat_rate !== undefined && data.vat_rate !== null) {
      const parsedVatRate = Number(data.vat_rate);
      if (!Number.isNaN(parsedVatRate)) {
        updates.vat_rate = parsedVatRate;
      }
    }
    if (typeof data.profile_image === 'string') updates.profile_image = data.profile_image.trim();

    await this.userRepo.update(userId, updates as any);

    const updated = await this.userRepo.findById(userId);
    if (!updated) {
      throw new AppError('Failed to update profile', 500);
    }

    const updatedResponse = updated.toJSON() as any;
    const { password_hash: _, ...safeUser } = updatedResponse;
    return safeUser as SafeUser;
  }

  async changePassword(userId: string, data: ChangePasswordDTO): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user || user.deleted_at) {
      throw new AppError('User not found', 404);
    }

    const isValidCurrent = await this.passwordService.verifyPassword(
      data.currentPassword,
      user.password_hash
    );
    if (!isValidCurrent) {
      throw new AppError('Current password is incorrect', 400);
    }

    this.passwordService.validatePasswordStrength(data.newPassword);

    const isSameAsOld = await this.passwordService.verifyPassword(
      data.newPassword,
      user.password_hash
    );
    if (isSameAsOld) {
      throw new AppError('New password must be different from current password', 400);
    }

    const password_hash = await this.passwordService.hashPassword(data.newPassword);
    await this.userRepo.update(userId, { password_hash } as any);

    await this.tokenService.revokeAllUserTokens(userId);
    logger.info(`Password changed for user: ${userId}`);
  }

  async approveUser(userId: string, approvedBy: string): Promise<SafeUser> {
    const user = await this.userRepo.findById(userId);
    if (!user || user.deleted_at) {
      throw new AppError('User not found', 404);
    }

    await this.userRepo.approveUser(userId, approvedBy);
    const updated = await this.userRepo.findById(userId);
    if (!updated) {
      throw new AppError('Failed to approve user', 500);
    }

    const updatedResponse = updated.toJSON() as any;
    const { password_hash: _, ...safeUser } = updatedResponse;
    return safeUser as SafeUser;
  }

  async suspendUser(userId: string): Promise<SafeUser> {
    const user = await this.userRepo.findById(userId);
    if (!user || user.deleted_at) {
      throw new AppError('User not found', 404);
    }

    await this.userRepo.suspendUser(userId);
    const updated = await this.userRepo.findById(userId);
    if (!updated) {
      throw new AppError('Failed to suspend user', 500);
    }

    const updatedResponse = updated.toJSON() as any;
    const { password_hash: _, ...safeUser } = updatedResponse;
    return safeUser as SafeUser;
  }

  async reactivateUser(userId: string): Promise<SafeUser> {
    const user = await this.userRepo.findById(userId);
    if (!user || user.deleted_at) {
      throw new AppError('User not found', 404);
    }

    await this.userRepo.update(userId, { status: 'active' } as any);
    const updated = await this.userRepo.findById(userId);
    if (!updated) {
      throw new AppError('Failed to reactivate user', 500);
    }

    const updatedResponse = updated.toJSON() as any;
    const { password_hash: _, ...safeUser } = updatedResponse;
    return safeUser as SafeUser;
  }

  async uploadProfileImage(userId: string, file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new AppError('Profile image is required', 400);
    }

    if (!isCloudinaryConfigured()) {
      throw new AppError(
        'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
        500
      );
    }

    const folder = `trade_bridge/avatars/${userId}`;
    const uploaded = await uploadBufferToCloudinary(file, folder);
    return uploaded.secure_url;
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

  /**
   * Get users for admin (with pagination and filtering)
   */
  async getUsers(options?: {
    limit?: number;
    offset?: number;
    role?: UserRole;
    status?: UserStatus;
    search?: string;
    orderBy?: 'created_at' | 'full_name' | 'email';
    orderDirection?: 'ASC' | 'DESC';
  }): Promise<{ users: SafeUser[]; total: number }> {
    const result = await this.userRepo.getUsers(options);
    
    // Remove password_hash from response
    const safeUsers = result.users.map(user => {
      const userJson = user.toJSON();
      const { password_hash: _, ...safeUser } = userJson;
      return safeUser as SafeUser;
    });

    return { users: safeUsers, total: result.total };
  }

  /**
   * Get recent users for admin dashboard
   */
  async getRecentUsers(limit: number = 10): Promise<SafeUser[]> {
    const users = await this.userRepo.getRecentUsers(limit);
    
    // Remove password_hash from response
    return users.map(user => {
      const userJson = user.toJSON();
      const { password_hash: _, ...safeUser } = userJson;
      return safeUser as SafeUser;
    });
  }

  async getUserByIdAdmin(userId: string): Promise<SafeUser> {
    const user = await this.userRepo.findById(userId);
    if (!user || (user as any).deleted_at) {
      throw new AppError('User not found', 404);
    }

    const userJson = user.toJSON();
    const { password_hash: _, ...safeUser } = userJson as any;
    return safeUser as SafeUser;
  }

  async updateUserByIdAdmin(
    userId: string,
    patch: Partial<{
      full_name: string;
      phone: string;
      business_name: string;
      role: UserRole;
      status: UserStatus;
      verified: boolean;
    }>,
  ): Promise<SafeUser> {
    const user = await this.userRepo.findById(userId);
    if (!user || (user as any).deleted_at) {
      throw new AppError('User not found', 404);
    }

    const next: any = {};

    if (patch.full_name !== undefined) next.full_name = String(patch.full_name || '').trim();
    if (patch.phone !== undefined) next.phone = String(patch.phone || '').trim();
    if (patch.business_name !== undefined) next.business_name = String(patch.business_name || '').trim();
    if (patch.role !== undefined) next.role = patch.role;
    if (patch.status !== undefined) next.status = patch.status;
    if (patch.verified !== undefined) next.verified = patch.verified === true;

    await this.userRepo.update(userId, next as any);
    return this.getUserByIdAdmin(userId);
  }
}
