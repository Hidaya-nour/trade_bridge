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

const extractOrdersResponse = (response: ApiResponse<MyOrdersResult>) => {
  const orders = response.data?.orders || response.data?.items || [];
  return {
    data: {
      orders: orders.map(normalizeOrder),
      total: response.data?.total || 0,
      page: response.data?.page || 1,
      limit: response.data?.limit || 10,
      totalPages: response.data?.totalPages || 1,
    }
  };
};

const normalizeOrder = (order: Order): Order => {
  const supplier = order.supplier;
  if (!supplier) return order;

  const supplierPaymentMethods =
    supplier.supplierPaymentMethods || supplier.paymentMethods || [];

  return {
    ...order,
    supplier: {
      ...supplier,
      supplierPaymentMethods,
    },
  };
};

const orderService = {
  async getMyOrders(params?: OrderFilters) {
    const response = await api.get<ApiResponse<MyOrdersResult>>("/orders/my-orders", {
      params: buildOrderParams(params),
    });
    return extractOrdersResponse(response.data);
  },

  async getOrdersAsBuyer(params?: OrderFilters) {
    const response = await api.get<ApiResponse<MyOrdersResult>>("/orders/as-buyer", {
      params: buildOrderParams(params),
    });
    return extractOrdersResponse(response.data);
  },

  async getOrdersAsSupplier(params?: OrderFilters) {
    const response = await api.get<ApiResponse<MyOrdersResult>>("/orders/as-supplier", {
      params: buildOrderParams(params),
    });
    return extractOrdersResponse(response.data);
  },

  async getOrderById(id: string) {
    const response = await api.get<ApiResponse<{ order: Order }>>(`/orders/${id}`);
    const order = response.data.data?.order;
    return {
      ...response.data,
      data: {
        order: order ? normalizeOrder(order) : order,
      },
    };
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
