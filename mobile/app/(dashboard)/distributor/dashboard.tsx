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
import CompactStatCard from "@/components/shared/CompactStatCard";
import DashboardTopBar from "@/components/shared/DashboardTopBar";
import SearchBar from "@/components/shared/SearchBar";
import SectionHeader from "@/components/shared/SectionHeader";
import { useAuthStore } from "@/features/auth/auth.store";
import broadcastService from "@/features/broadcasts/broadcast.service";
import { type BroadcastRecord } from "@/features/broadcasts/broadcast.types";
import { useNotificationStore } from "@/features/notifications/notification.store";
import { useOrderStore } from "@/features/orders/order.store";
import { type Order } from "@/features/orders/order.types";
import { useProductStore } from "@/features/products/product.store";
import shipmentService, { type ShipmentRecord } from "@/features/shipments/shipment.service";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const LOW_STOCK_THRESHOLD = 30;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

type DashboardIncomingOrder = {
  id: string;
  retailer: string;
  retailerId?: string;
  items: number;
  total: number;
  status: "pending" | "processing" | "approved" | "shipped" | "delivered";
  date: string;
  priority: "high" | "medium" | "low";
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
      <Ionicons name={icon} size={22} color="#94a3b8" />
      <Text style={styles.emptyBlockTitle}>{title}</Text>
      <Text style={styles.emptyBlockSubtitle}>{subtitle}</Text>
    </View>
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

export default function DistributorDashboardScreen() {
  const router = useRouter();
  const { setTabBarVisible } = useRoleShell();
  const user = useAuthStore((state) => state.user);
  const { counts, fetchCounts } = useNotificationStore();
  const { orders, isLoading: ordersLoading, error, fetchOrdersAsSupplier } = useOrderStore();
  const { products, fetchProducts } = useProductStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [promotions, setPromotions] = useState<BroadcastRecord[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  const loadDashboard = useCallback(async () => {
    if (!user) return;

    setLoadingExtras(true);

    try {
      const [_, __, ___, deliveriesResponse, broadcastsResponse] = await Promise.all([
        fetchOrdersAsSupplier({
          sortBy: "created_at",
          sortOrder: "DESC",
          limit: 20,
        }),
        fetchProducts(
          {
            supplier_id: user.id,
            sortBy: "created_at",
            sortOrder: "DESC",
            limit: 30,
          },
          { replace: true },
        ),
        fetchCounts(),
        shipmentService.getAll({ limit: 10 }),
        broadcastService.getActive(["factory", "distributor"]),
      ]);

      const shipmentRows =
        deliveriesResponse?.data?.deliveries || deliveriesResponse?.data || deliveriesResponse || [];
      setShipments(Array.isArray(shipmentRows) ? shipmentRows : []);
      setPromotions(Array.isArray(broadcastsResponse?.data) ? broadcastsResponse.data : []);
    } finally {
      setLoadingExtras(false);
    }
  }, [fetchCounts, fetchOrdersAsSupplier, fetchProducts, user]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const firstName = user?.full_name.split(" ")[0] || user?.full_name || "Distributor";

  const incomingOrders = useMemo<DashboardIncomingOrder[]>(() => {
    return (orders as Order[]).map((order) => {
      const buyer = order.buyer?.business_name || order.buyer?.full_name || "Retailer";
      const totalItems = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
      const amount = Number(order.total_price) || 0;
      const rawStatus = String(order.order_status);
      const status =
        rawStatus === "approved" ||
        rawStatus === "processing" ||
        rawStatus === "shipped" ||
        rawStatus === "delivered"
          ? (rawStatus as DashboardIncomingOrder["status"])
          : "pending";

      return {
        id: order.id,
        retailer: buyer,
        retailerId: order.buyer?.id,
        items: totalItems,
        total: amount,
        status,
        date: order.created_at,
        priority: amount >= 100000 ? "high" : amount >= 30000 ? "medium" : "low",
      };
    });
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter((product) => Number(product.stock_quantity || 0) <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => Number(a.stock_quantity || 0) - Number(b.stock_quantity || 0))
      .slice(0, 8);
  }, [products]);

  const shipmentRows = useMemo(() => {
    return shipments.slice(0, 4).map((shipment) => {
      const shipmentStatus = String(shipment.status || "pending");
      return {
        id: shipment.id || shipment.delivery_number || shipment.order_id || "delivery",
        orderId: shipment.order_id || "N/A",
        retailer:
          shipment.order?.buyer?.business_name ||
          shipment.order?.buyer?.full_name ||
          shipment.dropoff_location ||
          "Retailer",
        driver: shipment.driver?.full_name || shipment.driver?.driverUser?.full_name || "Unassigned",
        status:
          shipmentStatus === "in_transit"
            ? "in-transit"
            : shipmentStatus === "picked_up"
              ? "in-transit"
              : shipmentStatus,
        date: shipment.updated_at || shipment.created_at || new Date().toISOString(),
      };
    });
  }, [shipments]);

  const todaySchedule = useMemo(() => {
    const today = new Date().toDateString();
    const deliveriesToday = shipmentRows.filter(
      (shipment) => new Date(shipment.date).toDateString() === today,
    );
    const pendingPickups = incomingOrders.filter(
      (order) => order.status === "pending" || order.status === "approved",
    ).length;

    return {
      scheduled: deliveriesToday.length,
      remaining: deliveriesToday.filter((delivery) => delivery.status !== "delivered").length,
      pendingPickups,
    };
  }, [incomingOrders, shipmentRows]);

  const stats = useMemo(
    () => [
      {
        title: "Total Orders",
        value: String(orders.length),
        subtitle: `${orders.filter((order) => order.order_status === "approved").length} approved`,
        icon: "cart-outline" as const,
        onPress: () => router.push("/distributor/orders"),
      },
      {
        title: "Pending Orders",
        value: String(orders.filter((order) => order.order_status === "pending").length),
        subtitle: `${orders.filter((order) => order.order_status === "processing").length} processing`,
        icon: "time-outline" as const,
        onPress: () => router.push("/distributor/orders"),
      },
      {
        title: "Low Stock Items",
        value: String(lowStockProducts.length),
        subtitle: `${products.length} total products`,
        icon: "alert-circle-outline" as const,
        onPress: () => router.push("/distributor/products"),
      },
    ],
    [lowStockProducts.length, orders, products.length, router],
  );

  const filteredIncomingOrders = useMemo(() => {
    if (!normalizedSearch) {
      return incomingOrders.slice(0, 4);
    }

    return incomingOrders
      .filter((order) =>
        [order.id, order.retailer, order.status].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        ),
      )
      .slice(0, 4);
  }, [incomingOrders, normalizedSearch]);

  const filteredLowStock = useMemo(() => {
    if (!normalizedSearch) return lowStockProducts.slice(0, 4);

    return lowStockProducts
      .filter((product) =>
        [product.name, product.sku || "", product.supplier?.business_name || product.supplier?.full_name || ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      )
      .slice(0, 4);
  }, [lowStockProducts, normalizedSearch]);

  const filteredShipments = useMemo(() => {
    if (!normalizedSearch) return shipmentRows;

    return shipmentRows.filter((shipment) =>
      [shipment.id, shipment.orderId, shipment.retailer, shipment.driver, shipment.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [normalizedSearch, shipmentRows]);

  const quickActions = useMemo(
    () => [
      {
        icon: "cube-outline" as const,
        label: "Add Product",
        caption: "Manage inventory",
        onPress: () => router.push("/distributor/products"),
      },
      {
        icon: "megaphone-outline" as const,
        label: "Promotion",
        caption: "Broadcast offers",
        onPress: () => router.push("/distributor/promotions"),
      },
      {
        icon: "stats-chart-outline" as const,
        label: "Reports",
        caption: "Review performance",
        onPress: () => router.push("/distributor/orders"),
      },
      {
        icon: "storefront-outline" as const,
        label: "Suppliers",
        caption: "Manage suppliers",
        onPress: () => router.push("/distributor/marketplace"),
      },
      {
        icon: "car-outline" as const,
        label: "Assign Driver",
        caption: "Manage delivery",
        onPress: () => router.push("/distributor/delivery"),
      },
    ],
    [router],
  );

  const getPriorityColors = (priority: string) => {
    switch (priority) {
      case "high":
        return { bg: "#fee2e2", text: "#dc2626" };
      case "medium":
        return { bg: "#fef3c7", text: "#b45309" };
      default:
        return { bg: "#dcfce7", text: "#15803d" };
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "#fef3c7", text: "#b45309" };
      case "processing":
      case "approved":
        return { bg: "#dbeafe", text: "#1d4ed8" };
      case "in-transit":
      case "shipped":
        return { bg: "#ede9fe", text: "#6d28d9" };
      case "delivered":
        return { bg: "#dcfce7", text: "#166534" };
      default:
        return { bg: "#f1f5f9", text: "#475569" };
    }
  };

  const isLoading = ordersLoading || loadingExtras;

  return (
    <ScreenWrapper title="Dashboard" subtitle={user?.business_name || "Distributor"}>
      <ScrollView
        contentContainerStyle={styles.container}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <DashboardTopBar
            greeting={`Hello, ${firstName}`}
            title={user?.full_name || "Distributor"}
            businessLabel={user?.business_name || "Distribution business"}
            verified={user?.verified}
            notificationCount={counts.unread}
            onNotificationsPress={() => router.push("/distributor/notifications")}
          />
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Search orders, inventory, deliveries..."
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
            data={stats}
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
            title="Marketplace Offers"
            subtitle="Active promotions from factories and peer distributors"
          />
          {isLoading && promotions.length === 0 ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator size="small" color="#1d4ed8" />
            </View>
          ) : promotions.length ? (
            <View style={styles.promoList}>
              {promotions.slice(0, 4).map((promotion) => (
                <Pressable key={promotion.id} style={styles.promoCard} onPress={() => router.push("/distributor/promotions")}>
                  <View style={styles.promoTopRow}>
                    <Text style={styles.promoTitle} numberOfLines={1}>
                      {promotion.title}
                    </Text>
                    <View style={styles.promoBadge}>
                      <Text style={styles.promoBadgeText}>{promotion.priority}</Text>
                    </View>
                  </View>
                  <Text style={styles.promoSummary} numberOfLines={2}>
                    {promotion.summary || promotion.description}
                  </Text>
                  <Text style={styles.promoMeta}>
                    {promotion.code ? `Code: ${promotion.code} • ` : ""}
                    Ends {formatDate(promotion.end_date)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <EmptyBlock
              icon="megaphone-outline"
              title="No active offers"
              subtitle="Factory and distributor promotions will appear here when available."
            />
          )}
        </View>

        <View style={styles.panel}>
          <SectionHeader
            title="Incoming Orders"
            subtitle={`${incomingOrders.filter((order) => order.status === "pending").length} orders pending approval`}
            actionLabel="View All"
            onActionPress={() => router.push("/distributor/orders")}
          />
          {filteredIncomingOrders.length ? (
            <View style={styles.listBlock}>
              {filteredIncomingOrders.map((order) => {
                const priority = getPriorityColors(order.priority);
                const status = getStatusColors(order.status);

                return (
                  <Pressable
                    key={order.id}
                    style={styles.listRow}
                    onPress={() => router.push("/distributor/orders")}
                  >
                    <View style={styles.listLeft}>
                      <View style={[styles.inlineIcon, { backgroundColor: priority.bg }]}>
                        <Ionicons name="cart-outline" size={16} color={priority.text} />
                      </View>
                      <View style={styles.rowCopy}>
                        <View style={styles.rowTopLine}>
                          <Text style={styles.rowTitle}>#{order.id.slice(0, 8)}</Text>
                          <Text style={[styles.inlineBadge, { backgroundColor: status.bg, color: status.text }]}>
                            {order.status}
                          </Text>
                        </View>
                        <Text style={styles.rowSubtitle}>{order.retailer}</Text>
                        <Text style={styles.rowMeta}>
                          {order.items} items • {formatCurrency(order.total)}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <EmptyBlock
              icon="receipt-outline"
              title="No incoming matches"
              subtitle="Try clearing your search to see the latest supplier-side orders."
            />
          )}
        </View>

        <View style={styles.panel}>
          <SectionHeader
            title="Recent Shipments"
            subtitle="Track your ongoing deliveries"
            actionLabel="Manage"
            onActionPress={() => router.push("/distributor/delivery")}
          />
          {filteredShipments.length ? (
            <View style={styles.listBlock}>
              {filteredShipments.map((shipment) => {
                const status = getStatusColors(shipment.status);

                return (
                  <Pressable
                    key={shipment.id}
                    style={styles.listRow}
                    onPress={() => router.push("/distributor/delivery")}
                  >
                    <View style={styles.listLeft}>
                      <View style={[styles.inlineIcon, { backgroundColor: status.bg }]}>
                        <Ionicons name="car-outline" size={16} color={status.text} />
                      </View>
                      <View style={styles.rowCopy}>
                        <View style={styles.rowTopLine}>
                          <Text style={styles.rowTitle}>{shipment.id}</Text>
                          <Text style={[styles.inlineBadge, { backgroundColor: status.bg, color: status.text }]}>
                            {shipment.status}
                          </Text>
                        </View>
                        <Text style={styles.rowSubtitle}>Order {shipment.orderId} • {shipment.retailer}</Text>
                        <Text style={styles.rowMeta}>Driver: {shipment.driver}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <EmptyBlock
              icon="car-outline"
              title="No shipment activity"
              subtitle="Shipment updates will appear here as deliveries are created and assigned."
            />
          )}
        </View>

        <View style={styles.panel}>
          <SectionHeader
            title="Low Stock Alert"
            subtitle="Products below minimum stock level"
            actionLabel="Inventory"
            onActionPress={() => router.push("/distributor/products")}
          />
          {filteredLowStock.length ? (
            <View style={styles.lowStockList}>
              {filteredLowStock.map((product) => {
                const ratio = Number(product.stock_quantity || 0) / LOW_STOCK_THRESHOLD;
                const isCritical = ratio < 0.3;

                return (
                  <View key={product.id} style={styles.stockCard}>
                    <View style={styles.stockHeader}>
                      <View style={styles.rowCopy}>
                        <Text style={styles.rowTitle}>{product.name}</Text>
                        <Text style={styles.rowSubtitle}>
                          {(product.sku || product.id).toString()} • {user?.business_name || "Current inventory"}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.inlineBadge,
                          {
                            backgroundColor: isCritical ? "#fee2e2" : "#fef3c7",
                            color: isCritical ? "#dc2626" : "#b45309",
                          },
                        ]}
                      >
                        {isCritical ? "Critical" : "Low"}
                      </Text>
                    </View>
                    <Text style={styles.rowMeta}>
                      Stock {product.stock_quantity} / {LOW_STOCK_THRESHOLD} min
                    </Text>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(100, ratio * 100)}%`,
                            backgroundColor: isCritical ? "#ef4444" : "#f59e0b",
                          },
                        ]}
                      />
                    </View>
                    <Pressable style={styles.inlineActionButton} onPress={() => router.push("/distributor/products")}>
                      <Text style={styles.inlineActionText}>Restock Inventory</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : (
            <EmptyBlock
              icon="checkmark-circle-outline"
              title="Inventory looks healthy"
              subtitle="No products are currently below the low-stock threshold."
            />
          )}
        </View>

        <View style={styles.panel}>
          <SectionHeader title="Quick Actions" subtitle="Common distributor tasks on mobile" />
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

        <View style={styles.panel}>
          <SectionHeader title="Today's Schedule" subtitle="Delivery and pickup focus for today" />
          <View style={styles.scheduleList}>
            <View style={styles.scheduleCard}>
              <View style={styles.scheduleIconWrap}>
                <Ionicons name="car-outline" size={18} color="#2563eb" />
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{todaySchedule.scheduled} deliveries scheduled</Text>
                <Text style={styles.rowMeta}>{todaySchedule.remaining} remaining today</Text>
              </View>
            </View>
            <View style={styles.scheduleCard}>
              <View style={[styles.scheduleIconWrap, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="time-outline" size={18} color="#b45309" />
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{todaySchedule.pendingPickups} pending pickups</Text>
                <Text style={styles.rowMeta}>Awaiting driver assignment</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 14,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#b91c1c",
  },
  compactSection: {
    marginHorizontal: -16,
  },
  statsRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 16,
    gap: 14,
  },
  loadingBlock: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  promoList: {
    gap: 10,
  },
  promoCard: {
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 8,
  },
  promoTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  promoTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  promoBadge: {
    borderRadius: 999,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  promoBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1d4ed8",
    textTransform: "capitalize",
  },
  promoSummary: {
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
  },
  promoMeta: {
    fontSize: 11,
    color: "#64748b",
  },
  listBlock: {
    gap: 10,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
  },
  listLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inlineIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: {
    flex: 1,
    gap: 3,
  },
  rowTopLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#475569",
  },
  rowMeta: {
    fontSize: 11,
    color: "#64748b",
  },
  inlineBadge: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  lowStockList: {
    gap: 12,
  },
  stockCard: {
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 8,
  },
  stockHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  inlineActionButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inlineActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1d4ed8",
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
    minHeight: 118,
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 8,
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
  scheduleList: {
    gap: 10,
  },
  scheduleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
  },
  scheduleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyBlock: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
  },
  emptyBlockTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptyBlockSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748b",
    textAlign: "center",
  },
});
