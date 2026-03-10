export interface IDriver {
  id: string;
  supplier_id: string;
  driver_id: string;
  vehicle_type?: string | null;
  license_plate?: string | null;
  active: boolean;
  created_at: Date;
  deleted_at?: Date | null;
}

export interface CreateDriverDTO {
  supplier_id: string;
  driver_id: string;
  vehicle_type?: string;
  license_plate?: string;
}

export interface UpdateDriverDTO extends Partial<CreateDriverDTO> {
  active?: boolean;
}

