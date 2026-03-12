import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenWrapper from "../../../src/components/layout/ScreenWrapper";
import { useOrderStore } from "../../../src/stores/order.store";
import { type Order, type OrderStatus } from "../../../src/types/order.types";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const STATUS_FILTERS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function RetailerOrdersScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const { orders, isLoading, error, fetchRecentOrders } = useOrderStore(); // Fetch all via getMyOrders

  useEffect(() => {
    fetchRecentOrders();
  }, [fetchRecentOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecentOrders();
    setRefreshing(false);
  }, [fetchRecentOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const supplierName =
        order.supplier?.business_name || order.supplier?.full_name || "Unknown";
      
      const matchesSearch =
        searchQuery.trim() === "" ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplierName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || order.order_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const renderOrderCard = (order: Order) => {
    const supplierName =
      order.supplier?.business_name || order.supplier?.full_name || "Unknown Supplier";

    let iconName: keyof typeof Ionicons.glyphMap = "time-outline";
    let iconColor = "#ca8a04";
    let iconBg = "#fef08a";

    switch (order.order_status) {
      case "approved":
        iconName = "checkmark-circle-outline";
        iconColor = "#2563eb";
        iconBg = "#dbeafe";
        break;
      case "processing":
        iconName = "cube-outline";
        iconColor = "#4f46e5";
        iconBg = "#e0e7ff";
        break;
      case "shipped":
        iconName = "car-outline";
        iconColor = "#9333ea";
        iconBg = "#f3e8ff";
        break;
      case "delivered":
        iconName = "checkmark-circle-outline";
        iconColor = "#16a34a";
        iconBg = "#dcfce7";
        break;
      case "cancelled":
        iconName = "close-circle-outline";
        iconColor = "#dc2626";
        iconBg = "#fee2e2";
        break;
    }

    return (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
              <Ionicons name={iconName} size={20} color={iconColor} />
            </View>
            <View>
              <Text style={styles.orderIdText}>{order.id}</Text>
              <Text style={styles.dateText}>{formatDate(order.created_at)}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.priceText}>{formatCurrency(order.total_price)}</Text>
            <Text style={[styles.statusBadge, { color: iconColor, backgroundColor: iconBg, borderColor: iconColor }]}>
               {order.order_status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.supplierRow}>
            <Ionicons name="business-outline" size={14} color="#64748b" />
            <Text style={styles.supplierName}>{supplierName}</Text>
          </View>

          {order.items && order.items.length > 0 && (
            <View style={styles.itemsSummary}>
              <Text style={styles.itemsText}>{order.items.length} items</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          {order.order_status === "pending" && (
            <Pressable style={styles.cancelBtn}>
              <Ionicons name="close-circle-outline" size={14} color="#dc2626" />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
          <Pressable 
            style={styles.detailsBtn} 
            onPress={() => router.push(`/retailer/orders/${order.id}`)}
          >
            <Ionicons name="eye-outline" size={14} color="#334155" />
            <Text style={styles.detailsBtnText}>View Details</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper title="My Orders" subtitle="Retailer">
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Order History</Text>
            <Text style={styles.headerSubtitle}>Track and manage your orders</Text>
          </View>
          <View style={styles.badgeWrap}>
            <Ionicons name="cube" size={12} color="#1d4ed8" />
            <Text style={styles.badgeText}>{orders.length} Total</Text>
          </View>
        </View>

        <View style={styles.searchCard}>
          <View style={styles.searchInputWrap}>
            <Ionicons name="search-outline" size={18} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Order ID or Supplier..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {STATUS_FILTERS.map((filter) => (
              <Pressable
                key={filter.value}
                style={[styles.filterChip, statusFilter === filter.value && styles.filterChipActive]}
                onPress={() => setStatusFilter(filter.value)}
              >
                <Text
                  style={[styles.filterChipText, statusFilter === filter.value && styles.filterChipTextActive]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            Showing {filteredOrders.length} orders
          </Text>
        </View>

        {isLoading && orders.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#1e3a8a" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={40} color="#94a3b8" />
            <Text style={styles.emptyStateTitle}>No orders found</Text>
            <Text style={styles.emptyStateSubtitle}>
              You haven't placed any orders yet, or none match your filters.
            </Text>
            {(searchQuery !== "" || statusFilter !== "all") && (
              <Pressable 
                style={styles.clearFiltersButton} 
                onPress={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.ordersList}>
            {filteredOrders.map(renderOrderCard)}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 36,
    gap: 16,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  headerTextWrap: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  badgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1d4ed8",
  },
  searchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
  },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    paddingVertical: 10,
  },
  filtersWrapper: {
    marginHorizontal: -16,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: "#1e3a8a",
    borderColor: "#1e3a8a",
  },
  filterChipText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultsText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  orderIdText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: "#64748b",
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e3a8a",
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardBody: {
    padding: 16,
    gap: 8,
  },
  supplierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  itemsSummary: {
    backgroundColor: "#f8fafc",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 4,
  },
  itemsText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#dc2626",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: "#991b1b",
    fontSize: 13,
  },
  loadingWrap: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
    marginTop: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 4,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 8,
  },
  clearFiltersButton: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
});