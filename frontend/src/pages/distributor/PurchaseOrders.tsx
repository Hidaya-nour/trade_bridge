import React, { useEffect, useMemo, useState } from "react";
import { OrderList } from "@/features/order/OrderList";
import { PlaceOrderDialog } from "@/components/order/PlaceOrderDialog";
import { useOrderStore } from "@/stores/order.store";
import { Factory } from "lucide-react";
import type { Order, OrderItem } from "@/types/order.types";
import toast from "react-hot-toast";
import paymentService from "@/services/payment.service";
import documentService from "@/services/document.service";
import ratingReviewService from "@/services/rating-review.service";

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
    const supplier = items[0]?.product?.supplier as
      | { is_vat_registered?: boolean; vat_rate?: number }
      | undefined;
    const vatPercentage =
      supplier?.is_vat_registered === true
        ? Number.isFinite(Number(supplier?.vat_rate))
          ? Number(supplier?.vat_rate)
          : 0.15
        : 0;
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
    paymentMethod?: string,
    deliveryOption?: string,
  ) => {
    const selectedDeliveryOption = deliveryOption || "standard";
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
      const orderPayload = {
        supplier_id: supplierId,
        items: itemsWithPrice,
        total_price: totalPrice,
        delivery_option: selectedDeliveryOption,
        ...(paymentMethod ? { payment_method: paymentMethod } : {}),
      };

      const order = await createOrder(orderPayload);

      if (!order) {
        toast.error("Failed to place order");
        return;
      }
      toast.success("Order placed successfully!");
      return {
        primaryOrderId: order.id,
        total: totalPrice,
      };
    } catch (err) {
      console.error("Reorder failed:", err);
      toast.error("Failed to place order");
      return;
    }
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
        onProcessPayment={handleProcessPayment}
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
        onProcessPayment={handleProcessPayment as any}
      />
    </>
  );
};

export default PurchaseOrdersPage;
