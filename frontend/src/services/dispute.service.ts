import api from './api';

class DisputeService {
  async getAll(params?: any) {
    const response = await api.get('/disputes', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/disputes/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/disputes', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/disputes/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/disputes/${id}`);
    return response.data;
  }
}

export default new DisputeService();
