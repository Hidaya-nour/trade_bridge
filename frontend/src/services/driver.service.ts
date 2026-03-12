import api from "./api";

export interface DriverUser {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
}

export interface Driver {
  id: string;
  supplier_id: string;
  driver_id: string;
  vehicle_type?: string | null;
  license_plate?: string | null;
  active: boolean;
  created_at: string;
  driver?: DriverUser;
}

class DriverService {
  private readonly BASE_PATH = "/drivers";

  async getMyDrivers(): Promise<{ drivers: Driver[] }> {
    const response = await api.get(this.BASE_PATH);
    const data = response.data?.data || response.data || response;
    return data as { drivers: Driver[] };
  }

  async getAvailableDrivers(search?: string): Promise<DriverUser[]> {
    const params = search ? { search: search.trim() } : {};
    const response = await api.get(`${this.BASE_PATH}/available-drivers`, { params });
    const data = response.data?.data || response.data || response;
    return (data as { drivers: DriverUser[] }).drivers ?? [];
  }

  async addDriver(payload: {
    driver_id: string;
    vehicle_type?: string;
    license_plate?: string;
  }): Promise<Driver> {
    const response = await api.post(this.BASE_PATH, payload);
    const data = response.data?.data || response.data || response;
    return (data as any).driver as Driver;
  }

  async updateDriver(
    id: string,
    payload: Partial<Pick<Driver, "vehicle_type" | "license_plate" | "active">>,
  ): Promise<Driver> {
    const response = await api.patch(`${this.BASE_PATH}/${id}`, payload);
    const data = response.data?.data || response.data || response;
    return (data as any).driver as Driver;
  }

  async removeDriver(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}

export default new DriverService();

