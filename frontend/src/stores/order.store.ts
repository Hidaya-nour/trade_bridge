import { create } from 'zustand';

import orderService from '../services/order.service';
import paymentService from '../services/payment.service';
import type { Order, OrderFilters } from '@/types/order.types';

const normalizePaymentMethod = (method?: string) =>
  method === 'chapa' ? 'app_payment' : method;

const normalizeOrder = (order: Order): Order => ({
  ...order,
  payment: order.payment
    ? {
        ...order.payment,
        payment_method: normalizePaymentMethod(order.payment.payment_method),
      }
    : order.payment,
});

const enrichOrdersWithPayments = async (orders: Order[]) => {
  const enriched = await Promise.all(
    orders.map(async (order) => {
      if (order.payment) return normalizeOrder(order);
      try {
        const response = await paymentService.getByOrderId(order.id);
        const payment =
          response?.data?.payment || response?.payment || response?.data;
        if (!payment) return normalizeOrder(order);
        return normalizeOrder({ ...order, payment });
      } catch {
        return normalizeOrder(order);
      }
    }),
  );
  return enriched;
};

interface OrderState {
  // Data
  orders: Order[];
  currentOrder: Order | null;
  totalOrders: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: OrderFilters;
  stats: any;

  // Actions - Buyer
  fetchMyOrders: (filters?: OrderFilters) => Promise<void>;
  fetchOrdersAsBuyer: (filters?: OrderFilters) => Promise<void>;
  fetchOrderById: (id: string) => Promise<Order | null>;
  
  // Actions - Supplier
  fetchOrdersAsSupplier: (filters?: OrderFilters) => Promise<void>;
  updateOrderStatus: (id: string, status: any) => Promise<boolean>;
  approveOrder: (id: string, deliveryFee: number) => Promise<boolean>;
  
  // Common Actions
  createOrder: (data: any) => Promise<Order | null>;
  cancelOrder: (id: string, reason?: string) => Promise<boolean>;
  fetchOrderSummary: (id: string) => Promise<any>;
  fetchOrderStats: () => Promise<void>;
  
  setFilters: (filters: OrderFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  totalOrders: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  filters: {},
  stats: null,

  // ========================================================================
  // Buyer Actions
  // ========================================================================

  fetchMyOrders: async (filters?: OrderFilters) => {
    set({ isLoading: true, error: null });
    try {
      const mergedFilters = { ...get().filters, ...filters };
      const response = await orderService.getMyOrders(mergedFilters);
      const ordersWithPayments = await enrichOrdersWithPayments(
        response.data.orders || [],
      );
      
      set({
        orders: ordersWithPayments,
        totalOrders: response.data.total,
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
        filters: mergedFilters,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch orders',
        isLoading: false,
      });
    }
  },

  fetchOrdersAsBuyer: async (filters?: OrderFilters) => {
    set({ isLoading: true, error: null });
    try {
      const mergedFilters = { ...get().filters, ...filters };
      const response = await orderService.getOrdersAsBuyer(mergedFilters);
      const ordersWithPayments = await enrichOrdersWithPayments(
        response.data.orders || [],
      );
      
      set({
        orders: ordersWithPayments,
        totalOrders: response.data.total,
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
        filters: mergedFilters,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch orders',
        isLoading: false,
      });
    }
  },

  fetchOrderById: async (id: string) => {
    set({ isLoading: true, error: null, currentOrder: null });
    try {
      const response = await orderService.getOrderById(id);
      const normalizedOrder = normalizeOrder(response.data.order);
      set({ currentOrder: normalizedOrder, isLoading: false });
      return normalizedOrder;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch order',
        isLoading: false,
      });
      return null;
    }
  },

  // ========================================================================
  // Supplier Actions
  // ========================================================================

  fetchOrdersAsSupplier: async (filters?: OrderFilters) => {
    set({ isLoading: true, error: null });
    try {
      const mergedFilters = { ...get().filters, ...filters };
      const response = await orderService.getOrdersAsSupplier(mergedFilters);
      
      set({
        orders: response.data.orders.map(normalizeOrder),
        totalOrders: response.data.total,
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
        filters: mergedFilters,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch orders',
        isLoading: false,
      });
    }
  },

  updateOrderStatus: async (id: string, statusData: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderService.updateOrderStatus(id, statusData);
      
      // Update order in list
      const orders = get().orders.map(o => 
        o.id === id ? normalizeOrder(response.data.order) : o
      );
      
      set({ orders, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update order status',
        isLoading: false,
      });
      return false;
    }
  },

  // Common Actions
approveOrder: async (id: string, deliveryFee: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderService.approveOrder(id, deliveryFee);
      
      const orders = get().orders.map(o => 
        o.id === id ? normalizeOrder(response.data.order) : o
      );
      
      set({ orders, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to approve order',
        isLoading: false,
      });
      return false;
    }
  },

  createOrder: async (data: any) => {
  set({ isLoading: true, error: null });
  try {
    // The backend will add buyer_id from auth token
    const response = await orderService.createOrder(data);
    
    // Refresh orders list
    await get().fetchMyOrders();
    
    set({ isLoading: false });
    return response.data.order;
  } catch (error: any) {
    set({
      error: error.response?.data?.message || 'Failed to create order',
      isLoading: false,
    });
    return null;
  }
},

  cancelOrder: async (id: string, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      await orderService.cancelOrder(id, { reason });
      
      // Update order status in list
      const orders = get().orders.map(o => 
        o.id === id ? { ...o, order_status: 'cancelled' as const } : o
      );
      
      set({ orders, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to cancel order',
        isLoading: false,
      });
      return false;
    }
  },

  fetchOrderSummary: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderService.getOrderSummary(id);
      set({ isLoading: false });
      return response.data.summary;
    }
    catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch order summary',
        isLoading: false,
      });
      return null;
    }
    },

    fetchOrderStats: async () => {
        set({ isLoading: true, error: null });
    try {      const response = await orderService.getOrderStats();
      set({ stats: response.data.stats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch order stats',
        isLoading: false,
      });
    }
    },

    setFilters: (filters: OrderFilters) => {
        set({ filters });
    },

    clearFilters: () => {
        set({ filters: {} });
    },

    clearError: () => {
        set({ error: null });
    },
}));
