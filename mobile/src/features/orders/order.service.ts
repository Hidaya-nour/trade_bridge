import api from "@/lib/api";
import { type ApiResponse } from "@/features/auth/auth.types";
import { type MyOrdersResult, type OrderStats } from "./order.types";

interface OrdersQuery {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

const orderService = {
  async getMyOrders(params?: OrdersQuery) {
    const response = await api.get<ApiResponse<MyOrdersResult>>("/orders/my-orders", {
      params,
    });
    return response.data;
  },

  async getOrderStats() {
    const response = await api.get<ApiResponse<{ stats: OrderStats }>>("/orders/stats");
    return response.data;
  },
};

export default orderService;

