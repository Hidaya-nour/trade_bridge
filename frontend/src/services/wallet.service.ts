import api from './api';

export interface WithdrawalLimits {
  min_amount: number;
  max_per_day: number;
  cooldown_hours: number;
}

export interface SellerBalance {
  pending_balance: number;
  available_balance: number;
  platform_fee_percentage: number;
  withdrawal_limits?: WithdrawalLimits;
}

export interface Withdrawal {
  id: string;
  supplier_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed';
  bank_provider?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  admin_notes?: string;
  created_at: string;
  approved_at?: string;
  completed_at?: string;
}

class WalletService {
  async getBalance() {
    const response = await api.get('/wallet/balance');
    return response.data?.data as SellerBalance;
  }

  async requestWithdrawal(amount: number) {
    const response = await api.post('/wallet/withdraw', { amount });
    return response.data?.data?.withdrawal as Withdrawal;
  }

  async listMyWithdrawals() {
    const response = await api.get('/wallet/withdrawals');
    return (response.data?.data?.withdrawals || []) as Withdrawal[];
  }

  async listPendingWithdrawals() {
    const response = await api.get('/wallet/withdrawals/pending');
    return (response.data?.data?.withdrawals || []) as Withdrawal[];
  }

  async approveWithdrawal(id: string, admin_notes?: string) {
    const response = await api.patch(`/wallet/withdrawals/${id}/approve`, {
      admin_notes,
    });
    return response.data?.data?.withdrawal as Withdrawal;
  }

  async settleOrder(orderId: string) {
    const response = await api.post(`/wallet/settle/order/${orderId}`);
    return response.data;
  }

  async rejectWithdrawal(id: string, admin_notes?: string) {
    const response = await api.patch(`/wallet/withdrawals/${id}/reject`, {
      admin_notes,
    });
    return response.data?.data?.withdrawal as Withdrawal;
  }
}

export default new WalletService();
