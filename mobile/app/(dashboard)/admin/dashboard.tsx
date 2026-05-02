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
import { useProductStore } from "@/features/products/product.store";
import { useOrderStore } from "@/features/orders/order.store";
import broadcastService from "@/features/broadcasts/broadcast.service";
import { type BroadcastRecord } from "@/features/broadcasts/broadcast.types";
import shipmentService, { type ShipmentRecord } from "@/features/shipments/shipment.service";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

export default function AdminDashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { counts, fetchCounts } = useNotificationStore();
  const { products, fetchProducts, isLoading: productsLoading, error: productError } = useProductStore();
  const { orders, fetchRecentOrders, isLoading: ordersLoading, error: orderError } = useOrderStore();
  const { setTabBarVisible } = useRoleShell();
  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingExtras, setIsLoadingExtras] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoadingExtras(true);
    try {
      const [_, __, ___, shipmentResponse, broadcastResponse] = await Promise.all([
        fetchProducts({ sortBy: "created_at", sortOrder: "DESC", limit: 30 }, { replace: true }),
        fetchRecentOrders(),
        fetchCounts(),
        shipmentService.getAll({ limit: 15 }),
        broadcastService.getActive(["admin", "factory", "distributor"]),
      ]);

      const shipmentRows = shipmentResponse?.data?.deliveries || shipmentResponse?.data || [];
      setShipments(Array.isArray(shipmentRows) ? shipmentRows : []);
      setBroadcasts(Array.isArray(broadcastResponse?.data) ? broadcastResponse.data : []);
    } finally {
      setIsLoadingExtras(false);
    }
  }, [fetchCounts, fetchProducts, fetchRecentOrders]);

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
      { label: "Recent Orders", value: orders.length, icon: "receipt-outline" as const },
      { label: "Catalog Items", value: products.length, icon: "cube-outline" as const },
      { label: "Open Deliveries", value: shipments.length, icon: "car-outline" as const },
      { label: "Unread Alerts", value: counts.unread, icon: "notifications-outline" as const },
    ],
    [counts.unread, orders.length, products.length, shipments.length],
  );

  const isLoading = productsLoading || ordersLoading || isLoadingExtras;
  const error = orderError || productError;

  return (
    <ScreenWrapper title="Dashboard" subtitle={user?.business_name || "Platform overview"}>
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
            <Text style={styles.panelTitle}>Active Broadcasts</Text>
            <Pressable onPress={() => router.push("/admin/notifications" as never)}>
              <Text style={styles.panelAction}>Alerts</Text>
            </Pressable>
          </View>

          {isLoading && broadcasts.length === 0 ? (
            <ActivityIndicator size="small" color="#1d4ed8" />
          ) : broadcasts.length ? (
            broadcasts.slice(0, 4).map((broadcast) => (
              <View key={broadcast.id} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{broadcast.title}</Text>
                  <Text style={styles.rowMeta}>Audience: {broadcast.target_audience}</Text>
                </View>
                <Text style={styles.badge}>{broadcast.priority}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No active broadcasts currently running.</Text>
          )}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Operational Health</Text>
            <Pressable onPress={() => router.push("/admin/users" as never)}>
              <Text style={styles.panelAction}>Users</Text>
            </Pressable>
          </View>
          <View style={styles.healthGrid}>
            <View style={styles.healthCard}>
              <Text style={styles.healthLabel}>Deliveries Requiring Attention</Text>
              <Text style={styles.healthValue}>
                {shipments.filter((shipment) => ["failed", "cancelled"].includes(String(shipment.status))).length}
              </Text>
            </View>
            <View style={styles.healthCard}>
              <Text style={styles.healthLabel}>Pending Orders</Text>
              <Text style={styles.healthValue}>
                {orders.filter((order) => order.order_status === "pending").length}
              </Text>
            </View>
          </View>
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
    gap: 10,
  },
  rowCopy: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  rowMeta: { marginTop: 2, fontSize: 12, color: "#64748b" },
  badge: {
    fontSize: 10,
    textTransform: "capitalize",
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: "hidden",
  },
  healthGrid: { flexDirection: "row", gap: 10 },
  healthCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
  },
  healthLabel: { fontSize: 12, color: "#64748b" },
  healthValue: { marginTop: 6, fontSize: 24, fontWeight: "800", color: "#0f172a" },
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