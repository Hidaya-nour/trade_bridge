import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

import OrderDetailsView from "@/features/order/OrderDetailsView";
import { useOrderStore } from "@/stores/order.store";
import type { Order, OrderStatus, OrderDetailsData } from "@/types/order.types";
import { WithAsync } from "@/components/shared/WithAsync";

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

const mapOrderToDetails = (order: Order): OrderDetailsData => {
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

  const recipientName =
    order.buyer?.business_name || order.buyer?.full_name || "Recipient";

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
      address: order.delivery?.dropoff_location || "Not provided",
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
    party: {
      id: order.supplier_id,
      name: supplierName,
      contact: order.supplier?.full_name,
    },
    canReview: true,
    canReorder: true,
    canCancel: true,
  };
};

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentOrder, fetchOrderById, isLoading, error } = useOrderStore();

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id, fetchOrderById]);

  const orderDetails = useMemo(() => {
    if (!currentOrder) return null;
    return mapOrderToDetails(currentOrder);
  }, [currentOrder]);

  const resolvedError =
    !isLoading && !orderDetails ? error || "Order not found." : null;

  return (
    <WithAsync
      isLoading={isLoading && !orderDetails}
      error={resolvedError}
      loadingComponent={
        <div className="p-6 text-sm text-muted-foreground">
          Loading order...
        </div>
      }
      errorComponent={
        <div className="p-6 text-sm text-muted-foreground">{resolvedError}</div>
      }
    >
      <OrderDetailsView
        key={orderDetails?.id}
        initialOrder={orderDetails as OrderDetailsData}
        mode="outgoing"
        partyLabel="Supplier"
        links={{
          party: (supplierId) => `/retailer/supplier/${supplierId}`,
          product: (productId) => `/retailer/products/${productId}`,
          reorder: (orderId) => `/retailer/reorder?order=${orderId}`,
          message: (supplierId) => `/messages?supplier=${supplierId}`,
        }}
      />
    </WithAsync>
  );
};

export default OrderDetailsPage;
