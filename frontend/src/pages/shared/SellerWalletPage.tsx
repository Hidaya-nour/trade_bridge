import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Clock, Wallet, ArrowDownToLine, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/formatters';
import walletService, {
  type SellerBalance,
  type Withdrawal,
} from '@/services/wallet.service';

const statusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
    case 'processing':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

const SellerWalletPage: React.FC = () => {
  const [balance, setBalance] = useState<SellerBalance | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [balanceData, withdrawalList] = await Promise.all([
        walletService.getBalance(),
        walletService.listMyWithdrawals(),
      ]);
      setBalance(balanceData);
      setWithdrawals(withdrawalList);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleWithdraw = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      await walletService.requestWithdrawal(value);
      toast.success('Withdrawal request submitted for admin approval');
      setAmount('');
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  const feePercent = balance
    ? Math.round(balance.platform_fee_percentage * 10000) / 100
    : 2;

  const limits = balance?.withdrawal_limits;
  const minWithdraw = limits?.min_amount ?? 10000;
  const hasActiveWithdrawal = withdrawals.some((w) =>
    ['pending', 'processing'].includes(w.status),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Wallet</h1>
          <p className="text-muted-foreground mt-1">
            Buyer payments are held until delivery, then become available to withdraw. Payouts use your primary payment method via Chapa Transfer.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending (awaiting delivery)
            </CardDescription>
            <CardTitle className="text-3xl text-amber-600">
              {formatPrice(balance?.pending_balance || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Released automatically when the driver marks the order as delivered.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Available to withdraw
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {formatPrice(balance?.available_balance || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Platform fee: {feePercent}% per order (deducted before your share).
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5" />
            Request withdrawal
          </CardTitle>
          <CardDescription>
            Minimum {formatPrice(minWithdraw)} per request. Max {limits?.max_per_day ?? 2} per
            day, {limits?.cooldown_hours ?? 4}h between requests. One withdrawal at a time.
            Payouts use your primary payment method via Chapa.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="withdraw-amount">Amount (ETB)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              min={minWithdraw}
              step="0.01"
              placeholder={`e.g. ${minWithdraw}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={hasActiveWithdrawal}
            />
          </div>
          <Button
            onClick={handleWithdraw}
            disabled={submitting || loading || hasActiveWithdrawal}
          >
            {submitting ? 'Submitting…' : 'Withdraw'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal history</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No withdrawals yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{formatDate(w.created_at)}</TableCell>
                    <TableCell>{formatPrice(Number(w.amount))}</TableCell>
                    <TableCell className="text-sm">
                      {w.bank_provider || '—'}
                      {w.bank_account_number
                        ? ` · ${String(w.bank_account_number).slice(-4).padStart(4, '*')}`
                        : ''}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(w.status)}>{w.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerWalletPage;
