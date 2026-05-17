import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";

import { useRoleShell } from "./RoleShellContext";
import { getRouteTitle } from "./roleNavigation";
import { useNotificationStore } from "@/features/notifications/notification.store";
import { useAuthStore } from "@/features/auth/auth.store";

export default function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const { openDrawer } = useRoleShell();
  const { counts } = useNotificationStore();
  const { user } = useAuthStore();

  const unread = counts?.unread ?? 0;

  return (
    <View style={styles.container}>
      {/* MENU */}
      <Pressable
        onPress={openDrawer}
        style={styles.iconButton}
        android_ripple={{ color: "#e2e8f0", borderless: true }}
      >
        <Ionicons name="menu-outline" size={24} color="#0f172a" />
      </Pressable>

      {/* TITLE */}
      <Text numberOfLines={1} style={styles.title}>
        {getRouteTitle(pathname)}
      </Text>

      {/* RIGHT ACTIONS */}
      <View style={styles.rightSection}>
        {/* NOTIFICATIONS */}
        <Pressable
          onPress={() => router.push(`/${user?.role}/notifications`)}
          style={styles.iconButton}
          android_ripple={{ color: "#e2e8f0", borderless: true }}
        >
          <Ionicons name="notifications-outline" size={22} color="#0f172a" />

          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unread > 9 ? "9+" : unread}
              </Text>
            </View>
          )}
        </Pressable>

        {/* PROFILE */}
        <Pressable
          onPress={() => router.push(`/${user?.role}/profile`)}
          style={styles.iconButton}
          android_ripple={{ color: "#e2e8f0", borderless: true }}
        >
          <Ionicons name="person-circle-outline" size={26} color="#0f172a" />
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
});