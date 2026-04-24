import api from "@/lib/api";

export type DriverLocationPoint = {
  id: string;
  order_id?: string | null;
  driver_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
};

export type NearbyDriver = {
  id: string;
  driver_user_id: string;
  driver_type?: string | null;
  vehicle_type?: string | null;
  license_plate?: string | null;
  active: boolean;
  driver_user: {
    id: string;
    full_name: string;
    phone?: string | null;
    email?: string | null;
  } | null;
  last_location: {
    id: string;
    latitude: number;
    longitude: number;
    recorded_at: string;
  };
};

const driverLocationService = {
  async getByOrderId(orderId: string): Promise<DriverLocationPoint[]> {
    const response = await api.get(`/driver-locations/order/${orderId}`);
    const rows = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
        ? response.data
        : [];

    return rows as DriverLocationPoint[];
  },

  async getNearbyDrivers(limit = 30): Promise<NearbyDriver[]> {
    const response = await api.get(`/driver-locations/nearby`, {
      params: { limit },
    });

    const rows = Array.isArray(response.data?.data?.drivers)
      ? response.data.data.drivers
      : Array.isArray(response.data?.drivers)
        ? response.data.drivers
        : [];

    return rows as NearbyDriver[];
  },

  async create(data: {
    order_id: string;
    latitude: number;
    longitude: number;
  }) {
    const response = await api.post("/driver-locations", data);
    return response.data;
  },
};

export default driverLocationService;
