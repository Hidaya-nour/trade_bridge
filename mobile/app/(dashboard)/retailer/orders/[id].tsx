import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoLinking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import PaymentSheet, { type PaymentSheetSubmitPayload } from "@/components/retailer/PaymentSheet";
import ReviewSheet from "@/components/retailer/ReviewSheet";
import OrderDialog from "@/components/retailer/OrderDialog";
import addressService, { type RetailerAddress } from "../../../../src/features/address/address.service";
import { useOrderStore } from "@/features/orders/order.store";
import { type Order, type OrderStatus } from "@/features/orders/order.types";
import paymentService from "@/features/payments/payment.service";
import {
  formatCurrency,
  getSupplierName,
} from "@/features/retailer-marketplace/marketplace.utils";
import reviewService from "@/features/reviews/review.service";

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "Pending";

const statusIndex: Record<OrderStatus, number> = {
  pending: 0,
  approved: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  closed: 5,
  cancelled: -1,
};

export default function RetailerOrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState<{ id: string; name: string } | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Reorder dialog state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [requestCredit, setRequestCredit] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<RetailerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  const { currentOrder, isLoading, error, fetchOrderById, createOrder, cancelOrder } = useOrderStore();

  useEffect(() => {
    if (id) {
      void fetchOrderById(id);
    }
  }, [fetchOrderById, id]);

  useEffect(() => {
    if (!checkoutOpen || savedAddresses.length > 0) return;
    let cancelled = false;

    const loadAddresses = async () => {
      setAddressesLoading(true);
      setAddressesError(null);
      try {
        const response = await addressService.getAll();
        const data = response?.data;
        const next = Array.isArray(data) ? data : [];
        if (!cancelled) setSavedAddresses(next);
      } catch (error: any) {
        if (!cancelled) {
          setAddressesError(
            error?.response?.data?.message || error?.message || "Failed to load saved locations",
          );
        }
      } finally {
        if (!cancelled) setAddressesLoading(false);
      }
    };

    void loadAddresses();
    return () => {
      cancelled = true;
    };
  }, [checkoutOpen, savedAddresses.length]);

  useEffect(() => {
    if (!selectedAddressId) return;
    const selected = savedAddresses.find((address) => address.id === selectedAddressId);
    if (!selected) return;
    const formatted = [
      selected.common_name,
      selected.subcity,
      selected.city,
      selected.region,
    ]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(", ");

    if (formatted) {
      setDeliveryAddress(formatted);
    }
  }, [selectedAddressId, savedAddresses]);

  const order = currentOrder;

  const summary = useMemo(() => {
    if (!order) return null;
    const subtotal =
      order.items?.reduce((sum, item) => sum + Number(item.unit_price || 0) * item.quantity, 0) || 0;
    const total = Number(order.total_price || 0);
    const tax = Math.max(total - subtotal, 0);
    return { subtotal, tax, total };
  }, [order]);

  const timeline = useMemo(() => {
    if (!order) return [];
    const steps = ["Order Placed", "Order Approved", "Processing", "Shipped", "Delivered", "Closed"];
    const index = statusIndex[order.order_status] ?? 0;
    const effectiveIndex = index < 0 ? 0 : index;

    return steps.map((step, stepIndex) => ({
      label: step,
      completed: stepIndex <= effectiveIndex,
      date: stepIndex === 0 ? order.created_at : undefined,
    }));
  }, [order]);

  const needsPayment = useMemo(() => {
    if (!order || order.payment?.payment_status === "failed") return false;
    if (!order.payment) return true;
    return ["pending", "failed"].includes(order.payment.payment_status);
  }, [order]);

  const isApproved = order?.order_status == "pending" || order?.order_status != "cancelled";
  const canRate = order?.order_status === "delivered" || order?.order_status === "closed";

  const handlePaymentSubmit = useCallback(
    async ({ method, notes, payment_details, proofFile }: PaymentSheetSubmitPayload) => {
      if (!order) return;

      setPaymentProcessing(true);
      try {
        let proofDocumentId: string | undefined;

        // Upload proof file if provided
        if (proofFile?.uri) {
          try {
            proofDocumentId = await paymentService.uploadProofFile(proofFile.uri);
          } catch (uploadError: any) {
            console.error('Failed to upload proof file:', uploadError);
            Alert.alert('Upload Failed', 'Could not upload payment proof. Please try again.');
            setPaymentProcessing(false);
            return;
          }
        }

        const amount = Number(order.payment?.total_amount || order.total_price || 0);
        const result = await paymentService.submitByOrder(order.id, {
          payment_method: method,
          amount_paid: method === "app_payment" ? undefined : amount,
          notes,
          payment_details,
          proof_document_id: proofDocumentId,
        });

        if (method === "app_payment") {
          const checkoutUrl =
            result?.data?.chapa?.checkout_url || result?.data?.payment?.chapa_payment_url;

          if (checkoutUrl) {
            await ExpoLinking.openURL(checkoutUrl);
          }
        }

        setPaymentOpen(false);
        await fetchOrderById(order.id);
      } catch (paymentError: any) {
        Alert.alert(
          "Payment failed",
          paymentError?.response?.data?.message || paymentError?.message || "Please try again.",
        );
      } finally {
        setPaymentProcessing(false);
      }
    },
    [fetchOrderById, order],
  );

  const handleReorder = useCallback(async () => {
    if (!order) return;
    setDeliveryAddress(order.delivery?.dropoff_location || "");
    setCheckoutNotes("");
    setRequestCredit(false);
    setSelectedAddressId("");
    setSavedAddresses([]);
    setCheckoutOpen(true);
  }, [order]);

  const confirmReorder = useCallback(async () => {
    if (!order) return;
    const items =
      order.items?.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })) || [];

    const payload: any = {
      supplier_id: order.supplier_id,
      items,
      delivery_address: deliveryAddress || undefined,
      notes: checkoutNotes || undefined,
    };
    if (requestCredit) payload.payment_method = "credit";

    const created = await createOrder(payload);
    setCheckoutOpen(false);

    if (created) {
      Alert.alert(
        "Reorder placed",
        "Your reorder was created successfully.",
        [
          {
            text: "OK",
            onPress: () => router.push("/retailer/orders"),
          },
        ],
      );
    } else {
      Alert.alert("Reorder failed", "Unable to create reorder. Please try again.");
    }
  }, [createOrder, deliveryAddress, checkoutNotes, order, requestCredit, router]);

  const handleReviewSubmit = useCallback(
    async ({ rating, review }: { rating: number; review: string }) => {
      if (!reviewingProduct || !order) return;

      setReviewSubmitting(true);
      try {
        await reviewService.createReview({
          product_id: reviewingProduct.id,
          rating,
          comment: review,
        });
        setReviewingProduct(null);
      } catch (reviewError: any) {
        Alert.alert(
          "Review failed",
          reviewError?.response?.data?.message || reviewError?.message || "Please try again.",
        );
      } finally {
        setReviewSubmitting(false);
      }
    },
    [reviewingProduct],
  );

  if (isLoading && !order) {
    return (
      <ScreenWrapper title="Order Details" subtitle="Retailer">
        <View style={styles.centeredWrap}>
          <ActivityIndicator size="small" color="#1d4ed8" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!order || !id) {
    return (
      <ScreenWrapper title="Order Details" subtitle="Retailer">
        <View style={styles.centeredWrap}>
          <Text style={styles.emptyTitle}>Order not found</Text>
          {error ? <Text style={styles.emptySubtitle}>{error}</Text> : null}
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Order Details" subtitle="Retailer">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
              <Text style={styles.metaText}>{formatDate(order.created_at)}</Text>
            </View>
            <Text style={styles.totalText}>{formatCurrency(Number(order.total_price || 0), 2)}</Text>
          </View>
          <Text style={styles.supplierText}>{getSupplierName(order.supplier)}</Text>
          <Text style={styles.metaText}>Status: {order.order_status}</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton} onPress={() => router.push("/retailer/orders")}>
            <Ionicons name="arrow-back-outline" size={16} color="#334155" />
            <Text style={styles.actionButtonText}>Back</Text>
          </Pressable>

          {needsPayment ? (
            <Pressable
              disabled={!isApproved}
              style={[
                styles.primaryActionButton,
                !isApproved && styles.disabledActionButton
              ]}
              onPress={() => setPaymentOpen(true)}
            >
              <Ionicons name="card-outline" size={16} color="#ffffff" />
              <Text style={styles.primaryActionText}>
                {order.payment?.payment_status === "pending" ? "Awaiting Approval" : "Pay Now"}
              </Text>
            </Pressable>
          ) : null}

          <Pressable style={styles.actionButton} onPress={() => void handleReorder()}>
            <Ionicons name="repeat-outline" size={16} color="#334155" />
            <Text style={styles.actionButtonText}>Reorder</Text>
          </Pressable>
          {order.order_status === "shipped" ? (
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push(`/retailer/tracking/${order.id}`)}
            >
              <Ionicons name="navigate-outline" size={16} color="#334155" />
              <Text style={styles.actionButtonText}>Track</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary?.subtotal || 0, 2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax / extra charges</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary?.tax || 0, 2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment</Text>
            <Text style={styles.summaryValue}>{order.payment?.payment_status || "pending"}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(summary?.total || 0, 2)}</Text>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          {timeline.map((item) => (
            <View key={item.label} style={styles.timelineRow}>
              <View style={[styles.timelineDot, item.completed && styles.timelineDotActive]} />
              <View style={styles.timelineCopy}>
                <Text style={styles.timelineTitle}>{item.label}</Text>
                <Text style={styles.metaText}>{formatDate(item.date)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items?.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Pressable
                style={styles.itemImage}
                onPress={() => router.push(`/retailer/products/${item.product_id}`)}
              >
                <Ionicons name="cube-outline" size={24} color="#94a3b8" />
              </Pressable>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle}>{item.product?.name || "Product"}</Text>
                <Text style={styles.metaText}>
                  {item.quantity} x {formatCurrency(Number(item.unit_price || 0), 2)}
                </Text>
                <Text style={styles.metaText}>{item.product?.unit_type || "unit"}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemTotal}>
                  {formatCurrency(Number(item.unit_price || 0) * item.quantity, 2)}
                </Text>
                {canRate ? (
                  <Pressable
                    onPress={() =>
                      setReviewingProduct({
                        id: item.product_id,
                        name: item.product?.name || "Product",
                      })
                    }
                  >
                    <Text style={styles.rateText}>Rate</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.deliveryCard}>
          <Text style={styles.sectionTitle}>Delivery & Payment</Text>
          <Text style={styles.metaText}>
            Delivery: {order.delivery?.dropoff_location || "Awaiting delivery details"}
          </Text>
          <Text style={styles.metaText}>
            Driver:{" "}
            {order.delivery?.driver?.driverUser?.full_name ||
              order.delivery?.driver?.full_name ||
              "Not assigned"}
          </Text>
          <Text style={styles.metaText}>
            Payment method: {order.payment?.payment_method || "Not selected"}
          </Text>
          <Text style={styles.metaText}>
            Payment status: {order.payment?.payment_status || "pending"}
          </Text>
        </View>
      </ScrollView>

      <OrderDialog
        visible={checkoutOpen}
        title="Reorder"
        subtitle="Provide delivery details, saved location and credit request"
        itemCount={order.items?.length}
        totalAmount={summary?.total}
        deliveryAddress={deliveryAddress}
        onDeliveryAddressChange={(value) => {
          setSelectedAddressId("");
          setDeliveryAddress(value);
        }}
        notes={checkoutNotes}
        onNotesChange={setCheckoutNotes}
        requestCredit={requestCredit}
        onRequestCreditChange={setRequestCredit}
        savedAddresses={savedAddresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
        confirmLabel="Place Reorder"
        onClose={() => setCheckoutOpen(false)}
        onConfirm={() => void confirmReorder()}
        isSubmitting={false}
      />

      <PaymentSheet
        visible={paymentOpen}
        amount={Number(order.payment?.total_amount || order.total_price || 0)}
        orderLabel={`order ${order.id.slice(-8)}`}
        onClose={() => setPaymentOpen(false)}
        onSubmit={handlePaymentSubmit}
        submitting={paymentProcessing}
        supplierPaymentMethods={order.supplier?.supplierPaymentMethods}
      />

      <ReviewSheet
        visible={Boolean(reviewingProduct)}
        productName={reviewingProduct?.name || "Product"}
        onClose={() => setReviewingProduct(null)}
        onSubmit={handleReviewSubmit}
        submitting={reviewSubmitting}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  centeredWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  headerCard: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  supplierText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  metaText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748b",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    minHeight: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  primaryActionButton: {
    minHeight: 40,
    borderRadius: 14,
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  disabledActionButton: {
    backgroundColor: "#94a3b8",
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  primaryActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  destructiveText: {
    color: "#dc2626",
  },
  summaryCard: {
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#475569",
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  timelineCard: {
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 12,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#cbd5e1",
  },
  timelineDotActive: {
    backgroundColor: "#1d4ed8",
  },
  timelineCopy: {
    gap: 2,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  itemsCard: {
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  itemCopy: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  itemRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  rateText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  deliveryCard: {
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 8,
  },
});
