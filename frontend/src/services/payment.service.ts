import api from './api';

class PaymentService {
  async getAll(params?: any) {
    const response = await api.get('/payments', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/payments', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/payments/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  }
}

export default new PaymentService();
