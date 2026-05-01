import api from './api';

export interface SubmitOrderPaymentData {
  payment_method: 'app_payment' | 'mobile_banking';
  amount_paid?: number;
  notes?: string;
  proof_document_id?: string;
  payment_details?: {
    transactionId?: string;
    transferDate?: string;
    mobileProvider?: string;
    phoneNumber?: string;
  };
}

class PaymentService {
  private formatErrorMessage(input: unknown): string {
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        if (parsed && typeof parsed === 'object') {
          return Object.entries(parsed as Record<string, unknown>)
            .map(([field, value]) => {
              if (Array.isArray(value)) {
                return `${field}: ${value.join(', ')}`;
              }
              return `${field}: ${String(value)}`;
            })
            .join(' | ');
        }
      } catch {
        return input;
      }
      return input;
    }
    if (input && typeof input === 'object') {
      return Object.entries(input as Record<string, unknown>)
        .map(([field, value]) =>
          `${field}: ${Array.isArray(value) ? value.join(', ') : String(value)}`,
        )
        .join(' | ');
    }
    return 'Payment submission failed';
  }

  async getByOrderId(orderId: string) {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  }

  async submitByOrder(orderId: string, data: SubmitOrderPaymentData) {
    try {
      const response = await api.post(`/payments/order/${orderId}/submit`, data);
      return response.data;
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      const message =
        backendMessage !== undefined
          ? this.formatErrorMessage(backendMessage)
          : this.formatErrorMessage(error?.message);
      throw new Error(message);
    }
  }

  async updateStatus(id: string, status: string, amount_paid?: number) {
    const response = await api.patch(`/payments/${id}/status`, {
      status,
      amount_paid,
    });
    return response.data;
  }

  async verifyChapa(txRef: string) {
    const response = await api.get(
      `/payments/chapa/callback?tx_ref=${encodeURIComponent(txRef)}`,
    );
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
