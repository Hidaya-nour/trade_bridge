export type PaymentRole = "retailer" | "distributor";

export interface Payment {
  id: string;
  orderId: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "refunded";
  method: "Credit" | "Mobile Banking" | "Cash" | "Bank Transfer" | "Cheque";
  reference?: string;
  invoiceUrl?: string;
}

export interface CreditSummary {
  totalSpent: number;
  outstanding: number;
  creditLimit: number;
  available: number;
  paymentTerms: string;
  nextPaymentDate: string;
}
