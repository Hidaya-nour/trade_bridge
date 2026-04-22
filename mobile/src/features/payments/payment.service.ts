import api from "@/lib/api";

export interface SubmitOrderPaymentData {
  payment_method: "app_payment" | "mobile_banking";
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

const paymentService = {
  async getByOrderId(orderId: string) {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  },

  async submitByOrder(orderId: string, data: SubmitOrderPaymentData) {
    const response = await api.post(`/payments/order/${orderId}/submit`, data);
    return response.data;
  },
};

export default paymentService;
