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

interface NotificationCounts {
  total: number;
  unread: number;
}
interface NotificationState {
  notifications: NotificationItem[];
  total: number;
  page: number;
  isLoading: boolean;
  error: string | null;
 counts: NotificationCounts;
  
  // UI States
  isLoadingCounts: boolean;
  
  // Actions
  fetchCounts: () => Promise<void>;
  incrementUnread: () => void;
  decrementUnread: (amount?: number) => void;
  clearError: () => void;
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  pushNotification: (item: NotificationItem) => void;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  total: 0,
  page: 1,
  isLoading: false,
  error: null,

   counts: {
    total: 0,
    unread: 0
  },
  
  isLoadingCounts: false,

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
deleteNotification: async (id: string) => {
    try {
      // Assuming there's an API endpoint to delete a notification    
      await notificationService.deleteNotification(id);
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
        total: state.total - 1
      }));
    } catch (err) {
      console.error('Delete notification failed', err);
    } },
  pushNotification: (item: NotificationItem) => {
    set(state => ({ notifications: [item, ...state.notifications], total: state.total + 1 }));
  },

  fetchCounts: async () => {
    set({ isLoadingCounts: true, error: null });
    try {
      const response = await notificationService.getCounts();
      const data = response.data || response;
      
      set({ 
        counts: {
          total: data.total || 0,
          unread: data.unread || 0
        },
        isLoadingCounts: false 
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch notification counts',
        isLoadingCounts: false,
      });
    }
  },

  incrementUnread: () => {
    const { counts } = get();
    set({
      counts: {
        ...counts,
        unread: counts.unread + 1,
        total: counts.total + 1
      }
    });
  },

  decrementUnread: (amount: number = 1) => {
    const { counts } = get();
    set({
      counts: {
        ...counts,
        unread: Math.max(0, counts.unread - amount)
      }
    });
  },

  clearError: () => set({ error: null })

}));
