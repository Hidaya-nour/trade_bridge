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
        payment_method: normalizePaymentMethod(order.payment.payment_method)!,
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
  lastFetchMode: "my" | "buyer" | "supplier" | null;
  lastFetchFilters: OrderFilters;

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

  // Realtime helpers
  upsertOrders: (orders: Order[]) => void;
  setCurrentOrder: (order: Order | null) => void;
  refreshLastOrdersSilent: () => Promise<void>;
  refreshOrderByIdSilent: (id: string) => Promise<Order | null>;
  
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
  lastFetchMode: null,
  lastFetchFilters: {},

  upsertOrders: (incoming: Order[]) => {
    if (!Array.isArray(incoming) || incoming.length === 0) return;
    const existing = get().orders || [];
    const byId = new Map(existing.map((order) => [String(order.id), order]));

    for (const nextOrder of incoming) {
      const id = String(nextOrder.id);
      const prev = byId.get(id);
      const merged: Order = prev
        ? ({
            ...prev,
            ...nextOrder,
            payment: nextOrder.payment ?? prev.payment,
          } as Order)
        : nextOrder;
      byId.set(id, merged);
    }

    // Preserve existing order list ordering; append any truly new items at end.
    const kept = existing.map((o) => byId.get(String(o.id))!).filter(Boolean);
    const appended = incoming
      .filter((o) => !existing.some((e) => String(e.id) === String(o.id)))
      .map((o) => byId.get(String(o.id))!)
      .filter(Boolean);

    set({ orders: [...kept, ...appended] });
  },

  setCurrentOrder: (order: Order | null) => set({ currentOrder: order }),

  refreshLastOrdersSilent: async () => {
    const mode = get().lastFetchMode;
    if (!mode) return;
    const filters = get().lastFetchFilters || get().filters || {};

    try {
      const response =
        mode === "my"
          ? await orderService.getMyOrders(filters)
          : mode === "buyer"
            ? await orderService.getOrdersAsBuyer(filters)
            : await orderService.getOrdersAsSupplier(filters);

      const rawOrders: Order[] = response?.data?.orders || [];
      const normalized = rawOrders.map(normalizeOrder);
      get().upsertOrders(normalized);
    } catch {
      // Silent refresh: do not surface errors or flip loading state.
    }
  },

  refreshOrderByIdSilent: async (id: string) => {
    try {
      const response = await orderService.getOrderById(id);
      const normalizedOrder = normalizeOrder(response.data.order);
      const current = get().currentOrder;
      set({
        currentOrder: current
          ? ({
              ...current,
              ...normalizedOrder,
              payment: normalizedOrder.payment ?? current.payment,
            } as Order)
          : normalizedOrder,
      });
      get().upsertOrders([normalizedOrder]);
      return normalizedOrder;
    } catch {
      return null;
    }
  },

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
        lastFetchMode: "my",
        lastFetchFilters: mergedFilters,
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
        lastFetchMode: "buyer",
        lastFetchFilters: mergedFilters,
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
        lastFetchMode: "supplier",
        lastFetchFilters: mergedFilters,
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
