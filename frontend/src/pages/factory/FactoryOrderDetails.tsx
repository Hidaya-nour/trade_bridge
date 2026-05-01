import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

import OrderDetailsView from "@/features/order/OrderDetailsView";
import { useOrderStore } from "@/stores/order.store";
import { useDriverStore } from "@/stores/driver.store";
import deliveryService from "@/services/delivery.service";
import paymentService from "@/services/payment.service";
import { getPaymentMethodLabel } from "@/lib/payment-method-utils";
import toast from "react-hot-toast";
import type { Order, OrderStatus, OrderDetailsData } from "@/types/order.types";
import { WithAsync } from "@/components/shared/WithAsync";

const statusIndex: Record<OrderStatus, number> = {
  pending: 0,
  approved: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  closed: 5,
  cancelled: -1,
};

const buildTimeline = (order: Order) => {
  const steps = [
    "Order Placed",
    "Order Approved",
    "Processing",
    "Shipped",
    "Delivered",
    "Closed",
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
  drivers: {
    id: string;
    name: string;
    vehicle?: string;
    available?: boolean;
  }[],
) => {
  const items =
    order.items?.map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.product?.name || "Item",
      sku: item.product?.sku || item.product_id,
      quantity: item.quantity,
      unit: item.product?.unit_type || "unit",
      price: item.unit_price,
      total: item.unit_price * item.quantity,
      stockAvailable: item.product?.stock_quantity,
      deliveryAvailable: item.product?.delivery_available,
      deliveryPricing: item.product?.delivery_pricing ?? null,
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
    phone: (order.buyer as any)?.phone || undefined,
    email: (order.buyer as any)?.email || undefined,
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
    paymentMethod: getPaymentMethodLabel(order.payment?.payment_method),
    paymentTerms: "N/A",
    paymentId: order.payment?.id,
    paymentAmount: order.payment?.total_amount,
    paymentPaid: order.payment?.amount_paid,
    paymentProofUrl: (order.payment as any)?.proofDocument?.file_secure_url,
    paymentProofName:
      (order.payment as any)?.proofDocument?.original_file_name || undefined,
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
      pickupLocation: (order.delivery as any)?.pickup_location,
      status: (order.delivery as any)?.status,
      address,
      recipient: recipientName,
      phone: ((order.buyer as any)?.phone || undefined) || "N/A",
      requestedDate: undefined,
      estimatedDate: undefined,
      actualDate: order.delivery?.completed_at,
      trackingNumber: undefined,
      carrier: undefined,
      driverUserId: (order.delivery as any)?.driver?.driverUser?.id || null,
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
  const { currentOrder, fetchOrderById, isLoading, error, updateOrderStatus } =
    useOrderStore();
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
          id: d.id,
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
        initialOrder={orderDetails as OrderDetailsData}
        mode="incoming"
        partyLabel="Customer"
        role="factory"
        ordersPath="/factory/orders"
        onUpdateStatus={async (status) => {
          const ok = await updateOrderStatus(orderDetails!.id, { status });
          if (ok) {
            await fetchOrderById(orderDetails!.id);
          }
          return ok;
        }}
        onApprovePayment={async (paymentId, amountPaid) => {
          try {
            await paymentService.updateStatus(
              paymentId,
              "completed",
              amountPaid,
            );
            await fetchOrderById(orderDetails!.id);
            toast.success("Payment approved.");
            return true;
          } catch (err: any) {
            toast.error(
              err?.response?.data?.message ||
                "Failed to approve payment. Please try again.",
            );
            return false;
          }
        }}
        onAssignDriver={async (deliveryId, driverId) => {
          try {
            await deliveryService.assignDriver(deliveryId, driverId);
            await fetchOrderById(orderDetails!.id);
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
        cancelReasonOptions={[
          "Out of stock",
          "Customer request",
          "Payment issue",
          "Other",
        ]}
      />
    </WithAsync>
  );
};

export default FactoryOrderDetailsPage;
