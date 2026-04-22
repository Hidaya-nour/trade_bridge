import React from "react";
import { Download, FileText } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, formatDate } from "@/lib/formatters";
import { useOrderStore } from "@/stores/order.store";
import type { Order, OrderStatus } from "@/types/order.types";

type ExportReportsProps = {
  role: "factory" | "distributor";
};

const toCsv = (rows: Record<string, any>[]) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: any) => {
    const str = value === null || value === undefined ? "" : String(value);
    const needsQuotes = /[\",\n]/.test(str);
    const escaped = str.replaceAll("\"", "\"\"");
    return needsQuotes ? `"${escaped}"` : escaped;
  };
  const lines = [
    headers.map(escape).join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  return lines.join("\n");
};

const downloadTextFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const ExportReportsPage: React.FC<ExportReportsProps> = ({ role }) => {
  const { orders, fetchOrdersAsSupplier, isLoading } = useOrderStore();

  const [fromDate, setFromDate] = React.useState<string>("");
  const [toDate, setToDate] = React.useState<string>("");
  const [status, setStatus] = React.useState<OrderStatus | "all">("all");

  const load = React.useCallback(async () => {
    try {
      await fetchOrdersAsSupplier({
        ...(fromDate ? { from_date: fromDate } : {}),
        ...(toDate ? { to_date: toDate } : {}),
        ...(status !== "all" ? { status } : {}),
        sortBy: "created_at",
        sortOrder: "DESC",
        limit: 500,
      });
    } catch (error) {
      toast.error("Failed to load orders for report.");
    }
  }, [fetchOrdersAsSupplier, fromDate, status, toDate]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const exportOrdersCsv = () => {
    const rows = (orders as Order[]).map((order) => ({
      order_id: order.id,
      order_date: order.created_at ? formatDate(order.created_at) : "",
      buyer_id: order.buyer_id,
      buyer_name:
        order.buyer?.business_name || order.buyer?.full_name || "Buyer",
      status: order.order_status,
      total_price: Number(order.total_price || 0),
    }));

    downloadTextFile(
      `${role}-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(rows),
    );
    toast.success("Orders CSV exported.");
  };

  const exportLineItemsCsv = () => {
    const rows: Record<string, any>[] = [];
    (orders as Order[]).forEach((order) => {
      (order.items || []).forEach((item: any) => {
        const quantity = Number(item.quantity || 0);
        const unit_price = Number(item.unit_price || 0);
        rows.push({
          order_id: order.id,
          order_date: order.created_at ? formatDate(order.created_at) : "",
          buyer_id: order.buyer_id,
          buyer_name:
            order.buyer?.business_name || order.buyer?.full_name || "Buyer",
          status: order.order_status,
          product_id: item.product_id,
          product_name: item.product?.name || "",
          quantity,
          unit_price,
          line_total: Number((quantity * unit_price).toFixed(2)),
        });
      });
    });

    downloadTextFile(
      `${role}-order-items-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(rows),
    );
    toast.success("Line-items CSV exported.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Export Reports</h1>
          <p className="text-muted-foreground mt-1">
            Export sales/orders reports for accounting and analysis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportOrdersCsv} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export Orders (CSV)
          </Button>
          <Button onClick={exportLineItemsCsv} disabled={isLoading}>
            <FileText className="h-4 w-4 mr-2" />
            Export Line Items (CSV)
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">From</div>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">To</div>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Status</div>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3 flex gap-2">
            <Button onClick={() => void load()} disabled={isLoading}>
              Apply
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setStatus("all");
              }}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(orders as Order[]).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-muted-foreground">
                      No orders found for these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  (orders as Order[]).slice(0, 50).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        {order.created_at ? formatDate(order.created_at) : ""}
                      </TableCell>
                      <TableCell>
                        {order.buyer?.business_name || order.buyer?.full_name || "Buyer"}
                      </TableCell>
                      <TableCell>{order.order_status}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(Number(order.total_price || 0))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {(orders as Order[]).length > 50 ? (
            <div className="mt-3 text-xs text-muted-foreground">
              Showing first 50 orders. Export to CSV for the full dataset.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportReportsPage;

