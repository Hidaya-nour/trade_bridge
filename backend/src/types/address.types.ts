export interface IAddress {
  id: string;
  user_id: string;
  region: string;
  city: string;
  subcity?: string | null;
  common_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}
