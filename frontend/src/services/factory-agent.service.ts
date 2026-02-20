import api from './api';

class FactoryAgentService {
  async getAll(params?: any) {
    const response = await api.get('/factory-agents', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/factory-agents/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/factory-agents', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/factory-agents/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/factory-agents/${id}`);
    return response.data;
  }
}

export default new FactoryAgentService();
