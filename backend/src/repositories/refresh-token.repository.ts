import { BaseRepository } from './base.repository';
import RefreshToken from '../models/RefreshToken.model';
import User from '../models/user.model';
import { Op } from 'sequelize';
import { createHash } from '../utils/crypto';

export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor() {
    super(RefreshToken);
  }

  async findValidToken(token: string): Promise<RefreshToken | null> {
    const tokenHash = createHash(token);
    
    return this.model.findOne({
      where: {
        token_hash: tokenHash,
        expires_at: { [Op.gt]: new Date() },
        is_revoked: false
      },
      include: [{
        model: User,
        as: 'user',      // Must match the 'as' in association
        required: true
      }]
    });
  }

  async createToken(
    userId: string,
    token: string,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string
  ): Promise<RefreshToken> {
    const tokenHash = createHash(token);
    return this.model.create({
      id: require('uuid').v4(),
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      user_agent: userAgent,
      ip_address: ipAddress,
      is_revoked: false
    } as any);
  }

  async revokeToken(token: string): Promise<boolean> {
    const tokenHash = createHash(token);
    const [count] = await this.model.update(
      { is_revoked: true },
      { where: { token_hash: tokenHash } }
    );
    return count > 0;
  }

  async revokeAllUserTokens(userId: string): Promise<number> {
    const [count] = await this.model.update(
      { is_revoked: true },
      { where: { user_id: userId, is_revoked: false } }
    );
    return count;
  }
}