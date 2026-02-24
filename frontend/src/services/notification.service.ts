import api from './api';

class NotificationService {
  async getNotifications(page = 1, limit = 20) {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
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
async   getCounts() {
    const response = await api.get('/notifications/counts');
    return response.data;
  }
  async createNotification(payload: { user_id: string; type: string; title: string; message: string }) {
    const response = await api.post('/notifications', payload);
    return response.data;
  }
  async deleteNotification(id: string) {
    console.log("Deleting notification:", id);
    const response = await api.delete(`/notifications/${id}`);
    console.log("Deleting notification:", id);
    return response.data;
  }
}

export const notificationService = new NotificationService();
