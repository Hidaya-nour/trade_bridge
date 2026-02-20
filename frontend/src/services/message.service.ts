import api from './api';

class MessageService {
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
}

export default new MessageService();
