import { LoginAttemptRepository } from '../../repositories/login-attempt.repository';
import { ILoginAttempt } from '../../types/login-attempt.types';
import logger from '../../utils/logger';

export class LoginAttemptService {
  private attemptRepo = new LoginAttemptRepository();

  async recordLoginAttempt(email: string, ipAddress: string, userAgent?: string, success: boolean = false): Promise<ILoginAttempt> {
    const attempt = await this.attemptRepo.recordAttempt(email, ipAddress, userAgent, success);

    logger.info(`Login attempt recorded: ${email} from ${ipAddress}, success: ${success}`);

    return attempt;
  }

  async getFailedAttempts(email: string, hours: number = 24): Promise<ILoginAttempt[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.attemptRepo.getFailedAttempts(email, since);
  }

  async getRecentAttempts(email: string, limit: number = 10): Promise<ILoginAttempt[]> {
    return this.attemptRepo.getRecentAttempts(email, limit);
  }

  async isAccountBlocked(email: string, maxAttempts: number = 5, windowMinutes: number = 15): Promise<boolean> {
    return this.attemptRepo.isBlocked(email, maxAttempts, windowMinutes);
  }

  async getLoginStats(email: string): Promise<{
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    isBlocked: boolean;
  }> {
    const recentAttempts = await this.getRecentAttempts(email, 100);

    const totalAttempts = recentAttempts.length;
    const successfulAttempts = recentAttempts.filter(a => a.success).length;
    const failedAttempts = totalAttempts - successfulAttempts;
    const isBlocked = await this.isAccountBlocked(email);

    return {
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      isBlocked
    };
  }
}