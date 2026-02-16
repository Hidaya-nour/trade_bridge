import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { AppError } from '../../utils/errors';

export class PasswordService {
  async hashPassword(password: string): Promise<string> {
    return hashPassword(password);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return comparePassword(password, hash);
  }

  validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    if (!/[A-Z]/.test(password)) {
      throw new AppError('Password must contain at least one uppercase letter', 400);
    }

    if (!/[a-z]/.test(password)) {
      throw new AppError('Password must contain at least one lowercase letter', 400);
    }

    if (!/[0-9]/.test(password)) {
      throw new AppError('Password must contain at least one number', 400);
    }

    if (!/[!@#$%^&*]/.test(password)) {
      throw new AppError('Password must contain at least one special character (!@#$%^&*)', 400);
    }
  }
}