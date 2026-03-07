import React, { useEffect, useMemo, useState } from "react";
import { OrderList } from "@/components/shared/OrderList";
import { PlaceOrderDialog } from "@/components/shared/PlaceOrderDialog";
import { useOrderStore } from "@/stores/order.store";
import { Factory } from "lucide-react";
import type { Order, OrderItem } from "@/types/order.types";
import toast from "react-hot-toast";

const PurchaseOrdersPage: React.FC = () => {
  const {
    orders: storeOrders,
    fetchOrdersAsBuyer,
    cancelOrder,
    createOrder,
    isLoading,
    error,
  } = useOrderStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [reorderItems, setReorderItems] = useState<OrderItem[]>([]);

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
    console.log("Rate product from factory:", {
      productId,
      rating,
      review,
      orderId,
    });
    // TODO: API call to rate the product
  };

  const handleReorder = (order: Order) => {
    console.log("items");

    const items: OrderItem[] =
      order.items?.map((item) => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        product: item.product,
      })) || [];
    console.log("items");
    console.log(order.items);
    setReorderItems(items);
    setDialogOpen(true);
  };

  const calculateSummary = (items: OrderItem[]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0,
    );
    const shipping = 0; // Replace with your shipping logic
    const discount = 0; // Replace with your discount logic
    const vatPercentage = 0.15;
    const tax = subtotal * vatPercentage;
    const total = subtotal + shipping + tax - discount;

    return {
      subtotal,
      shipping,
      discount,
      tax,
      total,
      vatPercentage,
    };
  };

  const handlePlaceOrder = async (
    paymentMethod: string,
    deliveryOption: string,
  ) => {
    try {
      if (reorderItems.length === 0) {
        toast.error("No items to reorder");
        return;
      }
      const itemsWithPrice = reorderItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product?.price || 0,
      }));

      const totalPrice = itemsWithPrice.reduce(
        (sum, i) => sum + i.unit_price * i.quantity,
        0,
      );

      const supplierId = reorderItems[0].product?.supplier_id;

      // Send all required fields to backend
      await createOrder({
        supplier_id: supplierId,
        items: itemsWithPrice,
        total_price: totalPrice,
        payment_method: paymentMethod,
        delivery_option: deliveryOption,
      });

      toast.success("Order placed successfully!");
      setDialogOpen(false);
    } catch (err) {
      console.error("Reorder failed:", err);
      toast.error("Failed to place order");
    }
  };

  return (
    <>
      <OrderList
        config={{
          role: "distributor",
          type: "purchases",
          title: "Purchase Orders",
          description:
            "Track and manage orders placed with factories and manufacturers",
          partyLabel: "Product",
          partyPath: "/browse-products",
          icon: Factory,
          showRating: true,
          showReorder: true,
          showCancel: true,
          stats,
        }}
        orders={orders}
        onCancelOrder={cancelOrder}
        onReorder={handleReorder}
        onRateProduct={handleRateProduct}
        isLoading={isLoading}
        error={error}
      />

      <PlaceOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        items={reorderItems}
        summary={calculateSummary(reorderItems)}
        config={{
          role: "retailer",
          ordersPath: "/retailer/orders",
        }}
        onPlaceOrder={handlePlaceOrder}
      />
    </>
  );
};

export default PurchaseOrdersPage;
