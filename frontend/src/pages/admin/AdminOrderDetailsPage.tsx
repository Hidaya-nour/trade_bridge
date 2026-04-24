import React, { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, Store, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, EmptyState } from "@/components";
import { formatDateTime, formatPrice } from "@/lib/formatters";
import { useOrderStore } from "@/stores/order.store";

const AdminOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrder, fetchOrderById, isLoading, error } = useOrderStore();

  useEffect(() => {
    if (id) {
      void fetchOrderById(id);
    }
  }, [id, fetchOrderById]);

  const order = useMemo(() => {
    if (!currentOrder || !id) return null;
    if (String(currentOrder.id) !== String(id)) return null;
    return currentOrder;
  }, [currentOrder, id]);

  const supplier = order?.supplier;
  const buyer = order?.buyer;
  const items = Array.isArray(order?.items) ? order!.items : [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          Loading order...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-10 text-sm text-red-700">{error}</CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon={Package}
        title="Order not found"
        description="The order may have been removed or you don't have access."
      />
    );
  }

  const supplierName =
    supplier?.business_name || supplier?.full_name || order.supplier_id;
  const buyerName = buyer?.business_name || buyer?.full_name || order.buyer_id;

  const itemsSubtotal = items.reduce(
    (sum, item: any) => sum + Number(item.unit_price || 0) * Number(item.quantity || 0),
    0,
  );

  const delivery = (order as any)?.delivery;
  const payment = (order as any)?.payment;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              Order {order.id}
            </h1>
            <StatusBadge status={order.order_status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Created {formatDateTime(order.created_at)} • Updated{" "}
            {formatDateTime(order.updated_at)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
            <CardDescription>Order line items and totals</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: any) => {
                  const productName = item.product?.name || item.product_id;
                  const qty = Number(item.quantity || 0);
                  const unitPrice = Number(item.unit_price || 0);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{productName}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.product?.unit_type || "unit"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{qty}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(unitPrice * qty)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Separator />

            <div className="p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(itemsSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(Number(order.total_price || 0))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Store className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{supplierName}</p>
                  <p className="text-xs text-muted-foreground">
                    Supplier • {order.supplier_id}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/admin/products?supplier_id=${order.supplier_id}`}>
                        <Package className="mr-2 h-4 w-4" />
                        Products
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/admin/users?search=${order.supplier_id}`}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{buyerName}</p>
                  <p className="text-xs text-muted-foreground">
                    Buyer • {order.buyer_id}
                  </p>
                  <div className="mt-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/admin/users?search=${order.buyer_id}`}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="capitalize">
                  {payment?.payment_status || "N/A"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="capitalize">
                  {payment?.payment_method || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span>{formatPrice(Number(payment?.amount_paid || 0))}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="capitalize">
                  {delivery?.status || "N/A"}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Pickup
                </p>
                <p className="font-medium">
                  {delivery?.pickup_location || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Drop-off
                </p>
                <p className="font-medium">
                  {delivery?.dropoff_location || "Not provided"}
                </p>
              </div>
              {delivery?.started_at ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Started</span>
                  <span>{formatDateTime(delivery.started_at)}</span>
                </div>
              ) : null}
              {delivery?.completed_at ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span>{formatDateTime(delivery.completed_at)}</span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailsPage;

