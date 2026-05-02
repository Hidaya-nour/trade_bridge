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
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { useAuthStore } from "@/features/auth/auth.store";
import { useNotificationStore } from "@/features/notifications/notification.store";
import { useOrderStore } from "@/features/orders/order.store";
import { useProductStore } from "@/features/products/product.store";
import shipmentService, { type ShipmentRecord } from "@/features/shipments/shipment.service";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

export default function FactoryDashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { counts, fetchCounts } = useNotificationStore();
  const { orders, fetchOrdersAsSupplier, isLoading: isOrdersLoading, error } = useOrderStore();
  const { products, fetchProducts, isLoading: isProductsLoading } = useProductStore();
  const { setTabBarVisible } = useRoleShell();
  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingShipments, setIsLoadingShipments] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setIsLoadingShipments(true);
    try {
      const [_, __, response] = await Promise.all([
        fetchOrdersAsSupplier({ sortBy: "created_at", sortOrder: "DESC", limit: 12 }),
        fetchProducts({ supplier_id: user.id, sortBy: "created_at", sortOrder: "DESC", limit: 20 }, { replace: true }),
        shipmentService.getAll({ limit: 20 }),
        fetchCounts(),
      ]);

      const rows = response?.data?.deliveries || response?.data || [];
      setShipments(Array.isArray(rows) ? rows : []);
    } finally {
      setIsLoadingShipments(false);
    }
  }, [fetchCounts, fetchOrdersAsSupplier, fetchProducts, user]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboard();
    setIsRefreshing(false);
  }, [loadDashboard]);

  const stats = useMemo(
    () => [
      { label: "Incoming Orders", value: orders.length, icon: "receipt-outline" as const },
      {
        label: "Pending Approval",
        value: orders.filter((order) => order.order_status === "pending").length,
        icon: "time-outline" as const,
      },
      { label: "Products", value: products.length, icon: "cube-outline" as const },
      { label: "Active Alerts", value: counts.unread, icon: "notifications-outline" as const },
    ],
    [counts.unread, orders, products.length],
  );

  const recentOrders = orders.slice(0, 4);
  const recentShipments = shipments.slice(0, 4);
  const isLoading = isOrdersLoading || isProductsLoading || isLoadingShipments;

  return (
    <ScreenWrapper title="Dashboard" subtitle={user?.business_name || "Production and fulfillment"}>
      <ScrollView
        contentContainerStyle={styles.container}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Ionicons name={stat.icon} size={18} color="#1d4ed8" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Recent Supplier Orders</Text>
            <Pressable onPress={() => router.push("/factory/orders" as never)}>
              <Text style={styles.panelAction}>View all</Text>
            </Pressable>
          </View>

          {isLoading && recentOrders.length === 0 ? (
            <ActivityIndicator size="small" color="#1d4ed8" />
          ) : recentOrders.length ? (
            recentOrders.map((order) => (
              <Pressable key={order.id} style={styles.row} onPress={() => router.push("/factory/orders" as never)}>
                <View>
                  <Text style={styles.rowTitle}>#{order.id.slice(0, 8)}</Text>
                  <Text style={styles.rowMeta}>
                    {(order.buyer?.business_name || order.buyer?.full_name || "Buyer")} • {order.items?.length || 0} items
                  </Text>
                </View>
                <Text style={styles.status}>{order.order_status}</Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.emptyText}>No supplier orders available yet.</Text>
          )}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Delivery Pipeline</Text>
            <Pressable onPress={() => router.push("/factory/delivery" as never)}>
              <Text style={styles.panelAction}>Manage</Text>
            </Pressable>
          </View>

          {recentShipments.length ? (
            recentShipments.map((shipment) => (
              <Pressable key={shipment.id || shipment.order_id} style={styles.row} onPress={() => router.push("/factory/delivery" as never)}>
                <View>
                  <Text style={styles.rowTitle}>{shipment.id || shipment.delivery_number || "Delivery"}</Text>
                  <Text style={styles.rowMeta}>{shipment.order?.buyer?.business_name || shipment.dropoff_location || "Dropoff pending"}</Text>
                </View>
                <Text style={styles.status}>{shipment.status || "pending"}</Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.emptyText}>No active shipments in the delivery pipeline.</Text>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14, paddingBottom: 40 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 12,
    gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  statLabel: { fontSize: 12, color: "#64748b" },
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 14,
    gap: 10,
  },
  panelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  panelTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  panelAction: { fontSize: 12, color: "#1d4ed8", fontWeight: "700" },
  row: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  rowMeta: { marginTop: 2, fontSize: 12, color: "#64748b" },
  status: {
    fontSize: 11,
    textTransform: "capitalize",
    color: "#1d4ed8",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  emptyText: { fontSize: 12, color: "#64748b" },
  errorBox: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 12,
  },
  errorText: { color: "#b91c1c", fontSize: 12 },
});