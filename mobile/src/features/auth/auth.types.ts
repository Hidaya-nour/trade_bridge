export type UserRole =
  | "retailer"
  | "distributor"
  | "factory"
  | "driver"
  | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: string;
  phone?: string;
  business_name?: string;
  business_address?: string;
  tin_number?: string;
  is_vat_registered?: boolean;
  vat_rate?: number;
  profile_image?: string;
  verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string;
  business_name?: string;
  tin_number?: string;
  is_vat_registered?: boolean;
  vat_rate?: number;
  profile_image?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponseData {
  user: User;
  tokens: Tokens;
}

export interface ApiResponse<T> {
  order: import("../orders/order.types").Order;
  success: boolean;
  message?: string;
  data: T;
}
