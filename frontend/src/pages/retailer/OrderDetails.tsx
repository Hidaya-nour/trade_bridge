import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

import OrderDetailsView from "@/features/order/OrderDetailsView";
import { useOrderStore } from "@/stores/order.store";
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

const mapOrderToDetails = (order: Order): OrderDetailsData => {
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

  const recipientName =
    order.buyer?.business_name || order.buyer?.full_name || "Recipient";

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
    canReview: order.order_status == "closed" ? true : false,
    canReorder: true,
    canCancel: order.order_status !== "cancelled" ? true : false,
  };
};

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentOrder, fetchOrderById, isLoading, error, createOrder } =
    useOrderStore();

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
      <OrderDetailsView
        key={orderDetails?.id}
        initialOrder={orderDetails as OrderDetailsData}
        mode="outgoing"
        partyLabel="Supplier"
        role="retailer"
        onReorderPlaceOrder={handleReorderPlaceOrder}
        onProcessPayment={handleProcessPayment}
        ordersPath="/retailer/orders"
        links={{
          party: (supplierId) => `/retailer/supplier/${supplierId}`,
          product: (productId) => `/retailer/products/${productId}`,
          reorder: (orderId) => `/retailer/reorder?order=${orderId}`,
          message: (supplierId) =>
            `/messages?supplier=${supplierId}${id ? `&order=${id}` : ""}`,
        }}
      />
    </WithAsync>
  );
};

export default OrderDetailsPage;
