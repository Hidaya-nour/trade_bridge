import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/features/auth/auth.store";
import type { RoleNavigationItem } from "./navigationConfig";

interface RoleDrawerProps {
  title: string;
  currentPath: string;
  items: RoleNavigationItem[];
  onClose: () => void;
  homeHref: string;
}

export default function RoleDrawer({
  title,
  currentPath,
  items,
  onClose,
  homeHref,
}: RoleDrawerProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.role}>{title}</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-outline" size={22} color="#0f172a" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {items.map((item) => {
          const isActive = currentPath.startsWith(item.href);

          return (
            <Pressable
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => {
                router.push(item.href as never);
                onClose();
              }}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={isActive ? "#1d4ed8" : "#475569"}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        style={styles.logoutButton}
        onPress={async () => {
          await logout();
          router.replace("/login");
          onClose();
        }}
      >
        <Ionicons name="log-out-outline" size={18} color="#b91c1c" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      <Pressable
        style={styles.homeButton}
        onPress={() => {
          router.push(homeHref as never);
          onClose();
        }}
      >
        <Ionicons name="home-outline" size={18} color="#0f172a" />
        <Text style={styles.homeText}>Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: "100%",
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerText: {
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  role: {
    fontSize: 12,
    color: "#64748b",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    gap: 8,
    paddingBottom: 12,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  navItemActive: {
    backgroundColor: "#eff6ff",
  },
  navLabel: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  navLabelActive: {
    color: "#1d4ed8",
    fontWeight: "800",
  },
  logoutButton: {
    marginTop: "auto",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoutText: {
    fontSize: 13,
    color: "#b91c1c",
    fontWeight: "700",
  },
  homeButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  homeText: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "700",
  },
});
