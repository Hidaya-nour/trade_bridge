import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useAuthStore } from "@/features/auth/auth.store";
import { getInitials } from "@/utils/format";
import { getRoleRoute } from "@/config/roleConfig";
import { colors } from "@/config/colors";
import {
  roleDefaultRoute,
  roleSidebarNavigation,
  type SidebarNavItem,
} from "./roleNavigation";

interface DrawerContentProps {
  currentPath: string;
  onClose: () => void;
}

export default function DrawerContent({
  currentPath,
  onClose,
}: DrawerContentProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user) {
    return null;
  }

  const navItems = roleSidebarNavigation[user.role] || [];

  // Group items by section
  const groupedNavItems = navItems.reduce((acc, item) => {
    const section = item.section || "DEFAULT";

    if (!acc[section]) {
      acc[section] = [];
    }

    acc[section].push(item);

    return acc;
  }, {} as Record<string, SidebarNavItem[]>);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerTop}>
        <Text style={styles.drawerTitle}>Account</Text>

        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons
            name="close-outline"
            size={22}
            color={colors.foreground}
          />
        </Pressable>
      </View>

      {/* Profile Card */}
      <Pressable
        style={styles.profileCard}
        onPress={() => {
          router.push(getRoleRoute(user.role, "profile") as never);
          onClose();
        }}
      >
        <View style={styles.avatarWrapper}>
          {user.profile_image ? (
            <Image
              source={{ uri: user.profile_image }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {getInitials(user.full_name)}
              </Text>
            </View>
          )}

          {/* Online Indicator */}
          <View style={styles.onlineIndicator} />
        </View>

        <View style={styles.profileInfo}>
          <Text numberOfLines={1} style={styles.name}>
            {user.full_name}
          </Text>

          <Text numberOfLines={1} style={styles.subtitle}>
            {user.business_name || user.email}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {user.role.toUpperCase()}
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward-outline"
          size={18}
          color={colors.foregroundMuted}
        />
      </Pressable>

      {/* Navigation */}
      <ScrollView contentContainerStyle={styles.list}>
        {Object.entries(groupedNavItems).map(([section, items]) => (
          <View key={section} style={styles.sectionGroup}>
            {section !== "DEFAULT" && (
              <Text style={styles.sectionHeader}>{section}</Text>
            )}

            {items.map((item) => {
              const isActive = currentPath.startsWith(item.href);

              return (
                <Pressable
                  key={item.href}
                  style={[
                    styles.navItem,
                    isActive && styles.navItemActive,
                  ]}
                  onPress={() => {
                    router.push(item.href as never);
                    onClose();
                  }}
                >
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={
                      isActive
                        ? colors.primary
                        : colors.foregroundMuted
                    }
                  />

                  <Text
                    style={[
                      styles.navLabel,
                      isActive && styles.navLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Logout */}
      <Pressable
        style={styles.logoutButton}
        onPress={async () => {
          await logout();
          router.replace("/login");
          onClose();
        }}
      >
        <Ionicons
          name="log-out-outline"
          size={18}
          color={colors.error}
        />

        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      {/* Home */}
      <Pressable
        style={styles.homeButton}
        onPress={() => {
          router.push(roleDefaultRoute[user.role] as never);
          onClose();
        }}
      >
        <Ionicons
          name="home-outline"
          size={18}
          color={colors.foreground}
        />

        <Text style={styles.homeText}>Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 288,
    height: "100%",
    backgroundColor: colors.backgroundCard,
    paddingTop: 14,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  drawerTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.foregroundMuted,
    textTransform: "uppercase",
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Profile Card */
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  avatarWrapper: {
    position: "relative",
  },

  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: colors.avatarBg,
  },

  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: colors.avatarBg,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.avatarText,
  },

  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: colors.backgroundCard,
  },

  profileInfo: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.foreground,
  },

  subtitle: {
    fontSize: 12,
    color: colors.foregroundMuted,
    marginTop: 3,
  },

  roleBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  roleBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
  },

  /* Navigation */
  list: {
    gap: 8,
    paddingBottom: 12,
  },

  sectionGroup: {
    marginBottom: 8,
  },

  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.foregroundLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 12,
    marginTop: 8,
  },

  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 2,
  },

  navItemActive: {
    backgroundColor: colors.primaryLight,
  },

  navLabel: {
    fontSize: 14,
    color: colors.foregroundMuted,
    fontWeight: "500",
  },

  navLabelActive: {
    color: colors.primary,
    fontWeight: "600",
  },

  /* Footer Buttons */
  logoutButton: {
    marginTop: "auto",
    borderWidth: 1,
    borderColor: colors.errorLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logoutText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: "700",
  },

  homeButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.foreground,
    fontWeight: "700",
  },
});