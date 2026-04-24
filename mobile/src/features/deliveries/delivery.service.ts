import api from "@/lib/api";

export type AssignDriverForOrderPayload = {
  driver_id: string;
  pickup_location?: string;
  dropoff_location: string;
};

type AssignDriverResponse = {
  data?: {
    delivery?: any;
  };
};

const deliveryService = {
  async assignDriverForOrder(orderId: string, payload: AssignDriverForOrderPayload) {
    const response = await api.post<AssignDriverResponse>(
      `/deliveries/order/${orderId}/assign-driver`,
      payload,
    );
    return response.data;
  },
};

export default deliveryService;

