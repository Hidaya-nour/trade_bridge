import api from './api';

class AuditLogService {
  async getAll(params?: any) {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/audit-logs/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/audit-logs', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/audit-logs/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/audit-logs/${id}`);
    return response.data;
  }
}

export default new AuditLogService();
