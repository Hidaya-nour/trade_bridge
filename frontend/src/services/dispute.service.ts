import api from './api';

const unwrapDisputePayload = (payload: any) => {
  if (payload?.data !== undefined) {
    return payload.data;
  }

  return payload;
};

class DisputeService {
  async getAll(params?: any) {
    const response = await api.get('/disputes', { params });
    const data = unwrapDisputePayload(response.data);
    return {
      disputes: data?.disputes || [],
      total: typeof data?.total === 'number' ? data.total : (data?.disputes || []).length,
    };
  }

  async getById(id: string) {
    const response = await api.get(`/disputes/${id}`);
    const data = unwrapDisputePayload(response.data);
    return data?.dispute || data;
  }

  async create(data: any) {
    const response = await api.post('/disputes', data);
    const payload = unwrapDisputePayload(response.data);
    return payload?.dispute || payload;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/disputes/${id}`, data);
    const payload = unwrapDisputePayload(response.data);
    return payload?.dispute || payload;
  }

  async delete(id: string) {
    const response = await api.delete(`/disputes/${id}`);
    return response.data;
  }
}

export default new DisputeService();
