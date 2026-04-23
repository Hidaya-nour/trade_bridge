import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import SearchBar from "@/components/shared/SearchBar";
import DashboardTopBar from "@/components/shared/DashboardTopBar";
import CompactStatCard from "@/components/shared/CompactStatCard";
import SectionHeader from "@/components/shared/SectionHeader";
import { useAuthStore } from "@/features/auth/auth.store";
import { useOrderStore } from "@/features/orders/order.store";
import { useNotificationStore } from "@/features/notifications/notification.store";
import { useCartStore } from "@/features/cart/cart.store";
import { type Order, type OrderStats, type OrderStatus } from "@/features/orders/order.types";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

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

type DashboardFeedTab = "recent" | "frequent";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const getStatusColors = (status: OrderStatus) => {
  switch (status) {
    case "delivered":
      return { bg: "#dcfce7", text: "#166534" };
    case "shipped":
      return { bg: "#dbeafe", text: "#1d4ed8" };
    case "processing":
      return { bg: "#ede9fe", text: "#6d28d9" };
    case "approved":
      return { bg: "#eff6ff", text: "#2563eb" };
    case "cancelled":
      return { bg: "#fee2e2", text: "#b91c1c" };
    default:
      return { bg: "#fef3c7", text: "#b45309" };
  }
};

function EmptyBlock({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.emptyBlock}>
      <Ionicons name={icon} size={24} color="#94a3b8" />
      <Text style={styles.emptyBlockTitle}>{title}</Text>
      <Text style={styles.emptyBlockSubtitle}>{subtitle}</Text>
    </View>
  );
}

function RecentOrderCard({
  order,
  onPress,
  onTrack,
}: {
  order: Order;
  onPress: () => void;
  onTrack: () => void;
}) {
  const supplierName = order.supplier?.business_name || order.supplier?.full_name || "Supplier";
  const itemsCount = order.items?.length ?? 0;
  const statusStyle = getStatusColors(order.order_status);

  return (
    <Pressable style={styles.horizontalCard} onPress={onPress}>
      <View style={styles.horizontalCardTop}>
        <Text style={styles.horizontalCardEyebrow}>#{order.id.slice(0, 8)}</Text>
        <Text style={[styles.statusBadge, { backgroundColor: statusStyle.bg, color: statusStyle.text }]}>
          {order.order_status}
        </Text>
      </View>
      <Text style={styles.horizontalCardTitle} numberOfLines={1}>
        {supplierName}
      </Text>
      <Text style={styles.horizontalCardMeta}>
        {itemsCount} items - {formatCurrency(order.total_price)}
      </Text>
      <Text style={styles.horizontalCardMeta}>{formatDate(order.created_at)}</Text>
      <View style={styles.horizontalCardFooter}>
        <Pressable style={styles.inlineActionButton} onPress={onPress}>
          <Text style={styles.inlineActionText}>View</Text>
        </Pressable>
        <Pressable
          style={[
            styles.inlinePrimaryButton,
            order.order_status !== "shipped" && styles.inlinePrimaryButtonDisabled,
          ]}
          onPress={onTrack}
          disabled={order.order_status !== "shipped"}
        >
          <Text style={styles.inlinePrimaryText}>Track</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function FrequentProductCard({
  product,
  onPress,
}: {
  product: (typeof frequentProducts)[number];
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.horizontalCard} onPress={onPress}>
      <Text style={styles.horizontalCardEyebrow}>Frequent order</Text>
      <Text style={styles.horizontalCardTitle} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.horizontalCardMeta}>{product.supplier}</Text>
      <Text style={styles.horizontalCardMeta}>
        {formatCurrency(product.price)} / {product.unit}
      </Text>
      <View style={styles.ordersPill}>
        <Ionicons name="repeat-outline" size={12} color="#2563eb" />
        <Text style={styles.ordersPillText}>{product.orders} repeat orders</Text>
      </View>
    </Pressable>
  );
}

function SupplierRecommendationCard({
  supplier,
  onPress,
}: {
  supplier: (typeof recommendedSuppliers)[number];
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.supplierCard} onPress={onPress}>
      <View style={styles.supplierHeader}>
        <View style={styles.supplierAvatar}>
          <Text style={styles.supplierAvatarText}>{supplier.avatar}</Text>
        </View>
        <View style={styles.matchChip}>
          <Text style={styles.matchChipText}>{supplier.match}</Text>
        </View>
      </View>
      <Text style={styles.supplierName} numberOfLines={1}>
        {supplier.name}
      </Text>
      <Text style={styles.supplierMeta} numberOfLines={2}>
        {supplier.category} - {supplier.deliveryTime}
      </Text>
      <Text style={styles.supplierMeta}>
        {supplier.rating} stars ({supplier.reviews}) {supplier.verified ? "- Verified" : ""}
      </Text>
    </Pressable>
  );
}

function QuickActionTile({
  icon,
  label,
  caption,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  caption: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickActionTile} onPress={onPress}>
      <View style={styles.quickActionIconWrap}>
        <Ionicons name={icon} size={18} color="#1d4ed8" />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
      <Text style={styles.quickActionCaption}>{caption}</Text>
    </Pressable>
  );
}

export default function RetailerDashboardScreen() {
  const router = useRouter();
  const { setTabBarVisible } = useRoleShell();
  const user = useAuthStore((state) => state.user);
  const { stats, orders, isLoading, error, fetchOrderStats, fetchRecentOrders } = useOrderStore();
  const { counts, fetchCounts } = useNotificationStore();
  const { totalItems, fetchCart } = useCartStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFeedTab, setActiveFeedTab] = useState<DashboardFeedTab>("recent");
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  const loadDashboard = useCallback(async () => {
    await Promise.all([fetchOrderStats(), fetchRecentOrders(), fetchCounts(), fetchCart()]);
  }, [fetchCart, fetchCounts, fetchOrderStats, fetchRecentOrders]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    if (!normalizedSearch) return orders;

    return orders.filter((order) => {
      const supplierName = order.supplier?.business_name || order.supplier?.full_name || "";
      return [order.id, supplierName, order.order_status].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [normalizedSearch, orders]);

  const filteredFrequentProducts = useMemo(() => {
    if (!normalizedSearch) return frequentProducts;

    return frequentProducts.filter((product) =>
      [product.name, product.supplier].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [normalizedSearch]);

  const filteredSuppliers = useMemo(() => {
    if (!normalizedSearch) return recommendedSuppliers;

    return recommendedSuppliers.filter((supplier) =>
      [supplier.name, supplier.category].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [normalizedSearch]);

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
        onPress: () => router.push("/retailer/orders" as never),
      },
      {
        title: "Active Orders",
        value: String((s.processing_count || 0) + (s.shipped_count || 0)),
        subtitle: "Processing + shipped",
        icon: "time-outline" as const,
        onPress: () => router.push("/retailer/orders" as never),
      },
      {
        title: "Total Spent",
        value: formatCompactCurrency(s.total_spent || 0),
        subtitle: `${s.spent_growth || 0}% growth`,
        icon: "card-outline" as const,
        onPress: () => router.push("/retailer/orders" as never),
      },
    ];
  }, [router, stats]);

  const quickActions = useMemo(
    () => [
      {
        icon: "storefront-outline" as const,
        label: "Browse Products",
        caption: "Find new stock",
        onPress: () => router.push("/retailer/products" as never),
      },
      {
        icon: "business-outline" as const,
        label: "Browse Suppliers",
        caption: "Compare partners",
        onPress: () => router.push("/retailer/suppliers" as never),
      },
      {
        icon: "cart-outline" as const,
        label: "View Cart",
        caption: `${totalItems} items ready`,
        onPress: () => router.push("/retailer/cart" as never),
      },
      {
        icon: "git-compare-outline" as const,
        label: "Compare",
        caption: "Evaluate options",
        onPress: () => router.push("/retailer/compare" as never),
      },
    ],
    [router, totalItems],
  );

  if (!user) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="small" color="#1f3a8a" />
      </View>
    );
  }

  const firstName = user.full_name.split(" ")[0] || user.full_name;

  return (
    <ScreenWrapper title="Dashboard" subtitle={user.business_name || "Retailer"}>
      <ScrollView
        contentContainerStyle={styles.container}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerCard}>
          <DashboardTopBar
            greeting={`Hello, ${firstName}`}
            title={user.full_name}
            businessLabel={user.business_name || "Retail business"}
            verified={user.verified}
            notificationCount={counts.unread}
            onNotificationsPress={() => router.push("/retailer/notifications" as never)}
            onCartPress={() => router.push("/retailer/cart" as never)}
          />
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Search orders, suppliers, products..."
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.compactSection}>
          <FlatList
            horizontal
            data={statCards}
            keyExtractor={(item) => item.title}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
            renderItem={({ item }) => (
              <CompactStatCard
                label={item.title}
                value={item.value}
                subtitle={item.subtitle}
                icon={item.icon}
                onPress={item.onPress}
              />
            )}
          />
        </View>

        <View style={styles.panel}>
          <SectionHeader
            title="Orders Snapshot"
            subtitle="Switch between recent activity and repeat buys"
            actionLabel={activeFeedTab === "recent" ? "View all" : "Browse all"}
            onActionPress={() =>
              router.push((activeFeedTab === "recent" ? "/retailer/orders" : "/retailer/products") as never)
            }
          />

          <View style={styles.segmentedControl}>
            {[
              { key: "recent" as const, label: "Recent Orders" },
              { key: "frequent" as const, label: "Frequent Orders" },
            ].map((item) => (
              <Pressable
                key={item.key}
                style={[
                  styles.segmentButton,
                  activeFeedTab === item.key && styles.segmentButtonActive,
                ]}
                onPress={() => setActiveFeedTab(item.key)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeFeedTab === item.key && styles.segmentTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {activeFeedTab === "recent" ? (
            isLoading && orders.length === 0 ? (
              <View style={styles.loadingBlock}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.loadingText}>Loading recent orders</Text>
              </View>
            ) : filteredOrders.length ? (
              <FlatList
                horizontal
                data={filteredOrders.slice(0, 6)}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselList}
                renderItem={({ item }) => (
                  <RecentOrderCard
                    order={item}
                    onPress={() => router.push(`/retailer/orders/${item.id}` as never)}
                    onTrack={() => router.push(`/retailer/tracking/${item.id}` as never)}
                  />
                )}
              />
            ) : (
              <EmptyBlock
                icon="receipt-outline"
                title="No orders found"
                subtitle="Recent order activity will show up here once you place orders."
              />
            )
          ) : filteredFrequentProducts.length ? (
            <FlatList
              horizontal
              data={filteredFrequentProducts}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselList}
              renderItem={({ item }) => (
                <FrequentProductCard
                  product={item}
                  onPress={() => router.push(`/retailer/products/${item.id}` as never)}
                />
              )}
            />
          ) : (
            <EmptyBlock
              icon="repeat-outline"
              title="No frequent products found"
              subtitle="Repeat orders will become easier to access once your history grows."
            />
          )}
        </View>

        <View style={styles.panel}>
          <SectionHeader
            title="Recommended Suppliers"
            subtitle="Quick shortlist inspired by the web dashboard"
            actionLabel="View all"
            onActionPress={() => router.push("/retailer/suppliers" as never)}
          />

          {filteredSuppliers.length ? (
            <FlatList
              horizontal
              data={filteredSuppliers}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselList}
              renderItem={({ item }) => (
                <SupplierRecommendationCard
                  supplier={item}
                  onPress={() => router.push(`/retailer/suppliers/${item.id}` as never)}
                />
              )}
            />
          ) : (
            <EmptyBlock
              icon="business-outline"
              title="No supplier matches"
              subtitle="Try clearing your search to see suggested suppliers again."
            />
          )}
        </View>

        <View style={styles.panel}>
          <SectionHeader title="Quick Actions" subtitle="Common tasks without leaving the dashboard" />
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <QuickActionTile
                key={action.label}
                icon={action.icon}
                label={action.label}
                caption={action.caption}
                onPress={action.onPress}
              />
            ))}
          </View>
        </View>

        <Pressable
          style={styles.summaryToggle}
          onPress={() => setSummaryExpanded((current) => !current)}
        >
          <View>
            <Text style={styles.summaryToggleTitle}>Order Summary</Text>
            <Text style={styles.summaryToggleSubtitle}>Tap to {summaryExpanded ? "collapse" : "expand"}</Text>
          </View>
          <Ionicons
            name={summaryExpanded ? "chevron-up-outline" : "chevron-down-outline"}
            size={20}
            color="#0f172a"
          />
        </Pressable>

        {summaryExpanded ? (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivered</Text>
              <Text style={styles.summaryValue}>{orderSummary.delivered}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipped</Text>
              <Text style={styles.summaryValue}>{orderSummary.shipped}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Processing</Text>
              <Text style={styles.summaryValue}>{orderSummary.processing}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={styles.summaryValue}>{orderSummary.pending}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{orderSummary.total}</Text>
            </View>
          </View>
        ) : null}
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
  headerCard: {
    backgroundColor: "#f8fbff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 14,
  },
  errorBox: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fee2e2",
    borderRadius: 14,
    padding: 12,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
  },
  compactSection: {
    marginHorizontal: -16,
  },
  statsRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 14,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  segmentButtonActive: {
    backgroundColor: "#ffffff",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  segmentTextActive: {
    color: "#0f172a",
  },
  loadingBlock: {
    minHeight: 132,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#64748b",
  },
  carouselList: {
    gap: 12,
  },
  horizontalCard: {
    width: 238,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 8,
  },
  horizontalCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  horizontalCardEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563eb",
    textTransform: "uppercase",
  },
  horizontalCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  horizontalCardMeta: {
    fontSize: 12,
    color: "#64748b",
  },
  horizontalCardFooter: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "capitalize",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  inlineActionButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inlineActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  inlinePrimaryButton: {
    borderRadius: 10,
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inlinePrimaryButtonDisabled: {
    backgroundColor: "#bfdbfe",
  },
  inlinePrimaryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  ordersPill: {
    marginTop: 6,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eff6ff",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ordersPillText: {
    fontSize: 11,
    color: "#2563eb",
    fontWeight: "700",
  },
  supplierCard: {
    width: 194,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 8,
  },
  supplierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  supplierAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  supplierAvatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  matchChip: {
    backgroundColor: "#f3e8ff",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  matchChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6b21a8",
  },
  supplierName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  supplierMeta: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: 12,
  },
  quickActionTile: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 8,
    minHeight: 118,
  },
  quickActionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  quickActionCaption: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
  },
  summaryToggle: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryToggleTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  summaryToggleSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748b",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: "#334155",
    fontSize: 13,
  },
  summaryValue: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "700",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 4,
  },
  summaryTotalLabel: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
  },
  summaryTotalValue: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  emptyBlock: {
    minHeight: 132,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyBlockTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptyBlockSubtitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
  },
});
