// Note: `mobile_banking` and `chapa` are legacy DB values kept for backward compatibility.
export type PaymentMethodType =
  | 'mobile_money'
  | 'credit_card'
  | 'mobile_banking'
  | 'chapa'
  | 'credit';

export interface ISupplierPaymentMethod {
  id: string;
  supplier_id: string;
  method_type: PaymentMethodType;
  provider_name: string;
  account_holder_name: string;
  account_identifier: string;
  account_display: string;
  credit_due_days?: number | null;
  credit_limit?: number | null;
  is_primary: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreateSupplierPaymentMethodDTO {
  supplier_id: string;
  method_type: PaymentMethodType;
  provider_name: string;
  account_holder_name: string;
  account_identifier: string;
  account_display?: string;
  credit_due_days?: number | null;
  credit_limit?: number | null;
  is_primary?: boolean;
}

export interface UpdateSupplierPaymentMethodDTO extends Partial<CreateSupplierPaymentMethodDTO> {
  is_active?: boolean;
}
