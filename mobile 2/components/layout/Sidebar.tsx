import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../../contexts/AuthContext";
import { roleNavigation, supportNavigation } from "../../constants/navigation";
import { NavigationItem } from "../../types";

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [activeRoute, setActiveRoute] = useState("dashboard");

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navigationItems = roleNavigation[user.role]?.main || [];

  const handleNavigation = (href: string) => {
    setActiveRoute(href);
    // Navigate to the route
    // You can use router.push(`/${user.role}/${href}`)
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const renderNavItem = (item: NavigationItem) => {
    const isActive = activeRoute === item.href;

    return (
      <TouchableOpacity
        key={item.href}
        style={[styles.navItem, isActive && styles.activeNavItem]}
        onPress={() => handleNavigation(item.href)}
      >
        <View style={styles.navItemContent}>
          <Icon
            name={item.icon}
            size={20}
            color={isActive ? "#2563eb" : "#666"}
          />
          <Text style={[styles.navText, isActive && styles.activeNavText]}>
            {item.name}
          </Text>
        </View>
        {item.badge && (
          <View
            style={[
              styles.badge,
              item.badge === "Low Stock" && styles.warningBadge,
              item.badge === "New" && styles.successBadge,
            ]}
          >
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>TB</Text>
          </View>
          <Text style={styles.logoName}>TradeBridge</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* User Profile */}
      <TouchableOpacity style={styles.profileSection}>
        <View style={styles.profileAvatar}>
          {user.profile_image ? (
            <Image
              source={{ uri: user.profile_image }}
              style={styles.profileImage}
            />
          ) : (
            <Text style={styles.profileInitials}>
              {getInitials(user.full_name)}
            </Text>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.full_name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
        <Icon name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      {/* Role Badge */}
      <View style={styles.roleBadge}>
        <Icon name="badge-account" size={16} color="#2563eb" />
        <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
        {user.verified && (
          <View style={styles.verifiedBadge}>
            <Icon name="check-circle" size={14} color="#10b981" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.navContainer}>
        {/* Main Navigation */}
        <View style={styles.navSection}>
          {navigationItems.map(renderNavItem)}
        </View>

        {/* Support Navigation */}
        <View style={styles.navSection}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          {supportNavigation.map(renderNavItem)}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <View style={styles.footerInfo}>
          <Text style={styles.copyright}>© 2026 TradeBridge</Text>
          <Text style={styles.version}>v2.0</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  logoName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  closeButton: {
    padding: 4,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileInitials: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  profileEmail: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
    marginLeft: 6,
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    color: "#10b981",
    marginLeft: 2,
  },
  navContainer: {
    flex: 1,
  },
  navSection: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeNavItem: {
    backgroundColor: "#e8f0fe",
  },
  navItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  navText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
  },
  activeNavText: {
    color: "#2563eb",
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#e5e5e5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  warningBadge: {
    backgroundColor: "#fff3cd",
  },
  successBadge: {
    backgroundColor: "#d4edda",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#666",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 14,
    color: "#ef4444",
    marginLeft: 12,
  },
  footerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  copyright: {
    fontSize: 10,
    color: "#999",
  },
  version: {
    fontSize: 10,
    color: "#999",
  },
});

export default Sidebar;
