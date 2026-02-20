import api from './api';

class PromotionService {
  async getAll(params?: any) {
    const response = await api.get('/promotions', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/promotions/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/promotions', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/promotions/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/promotions/${id}`);
    return response.data;
  }
}

export default new PromotionService();
