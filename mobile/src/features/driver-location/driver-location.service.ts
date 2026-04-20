import api from "@/lib/api";

export type DriverLocationPoint = {
  id: string;
  order_id?: string | null;
  driver_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
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
