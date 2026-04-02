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

  // CREATE METHODS
  async createOrder(data: CreateOrderData): Promise<OrderResponse> {
    console.log("Order payload:", JSON.stringify(data, null, 2));
    const response = await api.post('/orders', data);
    return response.data;
  }

  // UPDATE METHODS
  async updateOrderStatus(id: string, data: UpdateOrderStatusData): Promise<OrderResponse> {
    const response = await api.patch(`/orders/${id}/status`, data);
    return response.data;
  }

  async cancelOrder(id: string, data?: CancelOrderData): Promise<any> {
    const response = await api.patch(`/orders/${id}/cancel`, data || {});
    return response.data;
  }
}

export default new OrderService();
