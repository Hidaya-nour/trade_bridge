export type PaymentRole = "retailer" | "distributor";

export interface Payment {
  id: string;
  orderId: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "refunded";
  method: "App Payment" | "Mobile Banking";
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

export type PaymentMethod = "app_payment" | "mobile_banking" | "credit";

export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  icon: React.ElementType;
  description: string;
  requiresDocument?: boolean;
  requiresApproval?: boolean;
  enabled: boolean;
}

export interface SupplierPaymentMethodInfo {
  id: string;
  method_type: string;
  provider_name: string;
  account_holder_name: string;
  account_identifier?: string;
  account_display?: string;
  credit_due_days?: number | null;
  credit_limit?: number | null;
  is_primary?: boolean;
  is_active?: boolean;
}

export interface PaymentDetails {
  notes?: string;
  transactionId?: string;
  mobileProvider?: string;
  phoneNumber?: string;
  transferDate?: string;
}

export interface PaymentDialogConfig {
  allowedMethods?: PaymentMethod[];
  supplierAllowedMethods?: PaymentMethod[];
  supplierPaymentMethods?: SupplierPaymentMethodInfo[];
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
