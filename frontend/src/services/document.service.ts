import api from './api';

class DocumentService {
  async uploadPaymentProof(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', 'other');

    const response = await api.post('/documents', formData);

    return response.data;
  }

  async uploadDocument(
    file: File,
    documentType: "id_card" | "business_license" | "tax_certificate" | "other",
    issuedDate?: string,
    expiryDate?: string,
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);
    if (issuedDate) formData.append("issued_date", issuedDate);
    if (expiryDate) formData.append("expiry_date", expiryDate);

    const response = await api.post("/documents", formData);

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
