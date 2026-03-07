import api from './api';
import type {
  NotificationCountsResponse,
  NotificationFilters,
  NotificationsResponse,
} from '@/types/notification.types';

class NotificationService {
  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationsResponse> {
    const response = await api.get('/notifications', { params: filters });
    return response.data;
  }

  async markAsRead(id: string) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllRead() {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  }

  async getCounts(): Promise<NotificationCountsResponse> {
    const response = await api.get('/notifications/counts');
    return response.data;
  }

  async createNotification(payload: { user_id: string; type: string; title: string; message: string }) {
    const response = await api.post('/notifications', payload);
    return response.data;
  }

  async deleteNotification(id: string) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }

  async clearAll() {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  }
}

export const notificationService = new NotificationService();
