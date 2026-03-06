import React, { useEffect, useMemo } from "react";
import { OrderList } from "@/components/shared/OrderList";
import { useOrderStore } from "@/stores/order.store";
import { Store } from "lucide-react";
import type { Order } from "@/types/order.types";

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
      isLoading={isLoading}
      error={error}
    />
  );
};

export default OrdersPage;
