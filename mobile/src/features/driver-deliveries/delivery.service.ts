import api from "@/lib/api";
import { mapApiDeliveryToDriverDelivery } from "./delivery.utils";
import { type DriverDelivery } from "./delivery.types";

type DeliveriesResponse = {
  data?: {
    deliveries?: any[];
  };
};

const deliveryService = {
  async getMyDeliveries(): Promise<DriverDelivery[]> {
    const response = await api.get<DeliveriesResponse>("/deliveries/my-deliveries");
    const rows = Array.isArray(response.data?.data?.deliveries)
      ? response.data.data.deliveries
      : [];

    return rows.map(mapApiDeliveryToDriverDelivery);
  },
};

export default deliveryService;
