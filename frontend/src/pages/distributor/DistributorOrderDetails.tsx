import React, { useEffect, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";

import OrderDetailsView from "@/features/order/OrderDetailsView";
import { useOrderStore } from "@/stores/order.store";
import { useDriverStore } from "@/stores/driver.store";
import deliveryService from "@/services/delivery.service";
import paymentService from "@/services/payment.service";
import documentService from "@/services/document.service";
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
  mode: "incoming" | "outgoing",
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
    drivers: mode === "incoming" ? drivers : undefined,
    canAssignDriver: mode === "incoming",
    canCancel: true,
    canReview: mode === "outgoing",
    canReorder: mode === "outgoing",
  } as OrderDetailsData;
};

const DistributorOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const {
    currentOrder,
    fetchOrderById,
    isLoading,
    error,
    updateOrderStatus,
    createOrder,
  } = useOrderStore();
  const { drivers, fetchMyDrivers } = useDriverStore();

  const isPurchaseOrder = location.pathname.includes("/purchase-orders/");
  const mode: "incoming" | "outgoing" = isPurchaseOrder
    ? "outgoing"
    : "incoming";

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id, fetchOrderById]);

  useEffect(() => {
    if (mode === "incoming") {
      fetchMyDrivers();
    }
  }, [mode, fetchMyDrivers]);

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
    return mapOrderToDetails(currentOrder, mode, driverOptions);
  }, [currentOrder, mode, driverOptions]);

  const resolvedError =
    !isLoading && !orderDetails ? error || "Order not found." : null;

  const handleReorderPlaceOrder = async (
    paymentMethod?: string,
    deliveryOption?: string,
  ) => {
    if (!currentOrder) return;
    const items =
      currentOrder.items?.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })) || [];
    if (items.length === 0) return;
    const payload = {
      supplier_id: currentOrder.supplier_id,
      items,
      ...(paymentMethod ? { payment_method: paymentMethod } : {}),
      ...(deliveryOption ? { delivery_option: deliveryOption } : {}),
    };
    const created = await createOrder(payload);
    if (created) {
      toast.success("Reorder placed successfully.");
      return {
        primaryOrderId: created.id,
        total: Number(created.total_price),
      };
    }
    return;
  };

  const handleProcessPayment = async (
    orderId: string,
    paymentMethod: string,
    paymentDetails?: any,
    documents?: File[],
  ): Promise<boolean> => {
    try {
      let proofDocumentId: string | undefined;
      if (documents && documents.length > 0) {
        const uploaded = await documentService.uploadPaymentProof(documents[0]);
        proofDocumentId = uploaded?.data?.id || uploaded?.data?.data?.id;
      }
      const result = await paymentService.submitByOrder(orderId, {
        payment_method: paymentMethod as any,
        proof_document_id: proofDocumentId,
        notes: paymentDetails?.notes,
        payment_details: paymentDetails,
      });
      if (paymentMethod === "app_payment") {
        const checkoutUrl =
          result?.data?.chapa?.checkout_url ||
          result?.data?.payment?.chapa_payment_url;
        if (!checkoutUrl) return false;
        window.location.href = checkoutUrl;
        return true;
      }
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Failed to process payment.");
      return false;
    }
  };

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
        key={`${mode}-${orderDetails?.id}`}
        initialOrder={orderDetails as OrderDetailsData}
        mode={mode}
        partyLabel={mode === "incoming" ? "Customer" : "Supplier"}
        role="distributor"
        ordersPath={
          mode === "outgoing"
            ? "/distributor/purchase-orders"
            : "/distributor/orders"
        }
        onReorderPlaceOrder={
          mode === "outgoing" ? handleReorderPlaceOrder : undefined
        }
        onProcessPayment={mode === "outgoing" ? handleProcessPayment : undefined}
        onUpdateStatus={
          mode === "incoming"
            ? async (status) => {
                const ok = await updateOrderStatus(orderDetails!.id, { status });
                if (ok) {
                  await fetchOrderById(orderDetails!.id);
                }
                return ok;
              }
            : undefined
        }
        onApprovePayment={
          mode === "incoming"
            ? async (paymentId, amountPaid) => {
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
                      "Failed to approve payment.",
                  );
                  return false;
                }
              }
            : undefined
        }
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
        links={
          mode === "incoming"
            ? {
                party: (buyerId) => `/distributor/retailers/${buyerId}`,
              }
            : {
                party: (supplierId) => `/distributor/suppliers/${supplierId}`,
                product: (productId) => `/distributor/products/${productId}`,
                reorder: (orderId) => `/distributor/reorder?order=${orderId}`,
                message: (supplierId) =>
                  `/messages?supplier=${supplierId}${id ? `&order=${id}` : ""}`,
              }
        }
        cancelReasonOptions={
          mode === "incoming"
            ? ["Out of stock", "Customer request", "Payment issue", "Other"]
            : undefined
        }
      />
    </WithAsync>
  );
};

export default DistributorOrderDetailsPage;
