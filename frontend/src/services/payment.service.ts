import api from './api';

export interface SubmitOrderPaymentData {
  payment_method: 'cash' | 'credit' | 'cheque' | 'mobile_banking' | 'chapa' | 'bank_transfer';
  amount_paid?: number;
  notes?: string;
  proof_document_id?: string;
  payment_details?: {
    chequeNumber?: string;
    bankName?: string;
    chequeDate?: string;
    transactionId?: string;
    transferDate?: string;
    chapaTxRef?: string;
    chapaPaymentUrl?: string;
  };
}

class PaymentService {
  async getByOrderId(orderId: string) {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  }

  async submitByOrder(orderId: string, data: SubmitOrderPaymentData) {
    const response = await api.post(`/payments/order/${orderId}/submit`, data);
    return response.data;
  }

  async updateStatus(id: string, status: string, amount_paid?: number) {
    const response = await api.patch(`/payments/${id}/status`, {
      status,
      amount_paid,
    });
    return response.data;
  }

  async getAll(params?: any) {
    const response = await api.get('/payments', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  }

  async create(data: any) {
    const response = await api.post('/payments', data);
    return response.data;
  }

  async update(id: string, data: any) {
    return this.updateStatus(id, data.status, data.amount_paid);
  }

  async delete(id: string) {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  }
}

export default new PaymentService();
