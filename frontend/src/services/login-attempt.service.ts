import api from './api';

class LoginAttemptService {
  async getAll(params?: any) {
    const response = await api.get('/login-attempts', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/login-attempts/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/login-attempts', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/login-attempts/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/login-attempts/${id}`);
    return response.data;
  }
}

export default new LoginAttemptService();
