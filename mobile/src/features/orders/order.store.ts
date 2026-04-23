import { create } from "zustand";
import orderService from "./order.service";
import {
  type CreateOrderPayload,
  type Order,
  type OrderFilters,
  type OrderStats,
} from "./order.types";

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  stats: OrderStats | null;
  totalOrders: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchOrderStats: () => Promise<void>;
  fetchRecentOrders: () => Promise<void>;
  fetchOrdersAsBuyer: (filters?: OrderFilters) => Promise<void>;
  fetchOrdersAsSupplier: (filters?: OrderFilters) => Promise<void>;
  fetchOrderById: (id: string) => Promise<Order | null>;
  createOrder: (payload: CreateOrderPayload) => Promise<Order | null>;
  cancelOrder: (id: string, reason?: string) => Promise<boolean>;
  clearError: () => void;
}

const getOrderErrorMessage = (error: any) => {
  if (!error?.response) {
    return "Unable to fetch orders. Check network/backend connection.";
  }

  return error?.response?.data?.message ?? "Failed to fetch order data";
};

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  currentOrder: null,
  stats: null,
  totalOrders: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,

  fetchOrderStats: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await orderService.getOrderStats();
      set({ stats: response.data.stats, isLoading: false });
    } catch (error: any) {
      set({ error: getOrderErrorMessage(error), isLoading: false });
    }
  },

  fetchRecentOrders: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await orderService.getMyOrders({
        limit: 4,
        sortBy: "created_at",
        sortOrder: "DESC",
      });
      set({
        orders: response.data.orders,
        totalOrders: response.data.total,
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: getOrderErrorMessage(error), isLoading: false });
    }
  },

  fetchOrdersAsBuyer: async (filters) => {
    set({ isLoading: true, error: null });

    try {
      const response = await orderService.getOrdersAsBuyer(filters);
      set({
        orders: response.data.orders,
        totalOrders: response.data.total,
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: getOrderErrorMessage(error), isLoading: false });
    }
  },

  fetchOrdersAsSupplier: async (filters) => {
    set({ isLoading: true, error: null });

    try {
      const response = await orderService.getOrdersAsSupplier(filters);
      set({
        orders: response.data.orders,
        totalOrders: response.data.total,
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: getOrderErrorMessage(error), isLoading: false });
    }
  },

  fetchOrderById: async (id) => {
    set({ isLoading: true, error: null, currentOrder: null });

    try {
      const response = await orderService.getOrderById(id);
      const order = response.data.order ?? null;
      set({ currentOrder: order, isLoading: false });
      return order;
    } catch (error: any) {
      set({ error: getOrderErrorMessage(error), isLoading: false });
      return null;
    }
  },

  createOrder: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const response = await orderService.createOrder(payload);
      set({ isLoading: false });
      return response.data.order ?? null;
    } catch (error: any) {
      set({ error: getOrderErrorMessage(error), isLoading: false });
      return null;
    }
  },

  cancelOrder: async (id, reason) => {
    set({ isLoading: true, error: null });

    try {
      await orderService.cancelOrder(id, reason);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? { ...order, order_status: "cancelled" } : order,
        ),
        currentOrder:
          state.currentOrder?.id === id
            ? { ...state.currentOrder, order_status: "cancelled" }
            : state.currentOrder,
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: getOrderErrorMessage(error), isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

