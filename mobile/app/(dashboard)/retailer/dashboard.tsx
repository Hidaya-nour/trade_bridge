import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../src/stores/auth.store";
import { useOrderStore } from "../../../src/stores/order.store";
import ScreenWrapper from "../../../src/components/layout/ScreenWrapper";
import { type Order, type OrderStats, type OrderStatus } from "../../../src/types/order.types";

const recommendedSuppliers = [
  {
    id: 101,
    name: "Ethiopia Coffee Export",
    category: "Beverages",
    rating: 4.9,
    reviews: 128,
    deliveryTime: "2-3 days",
    price: "$$",
    match: "98%",
    avatar: "EC",
    verified: true,
  },
  {
    id: 102,
    name: "Adama Wholesalers",
    category: "Groceries",
    rating: 4.7,
    reviews: 95,
    deliveryTime: "1-2 days",
    price: "$$",
    match: "95%",
    avatar: "AW",
    verified: true,
  },
  {
    id: 103,
    name: "Ethiopian Textile",
    category: "Fabrics",
    rating: 4.5,
    reviews: 67,
    deliveryTime: "3-5 days",
    price: "$$$",
    match: "89%",
    avatar: "ET",
    verified: false,
  },
  {
    id: 104,
    name: "Bahir Dar Honey",
    category: "Food",
    rating: 4.8,
    reviews: 42,
    deliveryTime: "2-4 days",
    price: "$$",
    match: "87%",
    avatar: "BH",
    verified: true,
  },
];

const frequentProducts = [
  {
    id: 1,
    name: "Yirgacheffe Coffee",
    supplier: "Ethiopia Coffee Export",
    supplierId: 101,
    price: 450,
    unit: "kg",
    orders: 24,
  },
  {
    id: 2,
    name: "White Teff Flour",
    supplier: "Adama Wholesalers",
    supplierId: 102,
    price: 120,
    unit: "kg",
    orders: 18,
  },
  {
    id: 3,
    name: "Cotton Fabric",
    supplier: "Ethiopian Textile",
    supplierId: 103,
    price: 320,
    unit: "meter",
    orders: 15,
  },
  {
    id: 4,
    name: "Pure Honey",
    supplier: "Bahir Dar Honey",
    supplierId: 104,
    price: 280,
    unit: "jar",
    orders: 12,
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusStyle = (status: OrderStatus) => {
  switch (status) {
    case "delivered":
      return styles.statusDelivered;
    case "shipped":
      return styles.statusShipped;
    case "processing":
      return styles.statusProcessing;
    case "approved":
      return styles.statusApproved;
    case "cancelled":
      return styles.statusCancelled;
    default:
      return styles.statusPending;
  }
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}) => {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeaderRow}>
        <Text style={styles.statTitle}>{title}</Text>
        <Ionicons name={icon} size={18} color="#1f3a8a" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );
};

const RecentOrderItem = ({
  order,
  onPress,
  onTrack,
}: {
  order: Order;
  onPress: () => void;
  onTrack: () => void;
}) => {
  const supplierName = order.supplier?.business_name || order.supplier?.full_name || "Supplier";
  const itemsCount = order.items?.length ?? 0;

  return (
    <Pressable style={styles.orderCard} onPress={onPress}>
      <View style={styles.rowBetween}>
        <Text style={styles.orderIdText}>#{order.id.slice(0, 8)}</Text>
        <View style={[styles.statusPill, getStatusStyle(order.order_status)]}>
          <Text style={styles.statusText}>{order.order_status}</Text>
        </View>
      </View>
      <Text style={styles.orderMetaText}>{supplierName}</Text>
      <Text style={styles.orderMetaText}>
        {itemsCount} items - {formatCurrency(order.total_price)}
      </Text>
      <Text style={styles.orderDateText}>{formatDate(order.created_at)}</Text>
      <View style={styles.orderActionsRow}>
        <Pressable style={styles.smallGhostButton}>
          <Text style={styles.smallGhostButtonText}>View</Text>
        </Pressable>
        <Pressable
          style={styles.smallPrimaryButton}
          disabled={order.order_status !== "shipped"}
          onPress={onTrack}
        >
          <Text
            style={[
              styles.smallPrimaryButtonText,
              order.order_status !== "shipped" && styles.disabledText,
            ]}
          >
            Track
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default function RetailerDashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { stats, orders, isLoading, error, fetchOrderStats, fetchRecentOrders } = useOrderStore();

  const orderSummary = useMemo(() => {
    const s = (stats || {}) as Partial<OrderStats>;
    return {
      delivered: s.delivered_count || 0,
      shipped: s.shipped_count || 0,
      processing: s.processing_count || 0,
      pending: s.pending_count || 0,
      total: s.total_orders || 0,
    };
  }, [stats]);

  const statCards = useMemo(() => {
    const s = (stats || {}) as Partial<OrderStats>;

    return [
      {
        title: "Total Orders",
        value: String(s.total_orders || 0),
        subtitle: `${s.order_growth || 0}% growth`,
        icon: "cube-outline" as const,
      },
      {
        title: "Active Orders",
        value: String((s.processing_count || 0) + (s.shipped_count || 0)),
        subtitle: "Processing + shipped",
        icon: "time-outline" as const,
      },
      {
        title: "Total Spent",
        value: formatCurrency(s.total_spent || 0),
        subtitle: `${s.spent_growth || 0}% growth`,
        icon: "card-outline" as const,
      },
    ];
  }, [stats]);

  const loadDashboard = useCallback(async () => {
    await Promise.all([fetchOrderStats(), fetchRecentOrders()]);
  }, [fetchOrderStats, fetchRecentOrders]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  if (!user) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="small" color="#1f3a8a" />
      </View>
    );
  }

  return (
    <ScreenWrapper title="Retailer Dashboard" subtitle={user.business_name || "Retailer"}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome back, {user.full_name}</Text>
          <Text style={styles.welcomeSubtitle}>
            {user.business_name || "Retail Business"} - Retailer Dashboard
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.statsGrid}>
          {statCards.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
            />
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <Pressable onPress={() => router.push("/retailer/orders")}> 
            <Text style={styles.sectionAction}>View all</Text>
          </Pressable>
        </View>

        {isLoading && orders.length === 0 ? (
          <ActivityIndicator size="small" color="#1f3a8a" />
        ) : (
          <View style={styles.sectionBlock}>
            {orders.slice(0, 4).map((order) => (
              <RecentOrderItem
                key={order.id}
                order={order}
                onPress={() => router.push(`/retailer/orders/${order.id}`)}
                onTrack={() => router.push(`/retailer/tracking/${order.id}`)}
              />
            ))}
            {!orders.length && <Text style={styles.emptyText}>No recent orders yet.</Text>}
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Frequently Ordered</Text>
          <Pressable onPress={() => router.push("/retailer/products")}> 
            <Text style={styles.sectionAction}>Browse all</Text>
          </Pressable>
        </View>

        <View style={styles.sectionBlock}>
          {frequentProducts.map((product) => (
            <View key={product.id} style={styles.productRow}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productSupplier}>{product.supplier}</Text>
                <Text style={styles.productPriceMeta}>
                  {formatCurrency(product.price)} / {product.unit} - {product.orders} orders
                </Text>
              </View>
              <Pressable
                style={styles.iconButton}
                onPress={() => router.push(`/retailer/cart?add=${product.id}`)}
              >
                <Ionicons name="cart-outline" size={18} color="#1f3a8a" />
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recommended Suppliers</Text>
          <Pressable onPress={() => router.push("/retailer/suppliers")}> 
            <Text style={styles.sectionAction}>View all</Text>
          </Pressable>
        </View>

        <View style={styles.sectionBlock}>
          {recommendedSuppliers.map((supplier) => (
            <View key={supplier.id} style={styles.supplierCard}>
              <View style={styles.supplierAvatar}>
                <Text style={styles.supplierAvatarText}>{supplier.avatar}</Text>
              </View>
              <View style={styles.supplierInfo}>
                <View style={styles.rowBetween}>
                  <Text style={styles.supplierName}>{supplier.name}</Text>
                  <Text style={styles.matchBadge}>{supplier.match}</Text>
                </View>
                <Text style={styles.supplierMeta}>
                  {supplier.category} - {supplier.deliveryTime} - {supplier.price}
                </Text>
                <Text style={styles.supplierMeta}>
                  {supplier.rating} stars ({supplier.reviews})
                </Text>
                <View style={styles.supplierActions}>
                  <Pressable
                    style={styles.smallPrimaryButton}
                    onPress={() => router.push(`/retailer/suppliers/${supplier.id}`)}
                  >
                    <Text style={styles.smallPrimaryButtonText}>View Profile</Text>
                  </Pressable>
                  <Pressable
                    style={styles.smallGhostButton}
                    onPress={() => router.push(`/retailer/compare?supplier=${supplier.id}`)}
                  >
                    <Text style={styles.smallGhostButtonText}>Compare</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActionsGrid}>
          <Pressable style={styles.quickActionButton} onPress={() => router.push("/retailer/products")}>
            <Ionicons name="storefront-outline" size={18} color="#1f3a8a" />
            <Text style={styles.quickActionText}>Browse Products</Text>
          </Pressable>
          <Pressable style={styles.quickActionButton} onPress={() => router.push("/retailer/cart")}>
            <Ionicons name="cart-outline" size={18} color="#1f3a8a" />
            <Text style={styles.quickActionText}>View Cart</Text>
          </Pressable>
          <Pressable style={styles.quickActionButton} onPress={() => router.push("/retailer/compare")}>
            <Ionicons name="git-compare-outline" size={18} color="#1f3a8a" />
            <Text style={styles.quickActionText}>Compare Suppliers</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivered</Text><Text style={styles.summaryValue}>{orderSummary.delivered}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Shipped</Text><Text style={styles.summaryValue}>{orderSummary.shipped}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Processing</Text><Text style={styles.summaryValue}>{orderSummary.processing}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Pending</Text><Text style={styles.summaryValue}>{orderSummary.pending}</Text></View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}><Text style={styles.summaryTotalLabel}>Total</Text><Text style={styles.summaryTotalValue}>{orderSummary.total}</Text></View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centeredScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f5f9",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  welcomeCard: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    padding: 16,
  },
  welcomeTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  welcomeSubtitle: {
    color: "#cbd5e1",
    marginTop: 4,
    fontSize: 13,
  },
  errorBox: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 10,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
  },
  statsGrid: {
    gap: 10,
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statTitle: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 6,
  },
  statSubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  sectionTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  sectionAction: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "600",
  },
  sectionBlock: {
    gap: 8,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderIdText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "700",
  },
  statusPill: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    textTransform: "capitalize",
    fontSize: 10,
    fontWeight: "700",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
  },
  statusApproved: {
    backgroundColor: "#dbeafe",
  },
  statusProcessing: {
    backgroundColor: "#e0e7ff",
  },
  statusShipped: {
    backgroundColor: "#dcfce7",
  },
  statusDelivered: {
    backgroundColor: "#bbf7d0",
  },
  statusCancelled: {
    backgroundColor: "#fee2e2",
  },
  orderMetaText: {
    color: "#475569",
    fontSize: 12,
  },
  orderDateText: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
  orderActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  smallPrimaryButton: {
    borderRadius: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  smallPrimaryButtonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  smallGhostButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  smallGhostButtonText: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "700",
  },
  disabledText: {
    opacity: 0.5,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 12,
  },
  productRow: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    paddingRight: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  productSupplier: {
    marginTop: 2,
    fontSize: 11,
    color: "#475569",
  },
  productPriceMeta: {
    marginTop: 3,
    fontSize: 11,
    color: "#2563eb",
    fontWeight: "600",
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
  },
  supplierCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 10,
  },
  supplierAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  supplierAvatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  supplierInfo: {
    flex: 1,
    gap: 2,
  },
  supplierName: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
    paddingRight: 8,
  },
  matchBadge: {
    fontSize: 10,
    color: "#581c87",
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    fontWeight: "700",
  },
  supplierMeta: {
    color: "#475569",
    fontSize: 11,
  },
  supplierActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  quickActionsGrid: {
    gap: 8,
  },
  quickActionButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quickActionText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: "#334155",
    fontSize: 12,
  },
  summaryValue: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "700",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 4,
  },
  summaryTotalLabel: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "700",
  },
  summaryTotalValue: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
  },
});
