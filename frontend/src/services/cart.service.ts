import api from './api';

class CartService {
  async getAll(params?: any) {
    const response = await api.get('/cart', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/cart/${id}`);
    return response.data;
  }

  async create(data: any) {
    
    const response = await api.post('/cart', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/cart/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/cart/${id}`);
    return response.data;
  }
}

export default new CartService();
