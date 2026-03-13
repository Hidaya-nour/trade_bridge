import { create } from "zustand";
import orderService from "./order.service";
import { type Order, type OrderStats } from "./order.types";

interface OrderState {
  orders: Order[];
  stats: OrderStats | null;
  isLoading: boolean;
  error: string | null;
  fetchOrderStats: () => Promise<void>;
  fetchRecentOrders: () => Promise<void>;
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
  stats: null,
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
      set({ orders: response.data.orders, isLoading: false });
    } catch (error: any) {
      set({ error: getOrderErrorMessage(error), isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

