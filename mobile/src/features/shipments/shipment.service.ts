import api from "@/lib/api";
import { type ApiResponse } from "@/features/auth/auth.types";

export interface ShipmentRecord {
  id?: string;
  delivery_number?: string;
  order_id?: string;
  status?: string;
  updated_at?: string;
  created_at?: string;
  dropoff_location?: string;
  driver?: {
    full_name?: string;
    driverUser?: {
      full_name?: string;
    };
  };
  order?: {
    buyer?: {
      business_name?: string;
      full_name?: string;
    };
  };
}

const shipmentService = {
  async getAll(params?: Record<string, unknown>) {
    const response = await api.get<ApiResponse<{ deliveries: ShipmentRecord[] }> | any>("/deliveries", {
      params,
    });
    return response.data;
  },
};

export default shipmentService;
