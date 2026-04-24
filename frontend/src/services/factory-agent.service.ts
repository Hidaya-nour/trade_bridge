import api from './api';

class FactoryAgentService {
  // Backwards-compatible aliases (some older stores expect these names)
  async getAll(params?: any) {
    return this.getFactoryAgents(params);
  }

  async getById(id: string) {
    const response = await this.getFactoryAgents();
    const payload = response?.data ?? response;
    const list = Array.isArray(payload) ? payload : [];
    const found = list.find((row: any) => row?.id === id) || null;
    return { success: true, data: found };
  }

  async getFactoryAgents(params?: any) {
    const response = await api.get('/factory-agents/factory', { params });
    return response.data;
  }

  async getAgentContracts(params?: any) {
    const response = await api.get('/factory-agents/agent', { params });
    return response.data;
  }

  async getAvailableAgents(search?: string) {
    const params = search ? { search: search.trim() } : undefined;
    const response = await api.get('/factory-agents/available-agents', { params });
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

  async terminate(id: string, termination_reason: string) {
    const response = await api.patch(`/factory-agents/${id}/terminate`, {
      termination_reason,
    });
    return response.data;
  }

  async updateLastSale(id: string) {
    const response = await api.patch(`/factory-agents/${id}/last-sale`);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/factory-agents/${id}`);
    return response.data;
  }
}

export default new FactoryAgentService();
