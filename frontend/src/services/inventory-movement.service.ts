import api from './api';

class InventoryMovementService {
  async getAll(params?: any) {
    // Backward-compatible wrapper: API now prefers "stock-movements".
    const response = await api.get('/stock-movements', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/stock-movements/${id}`);
    return response.data;
  }

  async getByProduct(productId: string) {
    const response = await api.get(`/stock-movements/product/${productId}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/stock-movements', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/stock-movements/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/stock-movements/${id}`);
    return response.data;
  }
}

export default new InventoryMovementService();
