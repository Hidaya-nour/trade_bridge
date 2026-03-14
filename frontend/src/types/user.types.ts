// ============================================================================
// User Types (Aligned with backend/src/types/auth.types.ts)
// ============================================================================

export type UserRole = "retailer" | "distributor" | "factory" | "driver" | "admin";
export type UserStatus = "pending" | "active" | "suspended" | "rejected";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  password_hash?: string;
  business_name?: string;
  tin_number?: string;
  profile_image?: string;
  verified: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date;
  approved_at?: string | Date;
  approved_by?: string;
  last_login?: string | Date;
}
