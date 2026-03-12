export interface IDriver {
  id: string;
  supplier_id: string;
  driver_id: string;
  driver_type?: string | null;
  vehicle_type?: string | null;
  license_plate?: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface CreateDriverDTO {
  supplier_id: string;
  driver_id: string;
  driver_type?: string;
  vehicle_type?: string;
  license_plate?: string;
}

export interface UpdateDriverDTO extends Partial<CreateDriverDTO> {
  active?: boolean;
}
