import api from './api';

class AddressService {
  async getAll(params?: any) {
    const response = await api.get('/addresss', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/addresss/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/addresss', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/addresss/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/addresss/${id}`);
    return response.data;
  }
}

export default new AddressService();
