import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getInitials } from "@/utils/format";

interface DashboardTopBarProps {
  greeting: string;
  title: string;
  businessLabel?: string;
  verified?: boolean;
  onNotificationsPress?: () => void;
  onCartPress?: () => void;
  notificationCount?: number;
}

export default function DashboardTopBar({
  greeting,
  title,
  businessLabel,
  verified,
  onNotificationsPress,
  onCartPress,
  notificationCount = 0,
}: DashboardTopBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(title)}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.greeting}>{greeting}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {verified ? (
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark-outline" size={12} color="#166534" />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
            ) : null}
          </View>
          {businessLabel ? <Text style={styles.businessLabel}>{businessLabel}</Text> : null}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.iconButton} onPress={onNotificationsPress}>
          <Ionicons name="notifications-outline" size={20} color="#0f172a" />
          {notificationCount > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{notificationCount > 9 ? "9+" : notificationCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable style={styles.iconButton} onPress={onCartPress}>
          <Ionicons name="cart-outline" size={20} color="#0f172a" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  greeting: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  businessLabel: {
    fontSize: 12,
    color: "#475569",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    alignItems: "center",
    justifyContent: "center",
  },
  countBadge: {
    position: "absolute",
    top: 5,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  countText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
  },
});
