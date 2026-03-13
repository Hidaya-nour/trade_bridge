import React, { useEffect, useMemo } from "react";
import { OrderList } from "@/features/order/OrderList";
import { useOrderStore } from "@/stores/order.store";
import { Store } from "lucide-react";
import type { Order } from "@/types/order.types";
import paymentService from "@/services/payment.service";
import documentService from "@/services/document.service";

const OrdersPage: React.FC = () => {
  const {
    orders: storeOrders,
    fetchOrdersAsBuyer,
    cancelOrder,
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
      delivered: orders.filter((o) => o.order_status === "delivered").length,
    };
  }, [orders]);

  const handleRateProduct = (
    productId: string,
    rating: number,
    review: string,
    orderId: string,
  ) => {
    console.log("Rate product:", { productId, rating, review, orderId });
    // API call to rate the product
    // You'll need to implement this in your store/service
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
      onReorder={(id) => console.log("Reorder:", id)}
      onRateProduct={handleRateProduct}
      onProcessPayment={handleProcessPayment}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default OrdersPage;
