export type UserRole = 'retailer' | 'distributor' | 'factory' | 'driver' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export interface IUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  password_hash: string;
  business_name?: string;
  business_address?: string;
  tin_number?: string;
  profile_image?: string;
  verified: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  approved_at?: Date;
  approved_by?: string;
  last_login?: Date;
}

export interface IRefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  is_revoked: boolean;
  user_agent?: string;
  ip_address?: string;
}

export interface ITokenPayload {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ILoginAttempt {
  email: string;
  ip_address?: string;
  success: boolean;
  created_at: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}