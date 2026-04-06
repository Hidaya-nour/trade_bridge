export type PaymentMethodType = 'cash_on_delivery' | 'mobile_money' | 'bank_transfer' | 'credit_card' | 'other';

export interface ISupplierPaymentMethod {
  id: string;
  supplier_id: string;
  method_type: PaymentMethodType;
  provider_name: string;
  account_holder_name: string;
  account_identifier: string;
  account_display: string;
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
  is_primary?: boolean;
}

export interface UpdateSupplierPaymentMethodDTO extends Partial<CreateSupplierPaymentMethodDTO> {
  is_active?: boolean;
}