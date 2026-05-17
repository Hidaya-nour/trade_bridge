import { PropsWithChildren, useMemo, useState } from "react";
import { Modal, Pressable, SafeAreaView, StyleSheet, View } from "react-native";
import { usePathname } from "expo-router";

import DrawerContent from "../../navigation/DrawerContent";
import { getRouteTitle } from "../../navigation/roleNavigation";
import { useRoleShell } from "../../navigation/RoleShellContext";
import MobileHeader from "@/navigation/MobileHeader";

interface ScreenWrapperProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
}

export default function ScreenWrapper({
  children,
  title,
  subtitle,
}: ScreenWrapperProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { openDrawer, tabBarInset, hasRoleShell } = useRoleShell();

  const resolvedTitle = useMemo(() => {
    return title || getRouteTitle(pathname);
  }, [pathname, title]);

  const handleMenuPress = () => {
    if (hasRoleShell) openDrawer();
    else setIsDrawerOpen(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <MobileHeader
        title={resolvedTitle}
        subtitle={subtitle}
        onMenuPress={handleMenuPress}
      />

      <View
        style={[
          styles.content,
          tabBarInset > 0 && { paddingBottom: tabBarInset },
        ]}
      >
        {children}
      </View>

      {!hasRoleShell && (
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
            <Pressable
              style={styles.overlay}
              onPress={() => setIsDrawerOpen(false)}
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f5f9",
  },
  content: {
    flex: 1,
  },
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