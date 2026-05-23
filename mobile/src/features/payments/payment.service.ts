import api from "@/lib/api";

export interface SubmitOrderPaymentData {
  payment_method: "app_payment" | "mobile_banking" | "credit" | "cod";
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

const submitByOrder = async (orderId: string, payload: any) => {
  return api.post(`/payments/order/${orderId}`, payload);
};

const uploadProofDocument = async (formData: FormData) => {
  return api.post("/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default {
  submitByOrder,
  uploadProofDocument,
};