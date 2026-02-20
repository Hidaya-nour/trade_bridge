// services/message.service.ts
import api from './api';

class MessageService {
  // Existing methods
  async getAll(params?: any) {
    const response = await api.get('/messages', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/messages', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/messages/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  }

  // New methods needed
  async getConversations() {
    const response = await api.get('/messages/conversations');
    return response.data;
  }

  async getConversation(userId: string, params?: any) {
    const response = await api.get(`/messages/conversation/${userId}`, { params });
    return response.data;
  }

  async markAsRead(data: { sender_id: string }) {
    const response = await api.patch('/messages/mark-read', data);
    return response.data;
  }

  async getUnreadCount() {
    const response = await api.get('/messages/unread-count');
    return response.data;
  }
}

export default new MessageService();