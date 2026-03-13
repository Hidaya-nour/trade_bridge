import React, { useEffect, useMemo } from "react";
import { IncomingOrders } from "@/features/order/IncomingOrders";
import { Store } from "lucide-react";
import toast from "react-hot-toast";

import { useOrderStore } from "@/stores/order.store";
import paymentService from "@/services/payment.service";
import type { Order } from "@/types/order.types";
import type { IncomingOrder } from "@/types/order.types";
import { WithAsync } from "@/components/shared/WithAsync";

const mapPaymentStatus = (status?: string) => {
  switch (status) {
    case "completed":
      return "paid";
    case "processing":
      return "approved";
    case "refunded":
      return "refunded";
    case "failed":
      return "failed";
    case "pending":
    default:
      return "pending";
  }
};

const mapOrderToIncoming = (order: Order): IncomingOrder => {
  const items =
    order.items?.map((item) => ({
      name: item.product?.name || "Item",
      sku: item.product?.sku || item.product_id,
      quantity: item.quantity,
      unit: item.product?.unit_type || "unit",
      price: item.unit_price,
      total: item.unit_price * item.quantity,
    })) || [];

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = order.total_price || subtotal;
  const tax = Math.max(0, total - subtotal);

  const customerName =
    order.buyer?.business_name || order.buyer?.full_name || "Customer";

  return {
    id: order.id,
    deliveryId: order.delivery?.id,
    customerId: Number(order.buyer_id) || 0,
    customerName,
    customerContact: order.buyer?.full_name || customerName,
    customerPhone: "N/A",
    customerLocation:
      order.delivery?.dropoff_location ||
      order.delivery?.pickup_location ||
      "Not provided",
    orderDate: order.created_at,
    requestedDelivery: order.delivery?.completed_at || order.created_at,
    items,
    subtotal,
    shipping: 0,
    tax,
    total,
    status: order.order_status,
    paymentId: order.payment?.id,
    paymentStatus: mapPaymentStatus(order.payment?.payment_status),
    paymentMethod: order.payment?.payment_method || "N/A",
    paymentAmount: Number((order.payment as any)?.total_amount) || undefined,
    paymentPaid: Number((order.payment as any)?.amount_paid) || undefined,
    paymentProofUrl: (order.payment as any)?.proofDocument?.file_secure_url,
    paymentProofName:
      (order.payment as any)?.proofDocument?.original_file_name ||
      "Payment Proof",
    notes: undefined,
    trackingNumber: undefined,
    driver:
      (order.delivery as any)?.driver?.full_name ||
      (order.delivery as any)?.driver?.driverUser?.full_name,
    driverPhone:
      (order.delivery as any)?.driver?.phone ||
      (order.delivery as any)?.driver?.driverUser?.phone,
    driverId:
      (order.delivery as any)?.driver?.id ||
      (order.delivery as any)?.driver?.driver_id,
    deliveredDate: order.delivery?.completed_at,
    cancelledDate: undefined,
    cancellationReason: undefined,
    customerRating: null,
    previousOrders: 0,
  };
};

const DistributorIncomingOrdersPage: React.FC = () => {
  const {
    orders: storeOrders,
    fetchOrdersAsSupplier,
    updateOrderStatus,
    cancelOrder,
    isLoading,
    error,
  } = useOrderStore();

  useEffect(() => {
    fetchOrdersAsSupplier();
  }, [fetchOrdersAsSupplier]);

  const handleConfirmPayment = async (
    orderId: string,
    paymentId: string,
    amountPaid?: number,
  ) => {
    const toastId = toast.loading("Confirming payment...");
    try {
      await paymentService.updateStatus(paymentId, "completed", amountPaid);
      await fetchOrdersAsSupplier();
      toast.success("Payment marked as completed", { id: toastId });
    } catch (error: any) {
      toast.error(error?.message || "Failed to confirm payment", {
        id: toastId,
      });
    }
  };

  const orders = useMemo(
    () => (storeOrders as Order[]).map(mapOrderToIncoming),
    [storeOrders],
  );

  const stats = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
      approved: orders.filter((o) => o.status === "approved").length,
      totalRevenue: orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.total, 0),
    };
  }, [orders]);

  const showLoader = isLoading && orders.length === 0;
  const resolvedError =
    !isLoading && error && orders.length === 0 ? error : null;

  return (
    <WithAsync
      isLoading={showLoader}
      error={resolvedError}
      loadingComponent={
        <div className="p-6 text-sm text-muted-foreground">
          Loading incoming orders...
        </div>
      }
      errorComponent={
        <div className="p-6 text-sm text-muted-foreground">{resolvedError}</div>
      }
    >
      <IncomingOrders
        config={{
          role: "distributor",
          title: "Incoming Orders",
          description: "Review and process orders from your retail customers",
          customerLabel: "Retailer",
          customerPath: "/retailers",
          icon: Store,
          stats,
        }}
        orders={orders}
        onApproveOrder={(id) => updateOrderStatus(id, { status: "approved" })}
        onRejectOrder={(id, reason) => cancelOrder(id, reason)}
        onProcessOrder={(id) => updateOrderStatus(id, { status: "processing" })}
        onAssignDriver={async (_orderId, _deliveryId, _driverId) => {
          await fetchOrdersAsSupplier();
        }}
        onConfirmPayment={handleConfirmPayment}
      />
    </WithAsync>
  );
};

export default DistributorIncomingOrdersPage;
