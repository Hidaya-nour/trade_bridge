  import { Tabs, usePathname } from "expo-router";
  import { useEffect, useMemo, useState } from "react";
  import type { UserRole } from "@/features/auth/auth.types";
  import { RoleShellProvider } from "./RoleShellContext";
  import { roleNavigationConfig } from "./navigationConfig";
  import AnimatedBottomTabBar, { TAB_BAR_BASE_HEIGHT } from "./AnimatedBottomTabBar";
  import DrawerContent from "./DrawerContent";
  import { Modal, Pressable, StyleSheet, View } from "react-native";
  import { SafeAreaView } from "react-native-safe-area-context";
  // import MobileHeader from "./MobileHeader";
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
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <RoleShellProvider value={providerValue}>
        {/* <MobileHeader /> */}
       <Tabs
  screenOptions={{
    headerShown: false,
    tabBarShowLabel: false,
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
          <DrawerContent
    currentPath={pathname}
    onClose={() => setIsDrawerOpen(false)}
  />
            <Pressable style={styles.overlay} onPress={() => setIsDrawerOpen(false)} />
          </View>
        </Modal>
      </RoleShellProvider>
    </SafeAreaView>
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
