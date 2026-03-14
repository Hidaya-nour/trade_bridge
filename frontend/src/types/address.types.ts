// ============================================================================
// Address Types (Aligned with backend/src/types/address.types.ts)
// ============================================================================

export interface Address {
  id: string;
  user_id: string;
  region: string;
  city: string;
  subcity?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string | Date;
  updated_at?: string | Date | null;
  deleted_at?: string | Date | null;
}
