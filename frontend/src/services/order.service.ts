import type {
  CancelOrderData,
  CreateOrderData,
  OrderFilters,
  OrderReceipt,
  OrderReceiptVerification,
  OrderResponse,
  OrdersResponse,
  UpdateOrderStatusData,
} from '@/types/order.types';
import api from './api';


class OrderService {
  private formatErrorMessage(input: unknown): string {
    if (typeof input === "string") {
      return input;
    }
    if (Array.isArray(input)) {
      return input.map(String).join(", ");
    }
    if (input && typeof input === "object") {
      return Object.entries(input as Record<string, unknown>)
        .map(([field, value]) => {
          if (Array.isArray(value)) return `${field}: ${value.join(", ")}`;
          return `${field}: ${String(value)}`;
        })
        .join(" | ");
    }
    return "Request failed";
  }
  // ========================================================================
  // GET METHODS
  // ========================================================================

  async getMyOrders(filters?: OrderFilters): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.from_date) params.append('fromDate', filters.from_date);
    if (filters?.to_date) params.append('toDate', filters.to_date);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/orders/my-orders?${params.toString()}`);
    return response.data;
  }

  async getOrdersAsBuyer(filters?: OrderFilters): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.from_date) params.append('fromDate', filters.from_date);
    if (filters?.to_date) params.append('toDate', filters.to_date);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/orders/as-buyer?${params.toString()}`);
    return response.data;
  }

  async getOrdersAsSupplier(filters?: OrderFilters): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.from_date) params.append('fromDate', filters.from_date);
    if (filters?.to_date) params.append('toDate', filters.to_date);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/orders/as-supplier?${params.toString()}`);
    return response.data;
  }

  async getOrderById(id: string): Promise<OrderResponse> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }

  async getOrderSummary(id: string): Promise<any> {
    const response = await api.get(`/orders/${id}/summary`);
    return response.data;
  }

  async getOrderReceipt(id: string): Promise<{ success: boolean; data: { receipt: OrderReceipt } }> {
    const response = await api.get(`/orders/${id}/receipt`);
    return response.data;
  }

  async verifyReceipt(receiptNumber: string): Promise<{ success: boolean; data: { verification: OrderReceiptVerification } }> {
    const response = await api.get(`/orders/verify/receipt/${encodeURIComponent(receiptNumber)}`);
    return response.data;
  }

  async getOrderStats(): Promise<any> {
    const response = await api.get('/orders/stats');
    return response.data;
  }

  async getDriverReview(orderId: string): Promise<any> {
    const response = await api.get(`/orders/${encodeURIComponent(orderId)}/driver-review`);
    return response.data;
  }

  // CREATE METHODS
  async createOrder(data: CreateOrderData): Promise<OrderResponse> {
    console.log("Order payload:", JSON.stringify(data, null, 2));
    try {
      const response = await api.post("/orders", data);
      return response.data;
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      const backendErrors = error?.response?.data?.errors;
      const message =
        backendMessage !== undefined
          ? this.formatErrorMessage(backendMessage)
          : backendErrors !== undefined
            ? this.formatErrorMessage(backendErrors)
            : this.formatErrorMessage(error?.message);
      throw new Error(message);
    }
  }

  // UPDATE METHODS
  async updateOrderStatus(id: string, data: UpdateOrderStatusData): Promise<OrderResponse> {
    const response = await api.patch(`/orders/${id}/status`, data);
    return response.data;
  }

  async approveOrder(id: string, deliveryFee: number): Promise<OrderResponse> {
    const response = await api.put(`/orders/${id}/approve`, { delivery_fee: deliveryFee });
    return response.data;
  }

  async cancelOrder(id: string, data?: CancelOrderData): Promise<any> {
    const response = await api.patch(`/orders/${id}/cancel`, data || {});
    return response.data;
  }

  async submitDriverReview(orderId: string, payload: { rating: number; comment?: string }): Promise<any> {
    const response = await api.post(
      `/orders/${encodeURIComponent(orderId)}/driver-review`,
      payload,
    );
    return response.data;
  }
}

export default new OrderService();
