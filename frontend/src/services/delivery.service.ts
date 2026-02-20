import api from './api';

class DeliveryService {
  async getAll(params?: any) {
    const response = await api.get('/deliverys', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/deliverys/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/deliverys', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/deliverys/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/deliverys/${id}`);
    return response.data;
  }
}

export default new DeliveryService();
