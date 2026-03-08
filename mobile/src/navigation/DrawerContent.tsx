import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../stores/auth.store";
import { roleDefaultRoute, roleSidebarNavigation } from "./roleNavigation";

interface DrawerContentProps {
  currentPath: string;
  onClose: () => void;
}

export default function DrawerContent({ currentPath, onClose }: DrawerContentProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user) {
    return null;
  }

  const navItems = roleSidebarNavigation[user.role] || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.role}>{user.role.toUpperCase()}</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-outline" size={22} color="#0f172a" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {navItems.map((item) => {
          const isActive = currentPath.startsWith(item.href);

          return (
            <Pressable
              key={item.href}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => {
                router.push(item.href as never);
                onClose();
              }}
            >
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={isActive ? "#1d4ed8" : "#334155"}
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
          router.push(roleDefaultRoute[user.role] as never);
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
    width: 288,
    height: "100%",
    backgroundColor: "#ffffff",
    paddingTop: 14,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  role: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    gap: 6,
    paddingBottom: 12,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  navItemActive: {
    backgroundColor: "#eff6ff",
  },
  navLabel: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  navLabelActive: {
    color: "#1d4ed8",
  },
  logoutButton: {
    marginTop: "auto",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  homeText: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "700",
  },
});