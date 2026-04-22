import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { useAuthStore } from "@/features/auth/auth.store";
import { useNotificationStore } from "@/features/notifications/notification.store";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

import {
  ACTIVE_DELIVERIES,
  DELIVERY_HISTORY,
  DRIVER_DELIVERIES,
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
  const { setTabBarVisible } = useRoleShell();
  const user = useAuthStore((state) => state.user);
  const notificationCounts = useNotificationStore((state) => state.counts);
  const fetchNotificationCounts = useNotificationStore((state) => state.fetchCounts);
  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    void fetchNotificationCounts();
  }, [fetchNotificationCounts]);

  const activeDeliveries = ACTIVE_DELIVERIES;
  const activeRoute = ACTIVE_DELIVERIES[0];
  const completedToday = DELIVERY_HISTORY.length;

  const unreadNotifications = useMemo(
    () => notificationCounts.unread,
    [notificationCounts.unread],
  );

  const handleOpenMaps = () => {
    if (!activeRoute) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      activeRoute.destination,
    )}`;

    Linking.openURL(url);
  };

  const handleAction = (action: string) => {
    Alert.alert("Action", `${action} pressed`);
  };

  return (
    <ScreenWrapper title="Driver Dashboard">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
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
          <StatCard label="Total Orders" value={DRIVER_DELIVERIES.length} />
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

        {activeRoute ? (
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
                onPress={() => handleAction("Accept")}
              >
                <Text style={styles.buttonText}>Accept</Text>
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
