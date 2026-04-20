import React, { useState } from "react";
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

  const handleMessage = () => {
    Alert.alert("Message", "Open chat with customer");
  };

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDelivery.dropoff)}`;
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
      >
        {/* Top Section */}
        <View style={styles.topSection}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              You are {isOnline ? "Online" : "Offline"}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isOnline ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
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

        {/* Navigation */}
        <View style={styles.navigationSection}>
          <Pressable style={styles.mapsButton} onPress={handleOpenMaps}>
            <Ionicons name="map" size={24} color="#ffffff" />
            <Text style={styles.mapsButtonText}>Open in Maps</Text>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
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
                  <Text style={styles.buttonText}>Accept</Text>
                </Pressable>
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
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    padding: 16,
  },
  topSection: {
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  mainSection: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
  },
  arrowContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusBadge: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: "#10b981",
  },
  secondaryButton: {
    backgroundColor: "#3b82f6",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  acceptButton: {
    backgroundColor: "#10b981",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  navigationSection: {
    marginBottom: 20,
  },
  mapsButton: {
    backgroundColor: "#1f2937",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapsButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  quickActionButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    fontWeight: "500",
  },
  secondarySection: {
    marginBottom: 20,
  },
  bottomSection: {
    marginTop: 20,
  },
  summaryContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
});
