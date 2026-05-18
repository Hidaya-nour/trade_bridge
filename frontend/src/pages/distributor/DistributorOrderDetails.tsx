import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { WithAsync } from "@/components/shared/WithAsync";
import { Button } from "@/components/ui/button";
import OrderDetailsView from "@/features/order/OrderDetailsView";
import { formatDate } from "@/lib/formatters";
import { getPaymentMethodLabel } from "@/lib/payment-method-utils";
import deliveryService from "@/services/delivery.service";
import documentService from "@/services/document.service";
import orderService from "@/services/order.service";
import paymentService from "@/services/payment.service";
import { useDriverStore } from "@/stores/driver.store";
import { useOrderStore } from "@/stores/order.store";
import { useSupplierPaymentMethodStore } from "@/stores/supplier-payment-method.store";
import type { Order, OrderDetailsData, OrderStatus } from "@/types/order.types";
import toast from "react-hot-toast";

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

const hasNoSupplierDelivery = (order?: Order | null) =>
  Boolean(
    order?.items?.some((item: any) => {
      const raw = item?.product?.delivery_available;
      if (raw === false || raw === 0) return true;
      if (typeof raw === "string" && raw.trim().toLowerCase() === "false") {
        return true;
      }
      return false;
    }),
  );
const handleCancelOrder = async (orderId: string, reason: string): Promise<boolean> => {
  try {
    await orderService.cancelOrder(orderId, reason);
    toast.success("Order cancelled successfully");
    // Refresh order data to reflect updated status
    await useOrderStore.getState().fetchOrderById(orderId);
    return true;
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "Failed to cancel order.");
    return false;
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
  creditDueDays?: number | null,
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
  const shipping = (order as any).delivery_fee ?? 0;
  const tax = Math.max(0, total - subtotal - shipping);

  const supplierName =
    order.supplier?.business_name || order.supplier?.full_name || "Supplier";
  const buyerName =
    order.buyer?.business_name || order.buyer?.full_name || "Customer";
  const buyerPhone = (order.buyer as any)?.phone || undefined;
  const buyerEmail = (order.buyer as any)?.email || undefined;
  const supplierPhone =
    (order.supplier as any)?.phone || (order.supplier as any)?.user?.phone;
  const supplierEmail =
    (order.supplier as any)?.email || (order.supplier as any)?.user?.email;

  const party =
    mode === "incoming"
      ? {
          id: order.buyer_id,
          name: buyerName,
          contact: order.buyer?.full_name,
          phone: buyerPhone,
          email: buyerEmail,
        }
      : {
          id: order.supplier_id,
          name: supplierName,
          contact: order.supplier?.full_name,
          phone: supplierPhone,
          email: supplierEmail,
        };

  const recipientName =
    mode === "incoming"
      ? buyerName
      : order.buyer?.business_name || order.buyer?.full_name || "Recipient";

  const address =
    order.delivery?.dropoff_location ||
    order.delivery?.pickup_location ||
    "Not provided";

  // Compute credit due date if payment method is credit
  let creditDueDate: string | undefined;
  if (order.payment?.payment_method === "credit") {
    // If backend already provides a due date
    const rawDueDate = (order.payment as any)?.credit_due_date;
    if (rawDueDate) {
      creditDueDate = formatDate(rawDueDate);
    } else if (creditDueDays) {
      // Use the supplier's credit terms: base date = order approval date (or creation date if not yet approved)
      const baseDate = (order as any).approved_at || order.created_at;
      if (baseDate) {
        const due = new Date(baseDate);
        due.setDate(due.getDate() + creditDueDays);
        creditDueDate = formatDate(due.toISOString().split("T")[0]);
      }
    }
  }

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
    shipping,
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
      phone: buyerPhone || "N/A",
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
    drivers: mode === "incoming" ? drivers : undefined,
canAssignDriver: mode === "incoming" && items.some(item => item.deliveryAvailable === true),   
 canCancel: order.order_status !== "cancelled" && order.order_status !== "closed"&& order.payment?.payment_status !== "completed",
    canReview: mode === "outgoing",
    canReorder: mode === "outgoing",
    creditDueDate, // this will be included in the returned object
  } as OrderDetailsData;
};

const DistributorOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentOrder,
    fetchOrderById,
    isLoading,
    error,
    updateOrderStatus,
    createOrder,
  } = useOrderStore();
  const { drivers, fetchMyDrivers } = useDriverStore();
  const [buyerOrderHistory, setBuyerOrderHistory] = useState<Array<any>>([]);
  const { items: paymentMethods, fetchAll: fetchPaymentMethods } =
    useSupplierPaymentMethodStore();
  const [creditDueDays, setCreditDueDays] = useState<number | null>(null);

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

  // Fetch buyer order history for credit orders
  useEffect(() => {
    if (!currentOrder || mode !== "incoming") return;
    if (currentOrder.payment?.payment_method !== "credit") return;

    const fetchHistory = async () => {
      try {
        const response = await orderService.getOrdersAsSupplier({
          supplier_id: currentOrder.supplier_id,
          buyer_id: currentOrder.buyer_id,
          limit: 20,
        });
        const orders = response.data?.orders || response.orders || [];
        const mappedOrders = orders.map((order: any) => ({
          id: order.id,
          orderDate: order.created_at,
          total: order.total_price,
          status: order.order_status,
          paymentStatus: order.payment?.payment_status,
          itemsCount: order.items?.length,
        }));
        setBuyerOrderHistory(mappedOrders);
      } catch (err) {
        console.error("Failed to fetch buyer order history", err);
        setBuyerOrderHistory([]);
      }
    };

    fetchHistory();
  }, [currentOrder, mode]);

  // Fetch supplier payment methods to get credit due days
  useEffect(() => {
    if (currentOrder && currentOrder.supplier_id) {
      fetchPaymentMethods({ supplier_id: currentOrder.supplier_id });
    }
  }, [currentOrder, fetchPaymentMethods]);

  // Extract credit_due_days from the supplier's credit payment method
  useEffect(() => {
    const creditMethod = paymentMethods.find(
      (m) => m.method_type === "credit" && m.is_active,
    );
    if (creditMethod?.credit_due_days) {
      setCreditDueDays(creditMethod.credit_due_days);
    } else {
      setCreditDueDays(null);
    }
  }, [paymentMethods]);

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
    return mapOrderToDetails(currentOrder, mode, driverOptions, creditDueDays);
  }, [currentOrder, mode, driverOptions, creditDueDays]);

  const resolvedError =
    !isLoading && !orderDetails ? error || "Order not found." : null;

  const handleReorderPlaceOrder = async (
    paymentMethod?: string,
    deliveryOption?: string,
    deliveryAddress?: string,
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
      ...(deliveryAddress ? { delivery_address: deliveryAddress } : {}),
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
      {mode === "outgoing" &&
  currentOrder &&
  hasNoSupplierDelivery(currentOrder) &&
  !currentOrder.delivery?.driver_id &&  // Only show if no driver is assigned
  !currentOrder.delivery?.driver ? (   // Alternative check for driver object
  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 p-3">
    <div className="text-sm text-muted-foreground">
      This supplier did not provide delivery for this order. You can
      request an independent driver.
    </div>
    <Button
      onClick={() =>
        navigate(
          `/distributor/purchase-orders/${currentOrder.id}/request-driver`,
        )
      }
    >
      Request Driver
    </Button>
  </div>
) : null}
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
        onProcessPayment={
          mode === "outgoing" ? handleProcessPayment : undefined
        }
          onCancelOrder={handleCancelOrder}

        onApproveOrder={
          mode === "incoming"
            ? async (deliveryFee) => {
                const ok = await useOrderStore
                  .getState()
                  .approveOrder(orderDetails!.id, deliveryFee);
                if (ok) {
                  await fetchOrderById(orderDetails!.id);
                  toast.success("Order approved.");
                }
                return ok;
              }
            : undefined
        }
        onUpdateStatus={
          mode === "incoming"
            ? async (status) => {
                const ok = await updateOrderStatus(orderDetails!.id, {
                  status,
                });
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
        buyerOrderHistory={buyerOrderHistory}
      />
    </WithAsync>
  );
};

export default DistributorOrderDetailsPage;
