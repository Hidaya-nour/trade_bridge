export type ContractType = 'exclusive' | 'non_exclusive' | 'temporary' | 'permanent';
export type CommissionType = 'percentage' | 'fixed_amount' | 'tiered';
export type PaymentTerms = 'monthly' | 'quarterly' | 'annually' | 'upon_sale';

export interface IFactoryAgent {
  id: string;
  factory_id: string;
  agent_id: string;
  contract_number: string;
  contract_type: ContractType;
  commission_rate: number;
  commission_type: CommissionType;
  min_sales_target?: number;
  max_sales_cap?: number;
  territory?: string;
  start_date: Date;
  end_date?: Date | null;
  renewal_date?: Date | null;
  payment_terms: PaymentTerms;
  last_sale_date?: Date | null;
  termination_reason?: string | null;
  created_by: string;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface CreateFactoryAgentDTO {
  factory_id: string;
  agent_id: string;
  contract_number: string;
  contract_type: ContractType;
  commission_rate: number;
  commission_type: CommissionType;
  min_sales_target?: number;
  max_sales_cap?: number;
  territory?: string;
  start_date: Date;
  end_date?: Date;
  renewal_date?: Date;
  payment_terms: PaymentTerms;
}

export interface UpdateFactoryAgentDTO extends Partial<CreateFactoryAgentDTO> {
  last_sale_date?: Date;
  termination_reason?: string;
}