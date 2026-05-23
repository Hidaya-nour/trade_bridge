import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoLinking from "expo-linking";
import { useRouter } from "expo-router";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import OrderDialog from "@/components/retailer/OrderDialog";
import BottomSheetModal from "@/components/retailer/BottomSheetModal";
import PaymentSheet, { type PaymentSheetSubmitPayload } from "@/components/retailer/PaymentSheet";
import SearchBar from "@/components/shared/SearchBar";
import addressService, { type RetailerAddress } from "../../../../src/features/address/address.service";
import { useOrderStore } from "@/features/orders/order.store";
import { type Order, type OrderStatus } from "@/features/orders/order.types";
import paymentService from "@/features/payments/payment.service";
import { formatCurrency } from "@/features/retailer-marketplace/marketplace.utils";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const STATUS_OPTIONS: Array<{ label: string; value: OrderStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Closed", value: "closed" },
  // { label: "Cancelled", value: "cancelled" },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.filterChip, active && styles.filterChipActive]} onPress={onPress}>
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function RetailerOrdersScreen() {
  const router = useRouter();
  const { setTabBarVisible } = useRoleShell();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [reorderOrder, setReorderOrder] = useState<Order | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [reorderNotes, setReorderNotes] = useState("");
  const [requestCredit, setRequestCredit] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<RetailerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  const {
    orders,
    isLoading,
    error,
    fetchOrdersAsBuyer,
    createOrder,
    cancelOrder,
  } = useOrderStore();

  useEffect(() => {
    void fetchOrdersAsBuyer({
      sortBy: "created_at",
      sortOrder: "DESC",
      limit: 50,
    });
  }, [fetchOrdersAsBuyer]);

  useEffect(() => {
    if (!reorderOpen || savedAddresses.length > 0) return;
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
  }, [reorderOpen, savedAddresses.length]);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrdersAsBuyer({
      sortBy: "created_at",
      sortOrder: "DESC",
      limit: 50,
    });
    setRefreshing(false);
  }, [fetchOrdersAsBuyer]);

  const supplierOptions = useMemo(() => {
    return Array.from(
      new Set(
        orders
          .map((order) => order.supplier?.business_name || order.supplier?.full_name || "Unknown Supplier")
          .filter(Boolean),
      ),
    ).sort();
  }, [orders]);

  const stats = useMemo(() => {
    const nonCancelled = orders.filter((order) => order.order_status !== "cancelled");
    return {
      totalSpent: nonCancelled.reduce((sum, order) => sum + Number(order.total_price || 0), 0),
      pending: orders.filter((order) => order.order_status === "pending").length,
      processing: orders.filter((order) =>
        order.order_status === "approved" || order.order_status === "processing",
      ).length,
      shipped: orders.filter((order) => order.order_status === "shipped").length,
      delivered: orders.filter((order) =>
        order.order_status === "delivered" || order.order_status === "closed",
      ).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return [...orders]
      .filter((order) => {
        const supplierName =
          order.supplier?.business_name || order.supplier?.full_name || "Unknown Supplier";
        const matchesSearch =
          normalizedSearch === "" ||
          order.id.toLowerCase().includes(normalizedSearch) ||
          supplierName.toLowerCase().includes(normalizedSearch);
        const matchesStatus = statusFilter === "all" || order.order_status === statusFilter;
        const matchesSupplier = supplierFilter === "all" || supplierName === supplierFilter;

        return matchesSearch && matchesStatus && matchesSupplier;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, searchQuery, statusFilter, supplierFilter]);

  const needsPayment = useCallback((order: Order) => {

    if (!order.payment) {
      return true;
    }

    return ["pending", "failed"].includes(order.payment.payment_status);
  }, []);

  const handleReorder = useCallback(
    (order: Order) => {
      setReorderOrder(order);
      setDeliveryAddress(order.delivery?.dropoff_location || "");
      setReorderNotes("");
      setRequestCredit(false);
      setSelectedAddressId("");
      setSavedAddresses([]);
      setReorderOpen(true);
    },
    [],
  );

  const confirmReorder = useCallback(async () => {
    if (!reorderOrder) return;

    const items =
      reorderOrder.items?.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })) || [];

    const payload: any = {
      supplier_id: reorderOrder.supplier_id,
      items,
      delivery_address: deliveryAddress || undefined,
      notes: reorderNotes || undefined,
    };
    if (requestCredit) payload.payment_method = "credit";

    const created = await createOrder(payload);
    setReorderOpen(false);

    if (created) {
      Alert.alert("Reorder placed", "Your reorder was created successfully.", [
        {
          text: "Done",
          onPress: () => void onRefresh(),
        },
      ]);
    } else {
      Alert.alert("Reorder failed", "Unable to create reorder. Please try again.");
    }
  }, [createOrder, deliveryAddress, onRefresh, reorderNotes, reorderOrder, requestCredit]);
const normalizeProofFile = (file: any) => {
  const uri = file.uri;

  const name =
    file.name ||
    uri.split("/").pop() ||
    `payment-proof-${Date.now()}.jpg`;

  let type = file.mimeType;

  if (!type) {
    if (name.endsWith(".pdf")) type = "application/pdf";
    else if (name.endsWith(".png")) type = "image/png";
    else type = "image/jpeg";
  }

  // IMPORTANT FIX
  if (type === "image/jpg") {
    type = "image/jpeg";
  }

  return { uri, name, type };
};
const handlePaymentSubmit = useCallback(
  async ({ method, notes, payment_details, proofFile }: PaymentSheetSubmitPayload) => {
    if (!selectedOrder) return;

    setPaymentProcessing(true);

    try {
      let proofDocumentId: string | undefined;

      // =========================
      // Upload payment proof
    if (proofFile?.uri) {
  const normalized = normalizeProofFile(proofFile);

  const formData = new FormData();

  formData.append("document_type", "payment_proof"); // MUST MATCH WEB

  formData.append("file", {
    uri: normalized.uri,
    name: normalized.name,
    type: normalized.type,
  } as any);

  const uploadResponse = await paymentService.uploadProofDocument(formData);

  proofDocumentId =
    uploadResponse?.data?.data?.id ||
    uploadResponse?.data?.id;
}

      // =========================
      // Submit payment
      // =========================
      const amount = Number(
        selectedOrder.payment?.total_amount ||
          selectedOrder.total_price ||
          0,
      );

      const result = await paymentService.submitByOrder(selectedOrder.id, {
        payment_method: method,
        amount_paid: method === "app_payment" ? undefined : amount,
        notes,
        payment_details,
        proof_document_id: proofDocumentId,
      });

      // =========================
      // Chapa payment
      // =========================
      if (method === "app_payment") {
        const checkoutUrl =
          result?.data?.chapa?.checkout_url ||
          result?.data?.payment?.chapa_payment_url;

        if (checkoutUrl) {
          await ExpoLinking.openURL(checkoutUrl);
        }
      }

      setPaymentOpen(false);

      await onRefresh();

      Alert.alert("Success", "Payment submitted successfully.");
    } catch (paymentError: any) {
      console.error("Payment failed:", paymentError);

      Alert.alert(
        "Payment failed",
        paymentError?.response?.data?.message ||
          paymentError?.message ||
          "Please try again.",
      );
    } finally {
      setPaymentProcessing(false);
    }
  },
  [onRefresh, selectedOrder],
);
  const statusMeta = (status: OrderStatus) => {
    switch (status) {
      case "approved":
        return { color: "#2563eb", bg: "#dbeafe", icon: "checkmark-circle-outline" as const };
      case "processing":
        return { color: "#4f46e5", bg: "#e0e7ff", icon: "cube-outline" as const };
      case "shipped":
        return { color: "#7c3aed", bg: "#f3e8ff", icon: "car-outline" as const };
      case "delivered":
      case "closed":
        return { color: "#16a34a", bg: "#dcfce7", icon: "checkmark-done-outline" as const };
      case "cancelled":
        return { color: "#dc2626", bg: "#fee2e2", icon: "close-circle-outline" as const };
      default:
        return { color: "#ca8a04", bg: "#fef3c7", icon: "time-outline" as const };
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.heroCard}>
        <View style={styles.heroTitleRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>My Orders</Text>
            <Text style={styles.heroSubtitle}>
              Track payments, delivery progress, cancellations, and quick reorders in one mobile flow.
            </Text>
          </View>
          <View style={styles.heroBadge}>
            <Ionicons name="receipt-outline" size={14} color="#1d4ed8" />
            <Text style={styles.heroBadgeText}>{orders.length}</Text>
          </View>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="Search by order ID or supplier"
        />

        <View style={styles.heroActions}>
          <Pressable style={styles.filterButton} onPress={() => setFilterOpen(true)}>
            <Ionicons name="options-outline" size={16} color="#0f172a" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.push("/retailer/products")}>
            <Ionicons name="bag-outline" size={16} color="#1d4ed8" />
            <Text style={styles.secondaryButtonText}>Buy More</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Pending", value: stats.pending },
          { label: "Processing", value: stats.processing },
          { label: "Shipped", value: stats.shipped },
          { label: "Spent", value: formatCurrency(stats.totalSpent, 0) },
        ].map((card) => (
          <View key={card.label} style={styles.statCard}>
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.chipRow}>
        {STATUS_OPTIONS.slice(0, 5).map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            active={statusFilter === option.value}
            onPress={() => setStatusFilter(option.value)}
          />
        ))}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <ScreenWrapper title="My Orders" subtitle="Retailer">
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const meta = statusMeta(item.order_status);
          const supplierName =
            item.supplier?.business_name || item.supplier?.full_name || "Unknown Supplier";
          const paymentStatus = item.payment?.payment_status || "pending";

          return (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <View style={[styles.statusIconWrap, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={18} color={meta.color} />
                  </View>
                  <View style={styles.orderHeaderCopy}>
                    <Text style={styles.orderIdText}>#{item.id.slice(0, 8)}</Text>
                    <Text style={styles.orderMetaText}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>
                <View style={styles.orderHeaderRight}>
                  <Text style={styles.orderTotalText}>{formatCurrency(Number(item.total_price || 0), 2)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: meta.color }]}>{item.order_status}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.orderBody}>
                <Text style={styles.supplierName}>{supplierName}</Text>
                <Text style={styles.orderMetaText}>
                  {item.items?.length || 0} items • Payment {paymentStatus}
                </Text>
              </View>

              <View style={styles.orderActions}>
                <Pressable
                  style={styles.outlineAction}
                  onPress={() => router.push(`/retailer/orders/${item.id}`)}
                >
                  <Ionicons name="eye-outline" size={15} color="#334155" />
                  <Text style={styles.outlineActionText}>Details</Text>
                </Pressable>

                {item.order_status === "shipped" ? (
                  <Pressable
                    style={styles.outlineAction}
                    onPress={() => router.push(`/retailer/tracking/${item.id}`)}
                  >
                    <Ionicons name="navigate-outline" size={15} color="#334155" />
                    <Text style={styles.outlineActionText}>Track</Text>
                  </Pressable>
                ) : null}

                {needsPayment(item) ? (
                  <Pressable
                    style={[
                      styles.primaryOutlineAction,
                      item.order_status !== "approved" && styles.disabledAction,
                    ]}
                    disabled={item.order_status !== "approved"}
                    onPress={() => {
                      setSelectedOrder(item);
                      setPaymentOpen(true);
                    }}
                  >
                    <Ionicons name="card-outline" size={15} color="#ffffff" />
                    <Text style={styles.primaryOutlineActionText}>
                      {item.order_status === "pending" ? "Awaiting Approval" : "Pay"}
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable style={styles.outlineAction} onPress={() => void handleReorder(item)}>
                  <Ionicons name="repeat-outline" size={15} color="#334155" />
                  <Text style={styles.outlineActionText}>Reorder</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator size="small" color="#1d4ed8" />
              <Text style={styles.emptyTitle}>Loading orders...</Text>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="receipt-outline" size={32} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptySubtitle}>
                Try changing the filters or place a new order from the product catalog.
              </Text>
            </View>
          )
        }
      />

      <BottomSheetModal
        visible={filterOpen}
        title="Filter orders"
        subtitle="Refine by status or supplier."
        onClose={() => setFilterOpen(false)}
      >
        <View style={styles.sheetSection}>
          <Text style={styles.sheetTitle}>Status</Text>
          <View style={styles.sheetChipWrap}>
            {STATUS_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                active={statusFilter === option.value}
                onPress={() => setStatusFilter(option.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.sheetSection}>
          <Text style={styles.sheetTitle}>Supplier</Text>
          <View style={styles.sheetChipWrap}>
            <FilterChip
              label="All Suppliers"
              active={supplierFilter === "all"}
              onPress={() => setSupplierFilter("all")}
            />
            {supplierOptions.map((supplier) => (
              <FilterChip
                key={supplier}
                label={supplier}
                active={supplierFilter === supplier}
                onPress={() => setSupplierFilter(supplier)}
              />
            ))}
          </View>
        </View>

        <View style={styles.sheetFooter}>
          <Pressable
            style={styles.sheetCancelButton}
            onPress={() => {
              setStatusFilter("all");
              setSupplierFilter("all");
            }}
          >
            <Text style={styles.sheetCancelText}>Reset</Text>
          </Pressable>
          <Pressable style={styles.sheetSubmitButton} onPress={() => setFilterOpen(false)}>
            <Text style={styles.sheetSubmitText}>Apply</Text>
          </Pressable>
        </View>
      </BottomSheetModal>

      <OrderDialog
        visible={reorderOpen}
        title="Reorder"
        subtitle="Use saved addresses, add notes, or request credit."
        itemCount={reorderOrder?.items?.length}
        totalAmount={Number(reorderOrder?.total_price || 0)}
        deliveryAddress={deliveryAddress}
        onDeliveryAddressChange={(value) => {
          setSelectedAddressId("");
          setDeliveryAddress(value);
        }}
        notes={reorderNotes}
        onNotesChange={setReorderNotes}
        requestCredit={requestCredit}
        onRequestCreditChange={setRequestCredit}
        savedAddresses={savedAddresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
        confirmLabel="Place Reorder"
        onClose={() => setReorderOpen(false)}
        onConfirm={() => void confirmReorder()}
        isSubmitting={false}
      />

      <PaymentSheet
        visible={paymentOpen}
        amount={Number(selectedOrder?.payment?.total_amount || selectedOrder?.total_price || 0)}
        orderLabel={selectedOrder ? `order ${selectedOrder.id.slice(-8)}` : "your order"}
        onClose={() => setPaymentOpen(false)}
        onSubmit={handlePaymentSubmit}
        submitting={paymentProcessing}
        supplierPaymentMethods={selectedOrder?.supplier?.supplierPaymentMethods}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  headerContent: {
    gap: 16,
    paddingBottom: 18,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 14,
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748b",
  },
  heroBadge: {
    minWidth: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
  },
  filterButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#1d4ed8",
  },
  errorBox: {
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#b91c1c",
  },
  orderCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 14,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  statusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  orderHeaderCopy: {
    gap: 2,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  orderMetaText: {
    fontSize: 12,
    color: "#64748b",
  },
  orderHeaderRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  orderTotalText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  orderBody: {
    gap: 4,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  orderActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  outlineAction: {
    minHeight: 38,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
  },
  outlineActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  primaryOutlineAction: {
    minHeight: 38,
    borderRadius: 14,
    backgroundColor: "#1d4ed8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
  },
  primaryOutlineActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  disabledAction: {
    opacity: 0.55,
  },
  destructiveText: {
    color: "#dc2626",
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 320,
  },
  sheetSection: {
    gap: 10,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  sheetChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sheetFooter: {
    flexDirection: "row",
    gap: 12,
  },
  sheetCancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  sheetSubmitButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetSubmitText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
