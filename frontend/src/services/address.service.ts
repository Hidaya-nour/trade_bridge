import api from './api';

class AddressService {
  async getAll(params?: any) {
    const response = await api.get('/addresses', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/addresses', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  }
}

export default new AddressService();
