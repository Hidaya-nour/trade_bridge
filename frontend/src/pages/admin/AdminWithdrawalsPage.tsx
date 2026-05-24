import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPrice, formatDate } from '@/lib/formatters';
import walletService, { type Withdrawal } from '@/services/wallet.service';

const AdminWithdrawalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await walletService.listPendingWithdrawals();
      setWithdrawals(list);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id: string) => {
    setActingId(id);
    try {
      await walletService.approveWithdrawal(id);
      toast.success('Withdrawal approved — Chapa transfer initiated');
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Approval failed');
    } finally {
      setActingId(null);
    }
  };

  const reject = async (id: string) => {
    const notes = window.prompt('Rejection reason (optional):') || undefined;
    setActingId(id);
    try {
      await walletService.rejectWithdrawal(id, notes);
      toast.success('Withdrawal rejected');
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Rejection failed');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payout approvals</h1>
          <p className="text-muted-foreground mt-1">
            Approve triggers an automatic Chapa bank transfer when CHAPA_AUTO_PAYOUT=true (default).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending withdrawals</CardTitle>
          <CardDescription>
            Approving deducts the amount from the seller&apos;s available balance. Send the payout via Chapa or bank manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending withdrawal requests.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requested</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payout details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{formatDate(w.created_at)}</TableCell>
                    <TableCell className="font-mono text-xs">{w.supplier_id.slice(0, 8)}…</TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(Number(w.amount))}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{w.bank_provider || '—'}</div>
                      <div className="text-muted-foreground">{w.bank_account_name}</div>
                      <div className="text-muted-foreground">{w.bank_account_number}</div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        onClick={() => approve(w.id)}
                        disabled={actingId === w.id}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reject(w.id)}
                        disabled={actingId === w.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
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

export default AdminWithdrawalsPage;
