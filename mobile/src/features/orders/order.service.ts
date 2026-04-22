import api from "@/lib/api";
import { type ApiResponse } from "@/features/auth/auth.types";
import {
  type CreateOrderPayload,
  type MyOrdersResult,
  type Order,
  type OrderFilters,
  type OrderStats,
} from "./order.types";

const buildOrderParams = (params?: OrderFilters) => ({
  status: params?.status,
  fromDate: params?.from_date,
  toDate: params?.to_date,
  limit: params?.limit,
  page: params?.page,
  sortBy: params?.sortBy,
  sortOrder: params?.sortOrder,
});

const orderService = {
  async getMyOrders(params?: OrderFilters) {
    const response = await api.get<ApiResponse<MyOrdersResult>>("/orders/my-orders", {
      params: buildOrderParams(params),
    });
    return response.data;
  },

  async getOrdersAsBuyer(params?: OrderFilters) {
    const response = await api.get<ApiResponse<MyOrdersResult>>("/orders/as-buyer", {
      params: buildOrderParams(params),
    });
    return response.data;
  },

  async getOrderById(id: string) {
    const response = await api.get<ApiResponse<{ order: Order }>>(`/orders/${id}`);
    return response.data;
  },

  async getOrderStats() {
    const response = await api.get<ApiResponse<{ stats: OrderStats }>>("/orders/stats");
    return response.data;
  },

  async createOrder(payload: CreateOrderPayload) {
    const response = await api.post<ApiResponse<{ order: Order }>>("/orders", payload);
    return response.data;
  },

  async cancelOrder(id: string, reason?: string) {
    const response = await api.patch<ApiResponse<{ success: boolean }>>(`/orders/${id}/cancel`, {
      reason,
    });
    return response.data;
  },
};

export default orderService;

