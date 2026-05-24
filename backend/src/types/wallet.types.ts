export type SettlementStatus = 'none' | 'pending' | 'released' | 'reversed';

export type WithdrawalStatus =
  | 'pending'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'completed';

export interface WithdrawalLimits {
  min_amount: number;
  max_per_day: number;
  cooldown_hours: number;
}

export interface IWithdrawal {
  id: string;
  supplier_id: string;
  amount: number;
  status: WithdrawalStatus;
  bank_provider?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_code?: string;
  chapa_transfer_ref?: string;
  admin_notes?: string;
  approved_by?: string;
  approved_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SellerBalance {
  pending_balance: number;
  available_balance: number;
  platform_fee_percentage: number;
  withdrawal_limits?: WithdrawalLimits;
}
