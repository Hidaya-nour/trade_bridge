import React, { useEffect, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";

import OrderDetailsView, {
  type OrderDetailsData,
} from "@/components/shared/OrderDetailsView";
import { useOrderStore } from "@/stores/order.store";
import type { Order, OrderStatus } from "@/types/order.types";

const statusIndex: Record<OrderStatus, number> = {
  pending: 0,
  approved: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

const buildTimeline = (order: Order) => {
  const steps = [
    "Order Placed",
    "Order Approved",
    "Processing",
    "Shipped",
    "Delivered",
  ];
  const index = statusIndex[order.order_status as OrderStatus] ?? 0;
  const effectiveIndex = index < 0 ? 0 : index;

  return steps.map((status, stepIndex) => ({
    status,
    date: stepIndex === 0 ? order.created_at : null,
    completed: stepIndex <= effectiveIndex,
  }));
};

const mapPaymentStatus = (paymentStatus?: string) => {
  switch (paymentStatus) {
    case "completed":
      return "paid" as const;
    case "processing":
      return "approved" as const;
    case "refunded":
      return "refunded" as const;
    case "failed":
      return "pending" as const;
    case "pending":
    default:
      return "pending" as const;
  }
};

const mapOrderToDetails = (order: Order, mode: "incoming" | "outgoing") => {
  const items =
    order.items?.map((item) => ({
      id: item.id,
      name: item.product?.name || "Item",
      sku: item.product?.sku || item.product_id,
      quantity: item.quantity,
      unit: item.product?.unit_type || "unit",
      price: item.unit_price,
      total: item.unit_price * item.quantity,
      stockAvailable: item.product?.stock_quantity,
    })) || [];

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = order.total_price || subtotal;
  const tax = Math.max(0, total - subtotal);

  const supplierName =
    order.supplier?.business_name || order.supplier?.full_name || "Supplier";
  const buyerName =
    order.buyer?.business_name || order.buyer?.full_name || "Customer";

  const party =
    mode === "incoming"
      ? {
          id: order.buyer_id,
          name: buyerName,
          contact: order.buyer?.full_name,
        }
      : {
          id: order.supplier_id,
          name: supplierName,
          contact: order.supplier?.full_name,
        };

  const recipientName =
    mode === "incoming"
      ? buyerName
      : order.buyer?.business_name || order.buyer?.full_name || "Recipient";

  const address =
    order.delivery?.dropoff_location ||
    order.delivery?.pickup_location ||
    "Not provided";

  return {
    id: order.id,
    orderDate: order.created_at,
    status: order.order_status as OrderStatus,
    paymentStatus: mapPaymentStatus(order.payment?.payment_status),
    paymentMethod: order.payment?.payment_method || "N/A",
    paymentTerms: "N/A",
    subtotal,
    shipping: 0,
    tax,
    total,
    notes: undefined,
    invoice: undefined,
    items,
    timeline: buildTimeline(order),
    delivery: {
      address,
      recipient: recipientName,
      phone: "N/A",
      requestedDate: undefined,
      estimatedDate: undefined,
      actualDate: order.delivery?.completed_at,
      trackingNumber: undefined,
      carrier: undefined,
      driverName: order.delivery?.driver?.full_name,
      driverPhone: order.delivery?.driver?.phone,
    },
    party,
    canAssignDriver: mode === "incoming",
    canCancel: true,
    canReview: mode === "outgoing",
    canReorder: mode === "outgoing",
  } as OrderDetailsData;
};

const DistributorOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { currentOrder, fetchOrderById, isLoading, error } = useOrderStore();

  const isPurchaseOrder = location.pathname.includes("/purchase-orders/");
  const mode: "incoming" | "outgoing" = isPurchaseOrder
    ? "outgoing"
    : "incoming";

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id, fetchOrderById]);

  const orderDetails = useMemo(() => {
    if (!currentOrder) return null;
    return mapOrderToDetails(currentOrder, mode);
  }, [currentOrder, mode]);

  if (isLoading && !orderDetails) {
    return (
      <div className="p-6 text-sm text-muted-foreground">Loading order...</div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {error || "Order not found."}
      </div>
    );
  }

  return (
    <OrderDetailsView
      key={`${mode}-${orderDetails.id}`}
      initialOrder={orderDetails}
      mode={mode}
      partyLabel={mode === "incoming" ? "Customer" : "Supplier"}
      links={
        mode === "incoming"
          ? {
              party: (buyerId) => `/distributor/retailers/${buyerId}`,
            }
          : {
              party: (supplierId) => `/distributor/suppliers/${supplierId}`,
              product: (productId) => `/distributor/products/${productId}`,
              reorder: (orderId) => `/distributor/reorder?order=${orderId}`,
              message: (supplierId) => `/messages?supplier=${supplierId}`,
            }
      }
      cancelReasonOptions={
        mode === "incoming"
          ? ["Out of stock", "Customer request", "Payment issue", "Other"]
          : undefined
      }
    />
  );
};

export default DistributorOrderDetailsPage;
