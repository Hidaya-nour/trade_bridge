import api from './api';

class InventoryMovementService {
  async getAll(params?: any) {
    const response = await api.get('/inventory-movements', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/inventory-movements/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/inventory-movements', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/inventory-movements/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/inventory-movements/${id}`);
    return response.data;
  }
}

export default new InventoryMovementService();
