import { create } from 'zustand';
import { notificationService } from '../services/notification.service';
import type { Notification, NotificationFilters } from '@/types/notification.types';

interface NotificationCounts {
  total: number;
  unread: number;
}

interface NotificationState {
  notifications: Notification[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  counts: NotificationCounts;
  isLoadingCounts: boolean;
  filters: NotificationFilters;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  fetchCounts: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  pushNotification: (item: Notification) => void;
  deleteNotification: (id: string) => Promise<void>;
  incrementUnread: () => void;
  decrementUnread: (amount?: number) => void;
  setFilters: (filters: NotificationFilters) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  counts: {
    total: 0,
    unread: 0,
  },
  isLoadingCounts: false,
  filters: { page: 1, limit: 20 },

  fetchNotifications: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const merged = { ...get().filters, ...filters };
      const response = await notificationService.getNotifications(merged);
      set({
        notifications: response.data.notifications || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        totalPages: response.data.totalPages || 1,
        counts: {
          ...get().counts,
          unread: response.data.unread_count ?? get().counts.unread,
        },
        filters: merged,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch notifications',
        isLoading: false,
      });
    }
  },

  fetchCounts: async () => {
    set({ isLoadingCounts: true, error: null });
    try {
      const response = await notificationService.getCounts();
      set({
        counts: {
          total: response.data.total || 0,
          unread: response.data.unread || 0,
        },
        isLoadingCounts: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch notification counts',
        isLoadingCounts: false,
      });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: 1 } : n
        ),
      }));
      get().decrementUnread(1);
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to mark notification as read' });
    }
  },

  markAllRead: async () => {
    try {
      await notificationService.markAllRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: 1 })),
        counts: { ...state.counts, unread: 0 },
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to mark all notifications as read' });
    }
  },

  clearAll: async () => {
    try {
      await notificationService.clearAll();
      set({
        notifications: [],
        total: 0,
        page: 1,
        totalPages: 1,
        counts: { total: 0, unread: 0 },
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to clear notifications' });
    }
  },

  pushNotification: (item: Notification) => {
    set((state) => ({
      notifications: [item, ...state.notifications],
      total: state.total + 1,
      counts: {
        total: state.counts.total + 1,
        unread: item.is_read ? state.counts.unread : state.counts.unread + 1,
      },
    }));
  },

  deleteNotification: async (id: string) => {
    try {
      const target = get().notifications.find((n) => n.id === id);
      await notificationService.deleteNotification(id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        total: Math.max(0, state.total - 1),
        counts: {
          total: Math.max(0, state.counts.total - 1),
          unread:
            target && !target.is_read
              ? Math.max(0, state.counts.unread - 1)
              : state.counts.unread,
        },
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete notification' });
    }
  },

  incrementUnread: () => {
    const { counts } = get();
    set({
      counts: {
        ...counts,
        unread: counts.unread + 1,
        total: counts.total + 1,
      },
    });
  },

  decrementUnread: (amount: number = 1) => {
    const { counts } = get();
    set({
      counts: {
        ...counts,
        unread: Math.max(0, counts.unread - amount),
      },
    });
  },

  setFilters: (filters: NotificationFilters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  clearError: () => set({ error: null }),
}));

