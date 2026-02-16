import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UserRepository } from '../repositories/user.repository';
import logger from '../utils/logger';
import { ITokenPayload } from '../types/auth.types';

const userRepo = new UserRepository();

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}



export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    // ✅ REMOVED Redis cache check
    // Directly check database
    const dbUser = await userRepo.findById(decoded.id);
    
    if (!dbUser || dbUser.deleted_at || dbUser.status !== 'active') {
      res.status(401).json({ success: false, message: 'User not found or inactive' });
      return;
    }

    // Attach user to request
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      status: dbUser.status
    };

    next();

  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
      return;
    }

    next();
  };
};