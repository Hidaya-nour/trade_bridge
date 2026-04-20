import { useMemo, useState } from "react";
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
import {
  ACTIVE_DELIVERIES,
  DELIVERY_HISTORY,
  DRIVER_DELIVERIES,
  NOTIFICATIONS,
  type DeliveryStatus,
} from "./driverData";

const formatStatus = (status: DeliveryStatus) =>
  status.replace("_", " ").toUpperCase();

const getStatusStyle = (status: DeliveryStatus) => {
  switch (status) {
    case "assigned":
      return { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" };
    case "picked_up":
      return { bg: "#ede9fe", border: "#ddd6fe", text: "#6d28d9" };
    case "in_transit":
      return { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c" };
    case "delivered":
      return { bg: "#ecfdf3", border: "#bbf7d0", text: "#15803d" };
    default:
      return { bg: "#f8fafc", border: "#e2e8f0", text: "#475569" };
  }
};

export default function DriverDashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);

  const unreadNotifications = useMemo(
    () => NOTIFICATIONS.filter((item) => item.unread).length,
    [],
  );

  const activeDeliveries = useMemo(
    () =>
      ACTIVE_DELIVERIES.filter((delivery) => delivery.status !== "delivered"),
    [],
  );

  const completedToday = useMemo(
    () =>
      DELIVERY_HISTORY.filter((item) =>
        item.deliveredAt.toLowerCase().includes("today"),
      ).length,
    [],
  );

  const activeRoute = activeDeliveries[0] || null;

  return (
    <ScreenWrapper
      title="Driver Dashboard"
      subtitle={user?.full_name || "Delivery Operations"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await new Promise((resolve) => setTimeout(resolve, 600));
              setRefreshing(false);
            }}
          />
        }
      >
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Driver Quick View</Text>
          <Text style={styles.welcomeSubtitle}>
            Summary and shortcuts are in the drawer
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Routes</Text>
            <Text style={styles.statValue}>{activeDeliveries.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Completed Today</Text>
            <Text style={styles.statValue}>{completedToday}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Unread Alerts</Text>
            <Text style={styles.statValue}>{unreadNotifications}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Orders</Text>
            <Text style={styles.statValue}>{DRIVER_DELIVERIES.length}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>
            Use drawer links for full detail pages
          </Text>
          <View style={styles.actionRow}>
            {[
              {
                label: "Notifications",
                route: "/driver/notifications",
                icon: "notifications-outline",
              },
              {
                label: "Deliveries",
                route: "/driver/deliveries",
                icon: "car-outline",
              },
              {
                label: "Issues",
                route: "/driver/issues",
                icon: "alert-circle-outline",
              },
              {
                label: "Profile",
                route: "/driver/profile",
                icon: "person-outline",
              },
            ].map((action) => (
              <Pressable
                key={action.route}
                onPress={() => router.push(action.route as never)}
                style={styles.actionChip}
              >
                <Ionicons name={action.icon as any} size={16} color="#1d4ed8" />
                <Text style={styles.actionText}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {activeRoute ? (
          <Pressable
            style={styles.sectionCard}
            onPress={() => router.push(`/driver/deliveries/${activeRoute.id}` as never)}
          >
            <Text style={styles.sectionTitle}>Current Active Order</Text>
            <Text style={styles.sectionSubtitle}>{activeRoute.orderCode}</Text>
            <Text style={styles.metaText}>
              Pickup: {activeRoute.pickupPoint}
            </Text>
            <Text style={styles.metaText}>
              Dropoff: {activeRoute.destination}
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${activeRoute.routeProgress}%` },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {activeRoute.routeProgress}% completed
            </Text>
            <View style={styles.statusBadgeRow}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusStyle(activeRoute.status).bg,
                    borderColor: getStatusStyle(activeRoute.status).border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: getStatusStyle(activeRoute.status).text },
                  ]}
                >
                  {formatStatus(activeRoute.status)}
                </Text>
              </View>
            </View>
          </Pressable>
        ) : (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>No active route</Text>
            <Text style={styles.sectionSubtitle}>
              Awaiting assignment from dispatch
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, gap: 14 },
  welcomeCard: { backgroundColor: "#0f172a", borderRadius: 14, padding: 16 },
  welcomeTitle: { color: "#ffffff", fontSize: 20, fontWeight: "700" },
  welcomeSubtitle: { color: "#cbd5e1", fontSize: 12, marginTop: 3 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
  },
  statLabel: { color: "#64748b", fontSize: 12, fontWeight: "600" },
  statValue: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
  },
  sectionTitle: { color: "#0f172a", fontSize: 16, fontWeight: "700" },
  sectionSubtitle: { color: "#64748b", fontSize: 12, marginTop: 2 },
  actionRow: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#eff6ff",
  },
  actionText: { color: "#1d4ed8", fontSize: 12, fontWeight: "700" },
  metaText: { color: "#334155", fontSize: 12, marginTop: 4 },
  progressTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 6,
    backgroundColor: "#dbeafe",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#2563eb", borderRadius: 6 },
  progressLabel: { color: "#64748b", fontSize: 11, marginTop: 4 },
  statusBadgeRow: { marginTop: 8 },
  statusBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: { fontSize: 10, fontWeight: "700" },
});
