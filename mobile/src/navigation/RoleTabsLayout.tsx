import { Tabs, usePathname } from "expo-router";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import type { UserRole } from "@/features/auth/auth.types";
import { RoleShellProvider } from "./RoleShellContext";
import { roleNavigationConfig } from "./navigationConfig";
import AnimatedBottomTabBar, { TAB_BAR_BASE_HEIGHT } from "./AnimatedBottomTabBar";
import RoleDrawer from "./RoleDrawer";
import { roleDefaultRoute } from "./roleNavigation";

interface RoleTabsLayoutProps {
  role: UserRole;
}

export default function RoleTabsLayout({ role }: RoleTabsLayoutProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const config = roleNavigationConfig[role];

  useEffect(() => {
    setIsTabBarVisible(true);
  }, [pathname]);

  const providerValue = useMemo(
    () => ({
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
      setTabBarVisible: (visible: boolean) => setIsTabBarVisible(visible),
      tabBarInset: TAB_BAR_BASE_HEIGHT + 34,
      hasRoleShell: true,
    }),
    [],
  );

  return (
    <RoleShellProvider value={providerValue}>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: "#f2f5f9" },
        }}
        tabBar={(props) => (
          <AnimatedBottomTabBar
            {...props}
            items={config.tabs}
            visible={isTabBarVisible}
          />
        )}
      >
        {config.tabs.map((item) => (
          <Tabs.Screen key={item.key} name={item.screen} options={{ title: item.label }} />
        ))}
        {config.hiddenScreens.map((screen) => (
          <Tabs.Screen key={screen} name={screen} options={{ href: null }} />
        ))}
      </Tabs>

      <Modal
        animationType="slide"
        transparent
        visible={isDrawerOpen}
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <View style={styles.modalRoot}>
          <RoleDrawer
            title={role.toUpperCase()}
            currentPath={pathname}
            items={config.drawer}
            onClose={() => setIsDrawerOpen(false)}
            homeHref={roleDefaultRoute[role]}
          />
          <Pressable style={styles.overlay} onPress={() => setIsDrawerOpen(false)} />
        </View>
      </Modal>
    </RoleShellProvider>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
});
