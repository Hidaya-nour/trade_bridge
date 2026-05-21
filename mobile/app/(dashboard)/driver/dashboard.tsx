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
import driverIssueService from "@/features/driver-issues/driver-issue.service";
import { useRoleShell } from "@/navigation/RoleShellContext";

// ================= STATUS =================

const statusColors = {
  pending: "#f59e0b",
  assigned: "#3b82f6",
  picked_up: "#8b5cf6",
  delivered: "#22c55e",
  failed: "#ef4444",
  cancelled: "#6b7280",
};

// ================= MAIN =================

export default function DriverDashboardScreen() {
  const router = useRouter();
  const { setTabBarVisible } = useRoleShell();

  const user = useAuthStore((s) => s.user);
  const { counts } = useNotificationStore();

  const [isOnline, setIsOnline] = useState(false);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ================= LOAD =================

  const load = useCallback(async () => {
    try {
      const rows = await deliveryService.getMyDeliveries();
      const issues = await driverIssueService.getMyReports(20);

      setDeliveries(rows || []);
    } catch (e) {
      setDeliveries([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  // ================= DERIVED (WEB MATCHED) =================

  const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];

  const activeDeliveries = safeDeliveries.filter(
    (d) => !["delivered", "failed", "cancelled"].includes(d.status),
  );

  const completed = safeDeliveries.filter((d) => d.status === "delivered");

  const pending = safeDeliveries.filter((d) => d.status === "pending");

  const activeRoute = activeDeliveries[0];

  const vehicleLabel =
    activeRoute?.vehicleType || "Vehicle not assigned";
  const plateLabel =
    activeRoute?.licensePlate || "Plate not assigned";

  const stats = {
    total: deliveries.length,
    today: completed.length,
    pending: pending.length,
    unread: counts?.unread ?? 0,
  };

  // ================= MAP =================

  const openMaps = () => {
    if (!activeRoute) return;

    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        activeRoute.dropoffLocation || "",
      )}`,
    );
  };

  // ================= UI =================

  return (
    <ScreenWrapper
      title="Driver Dashboard"
      subtitle={user?.business_name || "Driver workspace"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
      >
        {/* ONLINE STATUS (web equivalent missing piece) */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>
              You are {isOnline ? "Online" : "Offline"}
            </Text>
            <Switch value={isOnline} onValueChange={setIsOnline} />
          </View>
        </View>

        {/* ================= STATS (MATCH WEB) ================= */}
        <Text style={styles.sectionTitle}>Overview</Text>

        <View style={styles.statsGrid}>
          <Stat label="Total Deliveries" value={stats.total} />
          <Stat label="Completed Today" value={stats.today} />
          <Stat label="Pending" value={stats.pending} />
          <Stat label="Unread Alerts" value={stats.unread} />
        </View>

        {/* ================= VEHICLE INFO (WEB MATCH) ================= */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vehicle Info</Text>

          <Text style={styles.meta}>Vehicle: {vehicleLabel}</Text>
          <Text style={styles.meta}>Plate: {plateLabel}</Text>
        </View>

        {/* ================= MAP ACTION ================= */}
        <Pressable style={styles.mapBtn} onPress={openMaps}>
          <Ionicons name="navigate" size={18} color="#fff" />
          <Text style={styles.mapText}>Open Navigation</Text>
        </Pressable>

        {/* ================= ACTIVE DELIVERY (WEB MATCH STRUCTURE) ================= */}
        <Text style={styles.sectionTitle}>Active Delivery</Text>

        {loading ? (
          <ActivityIndicator />
        ) : activeRoute ? (
          <View style={styles.card}>
            {/* HEADER */}
            <View style={styles.rowBetween}>
              <Text style={styles.subtitle}>
                #{activeRoute.orderNumber || activeRoute.id}
              </Text>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      statusColors[activeRoute.status] + "20",
                  },
                ]}
              >
                <Text
                  style={{
                    color: statusColors[activeRoute.status],
                    fontWeight: "700",
                  }}
                >
                  {activeRoute.status}
                </Text>
              </View>
            </View>

            {/* PICKUP */}
            <Text style={styles.meta}>
              Pickup: {activeRoute.pickupLocation}
            </Text>

            {/* DROPOFF */}
            <Text style={styles.meta}>
              Dropoff: {activeRoute.dropoffLocation}
            </Text>

            {/* ITEMS (WEB MATCH) */}
            <View style={{ marginTop: 10 }}>
              {activeRoute.items?.map((i: any, idx: number) => (
                <Text key={idx} style={styles.small}>
                  • {i.name} ({i.quantity} {i.unit})
                </Text>
              ))}
            </View>

            {/* ACTIONS */}
            <View style={styles.rowBetween}>
              <Pressable
                style={styles.primaryBtn}
                onPress={() =>
                  router.push(
                    `/driver/deliveries/${activeRoute.id}` as never,
                  )
                }
              >
                <Text style={styles.btnText}>Open</Text>
              </Pressable>

            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text>No active deliveries</Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

// ================= STAT COMPONENT =================

const Stat = ({ label, value }: any) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

// ================= STYLES =================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: { fontSize: 16, fontWeight: "600" },
  subtitle: { color: "#64748b" },
  meta: { fontSize: 13, marginTop: 4 },
  small: { fontSize: 12, color: "#475569" },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  statLabel: { fontSize: 12, color: "#64748b" },
  statValue: { fontSize: 18, fontWeight: "700" },

  mapBtn: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  mapText: { color: "#fff", fontWeight: "600" },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  primaryBtn: {
    backgroundColor: "#1d4ed8",
    padding: 10,
    borderRadius: 10,
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    padding: 10,
    borderRadius: 10,
  },

  btnText: { color: "#fff", fontWeight: "600" },
});