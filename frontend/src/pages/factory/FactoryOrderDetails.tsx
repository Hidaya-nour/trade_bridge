import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

import OrderDetailsView, {
  type OrderDetailsData,
} from "@/components/shared/OrderDetailsView";
import { useOrderStore } from "@/stores/order.store";
import { useDriverStore } from "@/stores/driver.store";
import deliveryService from "@/services/delivery.service";
import toast from "react-hot-toast";
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

const mapOrderToDetails = (
  order: Order,
  drivers: { id: string; name: string; vehicle?: string; available?: boolean }[],
) => {
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

  const buyerName =
    order.buyer?.business_name || order.buyer?.full_name || "Customer";

  const party = {
    id: order.buyer_id,
    name: buyerName,
    contact: order.buyer?.full_name,
  };

  const recipientName = buyerName;

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
      deliveryId: order.delivery?.id,
      address,
      recipient: recipientName,
      phone: "N/A",
      requestedDate: undefined,
      estimatedDate: undefined,
      actualDate: order.delivery?.completed_at,
      trackingNumber: undefined,
      carrier: undefined,
      driverName:
        (order.delivery as any)?.driver?.full_name ||
        (order.delivery as any)?.driver?.driverUser?.full_name,
      driverPhone:
        (order.delivery as any)?.driver?.phone ||
        (order.delivery as any)?.driver?.driverUser?.phone,
    },
    party,
    drivers,
    canAssignDriver: true,
    canCancel: true,
  } as OrderDetailsData;
};

const FactoryOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentOrder, fetchOrderById, isLoading, error } = useOrderStore();
  const { drivers, fetchMyDrivers } = useDriverStore();

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id, fetchOrderById]);

  useEffect(() => {
    fetchMyDrivers();
  }, [fetchMyDrivers]);

  const driverOptions = useMemo(
    () =>
      drivers
        .filter((d) => d.active)
        .map((d) => ({
          id: d.driver_id,
          name: d.driver?.full_name ?? "Driver",
          vehicle: d.vehicle_type || undefined,
          phone: d.driver?.phone,
          available: true,
        })),
    [drivers],
  );

  const orderDetails = useMemo(() => {
    if (!currentOrder) return null;
    return mapOrderToDetails(currentOrder, driverOptions);
  }, [currentOrder, driverOptions]);

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
      initialOrder={orderDetails}
      mode="incoming"
      partyLabel="Customer"
      onAssignDriver={async (deliveryId, driverId) => {
        try {
          await deliveryService.assignDriver(deliveryId, driverId);
          await fetchOrderById(orderDetails.id);
        } catch (err: any) {
          toast.error(
            err?.response?.data?.message ||
              "Failed to assign driver. Please try again.",
          );
          throw err;
        }
      }}
      links={{
        party: (buyerId) => `/factory/distributors/${buyerId}`,
      }}
      cancelReasonOptions={["Out of stock", "Customer request", "Payment issue", "Other"]}
    />
  );
};

export default FactoryOrderDetailsPage;
