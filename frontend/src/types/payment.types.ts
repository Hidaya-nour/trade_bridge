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

export type PaymentMethod =
  | "cash"
  | "credit"
  | "cheque"
  | "mobile_banking"
  | "chapa";

export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  icon: React.ElementType;
  description: string;
  requiresDocument?: boolean;
  requiresApproval?: boolean;
  enabled: boolean;
}

export interface PaymentDetails {
  notes?: string;
  creditCustomerName?: string;
  creditDueDate?: string;
  creditTerms?: string;
  chequeNumber?: string;
  bankName?: string;
  branch?: string;
  chequeDate?: string;
  drawerName?: string;
  transactionId?: string;
  mobileProvider?: string;
  phoneNumber?: string;
  transferDate?: string;
  chapaEmail?: string;
  chapaFirstName?: string;
  chapaLastName?: string;
  chapaTxRef?: string;
}

export interface PaymentDialogConfig {
  allowedMethods?: PaymentMethod[];
  creditTerms?: {
    enabled: boolean;
    maxCreditAmount?: number;
    dueDays?: number;
    interestRate?: number;
  };
  bankAccounts?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branch?: string;
  }[];
  chapaEnabled?: boolean;
  requireApprovalFor?: PaymentMethod[];
  maxDocumentSize?: number;
  allowedDocumentTypes?: string[];
}

export interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  onPaymentSubmit: (
    method: PaymentMethod,
    details: PaymentDetails,
    documents?: File[],
  ) => Promise<boolean>;
  isProcessing?: boolean;
  config?: PaymentDialogConfig;
}
