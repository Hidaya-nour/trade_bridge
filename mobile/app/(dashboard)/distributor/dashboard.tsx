import { useCallback, useState } from "react";
import {
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
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --- MOCK DATA FROM WEB ---
const MOCK_STATS = [
  {
    id: 1,
    title: "Total Orders",
    value: "156",
    change: "+12",
    trend: "up",
    icon: "cart",
    color: "#2563eb",
    bg: "#dbeafe",
  },
  {
    id: 2,
    title: "Pending Orders",
    value: "24",
    change: "-5",
    trend: "down",
    icon: "time",
    color: "#d97706",
    bg: "#fef3c7",
  },
  {
    id: 3,
    title: "Low Stock Items",
    value: "12",
    change: "+3",
    trend: "up",
    icon: "alert-circle",
    color: "#dc2626",
    bg: "#fee2e2",
  },
];

const MOCK_INCOMING_ORDERS = [
  {
    id: "ORD-2026-0245",
    retailer: "ABC Retail Shop",
    items: 5,
    total: 12500,
    status: "pending",
    date: "2026-02-12T09:30:00",
    priority: "high",
  },
  {
    id: "ORD-2026-0244",
    retailer: "Mega Mart",
    items: 12,
    total: 45800,
    status: "pending",
    date: "2026-02-12T08:15:00",
    priority: "high",
  },
  {
    id: "ORD-2026-0243",
    retailer: "City Supermarket",
    items: 3,
    total: 8900,
    status: "processing",
    date: "2026-02-11T15:45:00",
    priority: "medium",
  },
];

const MOCK_LOW_STOCK = [
  {
    id: 1,
    name: "White Teff Flour",
    sku: "TFF-001",
    stock: 25,
    minStock: 50,
    supplier: "Ethiopia Agri",
  },
  {
    id: 2,
    name: "Soybean Oil",
    sku: "OIL-002",
    stock: 120,
    minStock: 200,
    supplier: "Adama Wholesalers",
  },
  {
    id: 3,
    name: "Tomato Paste",
    sku: "TOM-003",
    stock: 45,
    minStock: 100,
    supplier: "Ethiopia Agri",
  },
];

const MOCK_SHIPMENTS = [
  {
    id: "SHP-2026-0891",
    orderId: "ORD-2026-0235",
    retailer: "City Supermarket",
    driver: "Abebe Kebede",
    status: "in-transit",
  },
  {
    id: "SHP-2026-0890",
    orderId: "ORD-2026-0232",
    retailer: "Mega Mart",
    driver: "Almaz Worku",
    status: "pending",
  },
];

export default function DistributorDashboardScreen() {
  const router = useRouter();
  const { setTabBarVisible } = useRoleShell();
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  const businessName = user?.business_name || user?.full_name || "Distributor";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate network delay for mock data
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return { text: "#dc2626", bg: "#fef2f2" };
      case "medium":
        return { text: "#d97706", bg: "#fffbeb" };
      case "low":
        return { text: "#16a34a", bg: "#f0fdf4" };
      default:
        return { text: "#64748b", bg: "#f8fafc" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "#d97706", border: "#fcd34d", bg: "#fffbeb" };
      case "processing":
        return { text: "#2563eb", border: "#bfdbfe", bg: "#eff6ff" };
      case "in-transit":
        return { text: "#7c3aed", border: "#ddd6fe", bg: "#f5f3ff" };
      case "delivered":
        return { text: "#16a34a", border: "#bbf7d0", bg: "#f0fdf4" };
      default:
        return { text: "#475569", border: "#cbd5e1", bg: "#f8fafc" };
    }
  };

  const renderStats = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.statsContainer}
    >
      {MOCK_STATS.map((stat) => (
        <View key={stat.id} style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconWrap, { backgroundColor: stat.bg }]}>
              <Ionicons name={stat.icon as any} size={18} color={stat.color} />
            </View>
            <View
              style={[
                styles.trendBadge,
                stat.trend === "up" ? styles.trendUp : styles.trendDown,
              ]}
            >
              <Ionicons
                name={stat.trend === "up" ? "trending-up" : "trending-down"}
                size={12}
                color={stat.trend === "up" ? "#16a34a" : "#dc2626"}
              />
              <Text
                style={[
                  styles.trendText,
                  stat.trend === "up"
                    ? styles.trendTextUp
                    : styles.trendTextDown,
                ]}
              >
                {stat.change}
              </Text>
            </View>
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statTitle}>{stat.title}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderIncomingOrders = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Incoming Orders</Text>
          <Text style={styles.sectionSubtitle}>Pending approval</Text>
        </View>
        <Pressable onPress={() => router.push("/distributor/orders")}>
          <Text style={styles.linkText}>View All</Text>
        </Pressable>
      </View>

      <View style={styles.ordersList}>
        {MOCK_INCOMING_ORDERS.map((order) => {
          const priorityStyle = getPriorityColor(order.priority);
          const statusStyle = getStatusColor(order.status);

          return (
            <View key={order.id} style={styles.orderItem}>
              <View style={styles.orderLeft}>
                <View
                  style={[
                    styles.priorityDot,
                    { backgroundColor: priorityStyle.text },
                  ]}
                />
                <View>
                  <View style={styles.orderIdRow}>
                    <Text style={styles.orderIdText}>{order.id}</Text>
                    <View
                      style={[
                        styles.smallBadge,
                        {
                          backgroundColor: statusStyle.bg,
                          borderColor: statusStyle.border,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.smallBadgeText,
                          { color: statusStyle.text },
                        ]}
                      >
                        {order.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderRetailerText}>{order.retailer}</Text>
                  <Text style={styles.orderDateText}>
                    {formatDate(order.date)}
                  </Text>
                </View>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderTotalText}>
                  {formatCurrency(order.total)}
                </Text>
                <Text style={styles.orderItemsText}>{order.items} items</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Pressable style={styles.fullWidthButton}>
        <Ionicons name="checkmark-done" size={16} color="#ffffff" />
        <Text style={styles.fullWidthButtonText}>Approve Pending Orders</Text>
      </Pressable>
    </View>
  );

  const renderLowStock = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.sectionTitle}>Low Stock Alert</Text>
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>{MOCK_LOW_STOCK.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.stockList}>
        {MOCK_LOW_STOCK.map((item) => {
          const ratio = item.stock / item.minStock;
          const isCritical = ratio < 0.3;

          return (
            <View key={item.id} style={styles.stockItem}>
              <View style={styles.stockItemHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stockItemName}>{item.name}</Text>
                  <Text style={styles.stockItemSub}>
                    {item.supplier} • {item.sku}
                  </Text>
                </View>
                <View
                  style={[
                    styles.stockStatusBadge,
                    isCritical ? styles.stockCritical : styles.stockLow,
                  ]}
                >
                  <Text
                    style={[
                      styles.stockStatusText,
                      isCritical
                        ? styles.stockCriticalText
                        : styles.stockLowText,
                    ]}
                  >
                    {isCritical ? "Critical" : "Low"}
                  </Text>
                </View>
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.stockCountText}>
                  Stock: {item.stock} / {item.minStock} min
                </Text>
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, ratio * 100)}%`,
                      backgroundColor: isCritical ? "#ef4444" : "#f59e0b",
                    },
                  ]}
                />
              </View>

              <View style={styles.stockActionRow}>
                <Pressable style={styles.restockBtn}>
                  <Text style={styles.restockBtnText}>Restock Inventory</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderActiveShipments = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Active Shipments</Text>
          <Text style={styles.sectionSubtitle}>Track deliveries</Text>
        </View>
        <Pressable onPress={() => router.push("/distributor/delivery")}>
          <Text style={styles.linkText}>Manage</Text>
        </Pressable>
      </View>

      <View style={styles.shipmentsList}>
        {MOCK_SHIPMENTS.map((shipment) => {
          const statusStyle = getStatusColor(shipment.status);

          return (
            <View key={shipment.id} style={styles.shipmentItem}>
              <View
                style={[
                  styles.shipmentIconLayout,
                  { backgroundColor: statusStyle.bg },
                ]}
              >
                <Ionicons
                  name={shipment.status === "in-transit" ? "car" : "time"}
                  size={18}
                  color={statusStyle.text}
                />
              </View>
              <View style={styles.shipmentDetails}>
                <View style={styles.shipmentHeader}>
                  <Text style={styles.shipmentId}>{shipment.id}</Text>
                  <Text
                    style={[
                      styles.shipmentStatusText,
                      { color: statusStyle.text },
                    ]}
                  >
                    {shipment.status.replace("-", " ").toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.shipmentSub}>
                  Order: {shipment.orderId} • {shipment.retailer}
                </Text>
                <Text style={styles.shipmentDriver}>
                  Driver: {shipment.driver}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.sectionCard}>
      <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
        Quick Actions
      </Text>
      <View style={styles.quickActionsGrid}>
        <Pressable style={styles.actionBtn}>
          <View style={[styles.actionIconWrap, { backgroundColor: "#f0f9ff" }]}>
            <Ionicons name="cube" size={20} color="#0284c7" />
          </View>
          <Text style={styles.actionBtnText}>Add Product</Text>
        </Pressable>

        <Pressable style={styles.actionBtn}>
          <View style={[styles.actionIconWrap, { backgroundColor: "#fdf4ff" }]}>
            <Ionicons name="megaphone" size={20} color="#c026d3" />
          </View>
          <Text style={styles.actionBtnText}>Promotions</Text>
        </Pressable>

        <Pressable style={styles.actionBtn}>
          <View style={[styles.actionIconWrap, { backgroundColor: "#f0fdf4" }]}>
            <Ionicons name="stats-chart" size={20} color="#16a34a" />
          </View>
          <Text style={styles.actionBtnText}>Reports</Text>
        </Pressable>

        <Pressable style={styles.actionBtn}>
          <View style={[styles.actionIconWrap, { backgroundColor: "#fffbeb" }]}>
            <Ionicons name="people" size={20} color="#d97706" />
          </View>
          <Text style={styles.actionBtnText}>Suppliers</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderPerformance = () => (
    <View style={styles.sectionCard}>
      <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
        Performance Summary
      </Text>

      <View style={styles.performanceRow}>
        <View style={styles.perfHeader}>
          <Text style={styles.perfLabel}>Order Fulfillment</Text>
          <Text style={styles.perfValue}>94.2%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: "94.2%", backgroundColor: "#2563eb" },
            ]}
          />
        </View>
      </View>

      <View style={styles.performanceRow}>
        <View style={styles.perfHeader}>
          <Text style={styles.perfLabel}>On-Time Delivery</Text>
          <Text style={styles.perfValue}>97.8%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: "97.8%", backgroundColor: "#16a34a" },
            ]}
          />
        </View>
      </View>

      <View style={styles.performanceRow}>
        <View style={styles.perfHeader}>
          <Text style={styles.perfLabel}>Customer Satisfaction</Text>
          <Text style={styles.perfValue}>4.8/5.0</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: "96%", backgroundColor: "#d97706" },
            ]}
          />
        </View>
      </View>
    </View>
  );

  return (
    <ScreenWrapper title="Dashboard" subtitle="Distributor">
      <ScrollView
        contentContainerStyle={styles.container}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.welcomeBanner}>
          <View>
            <Text style={styles.welcomeTitle}>Welcome back,</Text>
            <Text style={styles.businessName}>{businessName}</Text>
          </View>
        </View>

        {renderStats()}
        {renderQuickActions()}
        {renderIncomingOrders()}
        {renderActiveShipments()}
        {renderLowStock()}
        {renderPerformance()}
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
  welcomeBanner: {
    backgroundColor: "#1e3a8a",
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeTitle: {
    color: "#bfdbfe",
    fontSize: 14,
  },
  businessName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 2,
  },
  statsContainer: {
    paddingVertical: 4,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    width: 150,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  trendUp: {
    backgroundColor: "#f0fdf4",
  },
  trendDown: {
    backgroundColor: "#fef2f2",
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  trendTextUp: {
    color: "#16a34a",
  },
  trendTextDown: {
    color: "#dc2626",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  alertBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  alertBadgeText: {
    color: "#991b1b",
    fontSize: 11,
    fontWeight: "700",
  },
  linkText: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "600",
  },
  ordersList: {
    gap: 12,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  orderLeft: {
    flexDirection: "row",
    gap: 10,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  orderIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  smallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  smallBadgeText: {
    fontSize: 9,
    fontWeight: "700",
  },
  orderRetailerText: {
    fontSize: 13,
    color: "#334155",
    marginBottom: 2,
  },
  orderDateText: {
    fontSize: 11,
    color: "#94a3b8",
  },
  orderRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  orderTotalText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  orderItemsText: {
    fontSize: 12,
    color: "#64748b",
  },
  fullWidthButton: {
    backgroundColor: "#1e3a8a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  fullWidthButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  stockList: {
    gap: 16,
  },
  stockItem: {
    backgroundColor: "#ffffff",
  },
  stockItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  stockItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  stockItemSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  stockStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stockCritical: {
    backgroundColor: "#fee2e2",
  },
  stockLow: {
    backgroundColor: "#fef3c7",
  },
  stockStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  stockCriticalText: {
    color: "#b91c1c",
  },
  stockLowText: {
    color: "#b45309",
  },
  progressRow: {
    marginTop: 10,
  },
  stockCountText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  stockActionRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  restockBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  restockBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  shipmentsList: {
    gap: 12,
  },
  shipmentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    gap: 12,
  },
  shipmentIconLayout: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  shipmentDetails: {
    flex: 1,
  },
  shipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  shipmentId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  shipmentStatusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  shipmentSub: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 2,
  },
  shipmentDriver: {
    fontSize: 11,
    color: "#64748b",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  actionBtn: {
    width: "48%",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    alignItems: "flex-start",
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  performanceRow: {
    marginBottom: 16,
  },
  perfHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  perfLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  perfValue: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "600",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 6,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
});
