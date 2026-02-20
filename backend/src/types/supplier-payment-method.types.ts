export type PaymentMethodType = 'bank_transfer' | 'mobile_money' | 'cash_on_delivery' | 'credit_card' | 'debit_card' | 'paypal' | 'other';

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
  account_display: string;
  is_primary?: boolean;
}

export interface UpdateSupplierPaymentMethodDTO extends Partial<CreateSupplierPaymentMethodDTO> {
  is_active?: boolean;
}