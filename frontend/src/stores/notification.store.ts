import { create } from 'zustand';
import { notificationService } from '../services/notification.service';

interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  total: number;
  page: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  pushNotification: (item: NotificationItem) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  total: 0,
  page: 1,
  isLoading: false,
  error: null,

  fetchNotifications: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const data = await notificationService.getNotifications(page, limit);
      set({ notifications: data.data.notifications, total: data.data.total, page: data.data.page, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch', isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      set(state => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n) }));
    } catch (err) {
      console.error('Mark read failed', err);
    }
  },

  markAllRead: async () => {
    try {
      await notificationService.markAllRead();
      set(state => ({ notifications: state.notifications.map(n => ({ ...n, is_read: 1 })) }));
    } catch (err) {
      console.error('Mark all read failed', err);
    }
  },

  pushNotification: (item: NotificationItem) => {
    set(state => ({ notifications: [item, ...state.notifications], total: state.total + 1 }));
  }
}));
