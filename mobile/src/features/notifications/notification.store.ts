import { create } from "zustand";
import notificationService from "./notification.service";
import type {
  Notification,
  NotificationCounts,
  NotificationFilters,
} from "./notification.types";

interface NotificationState {
  notifications: Notification[];
  counts: NotificationCounts;
  filters: NotificationFilters;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  fetchCounts: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  setFilters: (filters: NotificationFilters) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  counts: { unread: 0, total: 0 },
  filters: { page: 1, limit: 50 },
  isLoading: false,
  isRefreshing: false,
  error: null,

  fetchNotifications: async (filters = {}) => {
    const hasExisting = get().notifications.length > 0;
    set({
      isLoading: !hasExisting,
      isRefreshing: hasExisting,
      error: null,
    });

    try {
      const mergedFilters = { ...get().filters, ...filters };
      const response = await notificationService.getNotifications(mergedFilters);
      set({
        notifications: response.data.notifications || [],
        counts: {
          ...get().counts,
          unread: response.data.unread_count ?? get().counts.unread,
          total: response.data.total ?? get().counts.total,
        },
        filters: mergedFilters,
        isLoading: false,
        isRefreshing: false,
      });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to load notifications.",
        isLoading: false,
        isRefreshing: false,
      });
    }
  },

  fetchCounts: async () => {
    try {
      const response = await notificationService.getCounts();
      set({ counts: response.data });
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message || "Failed to load notification counts.",
      });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id ? { ...notification, is_read: 1 } : notification,
        ),
        counts: {
          ...state.counts,
          unread: Math.max(
            0,
            state.counts.unread -
              (state.notifications.find((notification) => notification.id === id)?.is_read
                ? 0
                : 1),
          ),
        },
      }));
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to mark notification as read.",
      });
    }
  },

  markAllRead: async () => {
    try {
      await notificationService.markAllRead();
      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          is_read: 1,
        })),
        counts: { ...state.counts, unread: 0 },
      }));
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message || "Failed to mark notifications as read.",
      });
    }
  },

  clearAll: async () => {
    try {
      await notificationService.clearAll();
      set({
        notifications: [],
        counts: { unread: 0, total: 0 },
      });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to clear notifications.",
      });
    }
  },

  deleteNotification: async (id: string) => {
    try {
      const target = get().notifications.find((notification) => notification.id === id);
      await notificationService.deleteNotification(id);
      set((state) => ({
        notifications: state.notifications.filter((notification) => notification.id !== id),
        counts: {
          total: Math.max(0, state.counts.total - 1),
          unread:
            target && !target.is_read
              ? Math.max(0, state.counts.unread - 1)
              : state.counts.unread,
        },
      }));
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to delete notification.",
      });
    }
  },

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

  clearError: () => set({ error: null }),
}));
