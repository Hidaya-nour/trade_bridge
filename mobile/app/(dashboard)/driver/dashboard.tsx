import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  Linking,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { useAuthStore } from "@/features/auth/auth.store";
import { useNotificationStore } from "@/features/notifications/notification.store";
import deliveryService from "@/features/driver-deliveries/delivery.service";
import { type DriverDelivery, type DeliveryStatus } from "@/features/driver-deliveries/delivery.types";
import driverIssueService from "@/features/driver-issues/driver-issue.service";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const formatStatus = (status: DeliveryStatus) =>
  status.replace("_", " ").toUpperCase();

const getStatusStyle = (status: DeliveryStatus) => {
  switch (status) {
    case "assigned":
      return { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" };
    case "picked_up":
      return { bg: "#ede9fe", border: "#ddd6fe", text: "#6d28d9" };
    case "delivered":
      return { bg: "#ecfdf3", border: "#bbf7d0", text: "#15803d" };
    default:
      return { bg: "#f8fafc", border: "#e2e8f0", text: "#475569" };
  }
};

export default function DriverDashboardScreen() {
  const router = useRouter();
  const { setTabBarVisible } = useRoleShell();
  const user = useAuthStore((state) => state.user);
  const notificationCounts = useNotificationStore((state) => state.counts);
  const fetchNotificationCounts = useNotificationStore((state) => state.fetchCounts);
  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  const [isOnline, setIsOnline] = useState(false);
  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [issueCount, setIssueCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setError(null);

    try {
      const [deliveryRows, issues] = await Promise.all([
        deliveryService.getMyDeliveries(),
        driverIssueService.getMyReports(20),
        fetchNotificationCounts(),
      ]);

      setDeliveries(deliveryRows);
      setIssueCount(Array.isArray(issues) ? issues.length : 0);
    } catch (loadError: any) {
      setDeliveries([]);
      setIssueCount(0);
      setError(loadError?.response?.data?.message || "Failed to load dashboard data.");
    }
  }, [fetchNotificationCounts]);

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      await loadDashboard();
      setIsLoading(false);
    };

    void bootstrap();
  }, [loadDashboard]);

  const activeDeliveries = deliveries.filter(
    (delivery) =>
      !["delivered", "failed", "cancelled"].includes(delivery.status),
  );
  const activeRoute = activeDeliveries[0];
  const completedToday = deliveries.filter((delivery) => delivery.status === "delivered").length;

  const unreadNotifications = useMemo(
    () => notificationCounts.unread,
    [notificationCounts.unread],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  const handleOpenMaps = () => {
    if (!activeRoute) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      activeRoute.destination,
    )}`;

    Linking.openURL(url);
  };

  return (
    <ScreenWrapper title="Driver Dashboard" subtitle={user?.business_name || "Driver workspace"}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.statusText}>
              You are {isOnline ? "Online" : "Offline"}
            </Text>
            <Switch value={isOnline} onValueChange={setIsOnline} />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Active Routes" value={activeDeliveries.length} />
          <StatCard label="Completed Today" value={completedToday} />
          <StatCard label="Unread Alerts" value={unreadNotifications} />
          <StatCard label="Issue Reports" value={issueCount} />
        </View>

        <Pressable style={styles.mapsButton} onPress={handleOpenMaps}>
          <Ionicons name="map" size={20} color="#fff" />
          <Text style={styles.mapsText}>Open in Maps</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionRow}>
            {ACTIONS.map((action) => (
              <Pressable
                key={action.route}
                style={styles.actionChip}
                onPress={() => router.push(action.route as never)}
              >
                <Ionicons name={action.icon as any} size={16} color="#1d4ed8" />
                <Text style={styles.actionText}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {isLoading ? (
          <View style={styles.card}>
            <ActivityIndicator size="small" color="#1d4ed8" />
            <Text style={styles.subtitle}>Loading active assignments...</Text>
          </View>
        ) : activeRoute ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Current Delivery</Text>

            <Text style={styles.subtitle}>{activeRoute.orderCode}</Text>

            <Text style={styles.meta}>Pickup: {activeRoute.pickupPoint}</Text>
            <Text style={styles.meta}>Dropoff: {activeRoute.destination}</Text>

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

            <View style={styles.rowBetween}>
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
                  style={{
                    color: getStatusStyle(activeRoute.status).text,
                    fontWeight: "600",
                  }}
                >
                  {formatStatus(activeRoute.status)}
                </Text>
              </View>

              <Pressable
                style={styles.acceptButton}
                onPress={() => router.push(`/driver/deliveries/${activeRoute.id}` as never)}
              >
                <Text style={styles.buttonText}>Open</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>No active route</Text>
            <Text style={styles.subtitle}>Waiting for assignment...</Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const ACTIONS = [
  { label: "Notifications", route: "/driver/notifications", icon: "notifications-outline" },
  { label: "Messages", route: "/driver/messages", icon: "chatbubble-ellipses-outline" },
  { label: "Deliveries", route: "/driver/deliveries", icon: "car-outline" },
  { label: "Issues", route: "/driver/issues", icon: "alert-circle-outline" },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  contentContainer: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: { fontSize: 16, fontWeight: "600" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
  },
  statLabel: { fontSize: 12, color: "#6b7280" },
  statValue: { fontSize: 18, fontWeight: "700" },
  mapsButton: {
    backgroundColor: "#1f2937",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  mapsText: { color: "#fff", marginLeft: 6 },
  errorBox: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
  },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0edff",
    padding: 8,
    borderRadius: 8,
  },
  actionText: { marginLeft: 6 },
  subtitle: { color: "#6b7280", marginBottom: 8 },
  meta: { fontSize: 13, marginBottom: 4 },
  progressTrack: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginVertical: 10,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  progressLabel: { fontSize: 12, marginBottom: 10 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  acceptButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
