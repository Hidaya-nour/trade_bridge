import api from './api';

class SupplierPaymentMethodService {
  async getAll(params?: any) {
    const response = await api.get('/supplier-payment-methods', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/supplier-payment-methods/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/supplier-payment-methods', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/supplier-payment-methods/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/supplier-payment-methods/${id}`);
    return response.data;
  }
}

export default new SupplierPaymentMethodService();
