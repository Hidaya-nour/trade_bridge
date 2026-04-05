import React, { useEffect, useMemo } from "react";
import { OrderList } from "@/features/order/OrderList";
import { useOrderStore } from "@/stores/order.store";
import { Store } from "lucide-react";
import type { Order } from "@/types/order.types";
import paymentService from "@/services/payment.service";
import documentService from "@/services/document.service";
import ratingReviewService from "@/services/rating-review.service";
import toast from "react-hot-toast";

const OrdersPage: React.FC = () => {
  const {
    orders: storeOrders,
    fetchOrdersAsBuyer,
    cancelOrder,
    createOrder,
    isLoading,
    error,
  } = useOrderStore();

  useEffect(() => {
    fetchOrdersAsBuyer();
  }, [fetchOrdersAsBuyer]);

  const orders = useMemo(() => storeOrders as Order[], [storeOrders]);

  const stats = useMemo(() => {
    const nonCancelled = orders.filter((o) => o.order_status !== "cancelled");
    return {
      totalSpent: nonCancelled.reduce((sum, o) => sum + o.total_price, 0),
      pending: orders.filter((o) => o.order_status === "pending").length,
      processing: orders.filter(
        (o) => o.order_status === "processing" || o.order_status === "approved",
      ).length,
      shipped: orders.filter((o) => o.order_status === "shipped").length,
      delivered: orders.filter((o) => o.order_status === "closed").length,
    };
  }, [orders]);

  const handleRateProduct = async (
    productId: string,
    rating: number,
    review: string,
    orderId: string,
  ) => {
    try {
      await ratingReviewService.createReview({
        product_id: productId,
        rating,
        comment: review,
      });
      toast.success("Review submitted.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit review.");
      console.error("Rate product error:", err);
    }
  };

  const handleReorderPlaceOrder = async (
    order: Order,
    paymentMethod?: string,
    deliveryOption?: string,
  ) => {
    const items =
      order.items?.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })) || [];
    if (items.length === 0) return;
    const payload = {
      supplier_id: order.supplier_id,
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
      const order = orders.find((o) => o.id === orderId);
      if (!order) return false;

      let proofDocumentId: string | undefined;
      if (documents && documents.length > 0) {
        const uploaded = await documentService.uploadPaymentProof(documents[0]);
        proofDocumentId = uploaded?.data?.id || uploaded?.data?.data?.id;
      }

      const amountPaid =
        paymentMethod === "cash" ||
        paymentMethod === "credit" ||
        paymentMethod === "chapa"
          ? undefined
          : order.total_price;

      const result = await paymentService.submitByOrder(orderId, {
        payment_method: paymentMethod as any,
        amount_paid: amountPaid,
        proof_document_id: proofDocumentId,
        notes: paymentDetails?.notes,
        payment_details: paymentDetails,
      });

      if (paymentMethod === "chapa") {
        const checkoutUrl =
          result?.data?.chapa?.checkout_url ||
          result?.data?.payment?.chapa_payment_url;
        if (!checkoutUrl) return false;
        window.location.href = checkoutUrl;
        return true;
      }

      await fetchOrdersAsBuyer();
      return true;
    } catch (error) {
      console.error("Payment submit failed:", error);
      return false;
    }
  };

  return (
    <OrderList
      config={{
        role: "retailer",
        type: "sales",
        title: "My Orders",
        description: "Track and manage all your orders in one place",
        partyLabel: "Supplier",
        partyPath: "/suppliers",
        icon: Store,
        showRating: true,
        showReorder: true,
        showCancel: true,
        stats,
      }}
      orders={orders}
      onCancelOrder={cancelOrder}
      onReorderPlaceOrder={handleReorderPlaceOrder}
      onRateProduct={handleRateProduct}
      onProcessPayment={handleProcessPayment}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default OrdersPage;
