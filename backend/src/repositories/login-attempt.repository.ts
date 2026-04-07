import { BaseRepository } from './base.repository';
import LoginAttempt from '../models/login-attempt.model';
import { Op } from 'sequelize';

export class LoginAttemptRepository extends BaseRepository<LoginAttempt> {
  constructor() {
    super(LoginAttempt);
  }

  async recordAttempt(email: string, ipAddress: string, userAgent?: string, success: boolean = false): Promise<LoginAttempt> {
    return this.model.create({
      email,
      ip_address: ipAddress,
      user_agent: userAgent,
      success
    });
  }

  async getFailedAttempts(email: string, since: Date): Promise<LoginAttempt[]> {
    return this.model.findAll({
      where: {
        email,
        success: false,
        attempted_at: {
          [Op.gte]: since
        }
      },
      order: [['attempted_at', 'DESC']]
    });
  }

  async getRecentAttempts(email: string, limit: number = 10): Promise<LoginAttempt[]> {
    return this.model.findAll({
      where: { email },
      order: [['attempted_at', 'DESC']],
      limit
    });
  }

  async countFailedAttempts(email: string, since: Date): Promise<number> {
    return this.model.count({
      where: {
        email,
        success: false,
        attempted_at: {
          [Op.gte]: since
        }
      }
    });
  }

  async isBlocked(email: string, maxAttempts: number = 5, windowMinutes: number = 15): Promise<boolean> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    const failedCount = await this.countFailedAttempts(email, since);
    return failedCount >= maxAttempts;
  }
}