import api from './api';

class DocumentService {
  async uploadPaymentProof(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', 'other');

    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async getAll(params?: any) {
    const response = await api.get('/documents', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/documents', data);
    return response.data;
  }

  async update(id: string, data: any) {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }
}

export default new DocumentService();
