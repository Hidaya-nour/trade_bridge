import { PropsWithChildren, useMemo, useState } from "react";
import { Modal, Pressable, SafeAreaView, StyleSheet, View } from "react-native";
import { usePathname } from "expo-router";
import AppHeader from "./AppHeader";
import DrawerContent from "../../navigation/DrawerContent";
import { getRouteTitle } from "../../navigation/roleNavigation";
import { useRoleShell } from "../../navigation/RoleShellContext";

interface ScreenWrapperProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
}

export default function ScreenWrapper({ children, title, subtitle }: ScreenWrapperProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { openDrawer, tabBarInset, hasRoleShell } = useRoleShell();

  const resolvedTitle = useMemo(() => {
    return title || getRouteTitle(pathname);
  }, [pathname, title]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title={resolvedTitle}
        subtitle={subtitle}
        onMenuPress={hasRoleShell ? openDrawer : () => setIsDrawerOpen(true)}
      />

      <View style={[styles.content, tabBarInset > 0 && { paddingBottom: tabBarInset }]}>
        {children}
      </View>

      {!hasRoleShell ? (
        <Modal
          animationType="slide"
          transparent
          visible={isDrawerOpen}
          onRequestClose={() => setIsDrawerOpen(false)}
        >
          <View style={styles.modalRoot}>
            <DrawerContent currentPath={pathname} onClose={() => setIsDrawerOpen(false)} />
            <Pressable style={styles.overlay} onPress={() => setIsDrawerOpen(false)} />
          </View>
        </Modal>
      ) : null}
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
