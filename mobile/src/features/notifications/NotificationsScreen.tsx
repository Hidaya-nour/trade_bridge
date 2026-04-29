import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { getRoleRoute, roleConfig } from "@/config/roleConfig";
import type { UserRole } from "@/features/auth/auth.types";
import { useNotificationStore } from "@/features/notifications/notification.store";
import type { Notification } from "@/features/notifications/notification.types";
import { formatRelativeTime } from "@/utils/format";

interface NotificationsScreenProps {
  role: UserRole;
}

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Orders", value: "order" },
  { label: "Delivery", value: "delivery" },
  { label: "Messages", value: "message" },
];

const resolveNotificationTarget = (role: UserRole, type: string) => {
  if (type === "message" || type === "message_received") {
    return getRoleRoute(role, "messages");
  }

  if (
    [
      "delivery",
      "delivery_assigned",
      "order",
      "order_created",
      "order_confirmed",
      "order_processing",
      "order_shipped",
    ].includes(type)
  ) {
    if (role === "driver") return getRoleRoute(role, "deliveries");
    if (role === "retailer") return getRoleRoute(role, "orders");
    return getRoleRoute(role, "dashboard");
  }

  if (type === "dispute" || type === "alert" || type === "error") {
    if (role === "driver") return getRoleRoute(role, "issues");
    return getRoleRoute(role, "support");
  }

  return getRoleRoute(role, "notifications");
};

export function NotificationsScreen({ role }: NotificationsScreenProps) {
  const router = useRouter();
  const config = roleConfig[role];
  const [activeFilter, setActiveFilter] = useState("all");
  const {
    notifications,
    counts,
    isLoading,
    isRefreshing,
    error,
    fetchNotifications,
    fetchCounts,
    markAsRead,
    markAllRead,
    clearAll,
    deleteNotification,
    setFilters,
  } = useNotificationStore();

  useEffect(() => {
    void fetchNotifications();
    void fetchCounts();

    const interval = setInterval(() => {
      void fetchNotifications();
      void fetchCounts();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCounts, fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") return notifications.filter((item) => !item.is_read);
    return notifications.filter((item) => item.type === activeFilter);
  }, [activeFilter, notifications]);

  const openNotification = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    router.push(resolveNotificationTarget(role, notification.type) as never);
  };

  return (
    <ScreenWrapper title="Notifications" subtitle={config.notificationsDescription}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void fetchNotifications();
              void fetchCounts();
            }}
          />
        }
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryTitle}>{counts.unread} unread updates</Text>
              <Text style={styles.summaryText}>
                Shared notification logic is active for the {config.label.toLowerCase()} role.
              </Text>
            </View>
            <View style={styles.summaryActions}>
              <Pressable
                style={[styles.ghostButton, counts.unread === 0 && styles.buttonDisabled]}
                disabled={counts.unread === 0}
                onPress={() => void markAllRead()}
              >
                <Text style={styles.ghostButtonText}>Mark all read</Text>
              </Pressable>
              <Pressable
                style={[styles.ghostButton, notifications.length === 0 && styles.buttonDisabled]}
                disabled={notifications.length === 0}
                onPress={() => void clearAll()}
              >
                <Text style={styles.ghostButtonText}>Clear all</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filterOptions.map((option) => (
            <Pressable
              key={option.value}
              style={[styles.filterChip, activeFilter === option.value && styles.filterChipActive]}
              onPress={() => {
                setActiveFilter(option.value);
                setFilters({
                  type: option.value === "all" || option.value === "unread" ? undefined : option.value,
                  is_read: option.value === "unread" ? 0 : undefined,
                });
              }}
            >
              <Text
                style={[styles.filterChipText, activeFilter === option.value && styles.filterChipTextActive]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.listContent}>
          {isLoading && notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.emptyTitle}>Loading notifications</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={28} color="#dc2626" />
              <Text style={styles.emptyTitle}>Could not load notifications</Text>
              <Text style={styles.emptyText}>{error}</Text>
            </View>
          ) : filteredNotifications.length ? (
            filteredNotifications.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.card, !item.is_read && styles.cardUnread]}
                onPress={() => void openNotification(item)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {!item.is_read ? <View style={styles.newDot} /> : null}
                  </View>
                  <Text style={styles.cardTime}>{formatRelativeTime(item.created_at)}</Text>
                </View>
                <Text style={styles.cardBody}>{item.message}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{item.type}</Text>
                  </View>
                  <Pressable onPress={() => void deleteNotification(item.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={28} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyText}>
                When the platform has updates for your role, they will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
  },
  summaryHeader: {
    gap: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  summaryText: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 19,
  },
  summaryActions: {
    flexDirection: "row",
    gap: 10,
  },
  ghostButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  ghostButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 2,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterChipActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  listContent: { gap: 10, paddingBottom: 28 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 10,
  },
  cardUnread: {
    borderColor: "#bfdbfe",
    backgroundColor: "#f8fbff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
  },
  cardTime: {
    fontSize: 11,
    color: "#64748b",
  },
  cardBody: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeBadge: {
    borderRadius: 999,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1d4ed8",
    textTransform: "capitalize",
  },
  deleteText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#dc2626",
  },
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 22,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  emptyText: {
    marginTop: 6,
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
    lineHeight: 19,
  },
});
