export interface IDriverLocation {
  id: string;
  driver_id: string;
  order_id?: string | null;
  latitude: number;
  longitude: number;
  recorded_at: Date;
  deleted_at?: Date | null;
}

export interface CreateDriverLocationDTO {
  driver_id: string;
  order_id?: string;
  latitude: number;
  longitude: number;
}

export interface UpdateDriverLocationDTO extends Partial<CreateDriverLocationDTO> {}