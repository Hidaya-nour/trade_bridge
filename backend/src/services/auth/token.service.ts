import { RefreshTokenRepository } from '../../repositories/refresh-token.repository';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from '../../utils/jwt';
import { ITokenPayload, ITokens } from '../../types/auth.types';
import { AppError } from '../../utils/errors';
import { User } from '../../models/user.model';

export class TokenService {
  private refreshTokenRepo = new RefreshTokenRepository();

  async generateTokens(user: ITokenPayload, userAgent?: string, ipAddress?: string): Promise<ITokens> {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();

    await this.refreshTokenRepo.createToken(
      user.id,
      refreshToken,
      expiresAt,
      userAgent,
      ipAddress
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const tokenRecord = await this.refreshTokenRepo.findValidToken(refreshToken);

    if (!tokenRecord) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // ✅ FIX 1: Type assertion for the get() method
    const user = await tokenRecord.get('user') as User | null;
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // ✅ FIX 2: Check user properties safely
    const userData = user.toJSON() as any;
    if (userData.deleted_at) {
      throw new AppError('Account not found', 404);
    }

    if (userData.status === 'suspended') {
      throw new AppError(
        'Your account has been suspended. Please contact the admin to appeal.',
        403,
        true,
        'ACCOUNT_SUSPENDED',
      );
    }

    if (!['active', 'pending'].includes(userData.status)) {
      throw new AppError('User account is not active', 403, true, 'ACCOUNT_INACTIVE');
    }

    const accessToken = generateAccessToken({
      id: userData.id,
      email: userData.email,
      role: userData.role,
      status: userData.status
    });

    return { accessToken };
  }

  async revokeToken(refreshToken: string): Promise<void> {
    await this.refreshTokenRepo.revokeToken(refreshToken);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepo.revokeAllUserTokens(userId);
  }
}
