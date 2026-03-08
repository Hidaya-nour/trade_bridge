import { PropsWithChildren, useMemo, useState } from "react";
import { Modal, Pressable, SafeAreaView, StyleSheet, View } from "react-native";
import { usePathname } from "expo-router";
import AppHeader from "./AppHeader";
import DrawerContent from "../../navigation/DrawerContent";
import { getRouteTitle } from "../../navigation/roleNavigation";

interface ScreenWrapperProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
}

export default function ScreenWrapper({ children, title, subtitle }: ScreenWrapperProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const resolvedTitle = useMemo(() => {
    return title || getRouteTitle(pathname);
  }, [pathname, title]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title={resolvedTitle}
        subtitle={subtitle}
        onMenuPress={() => setIsDrawerOpen(true)}
      />

      <View style={styles.content}>{children}</View>

      <Modal
        animationType="slide"
        transparent
        visible={isDrawerOpen}
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.overlay} onPress={() => setIsDrawerOpen(false)} />
          <DrawerContent currentPath={pathname} onClose={() => setIsDrawerOpen(false)} />
        </View>
      </Modal>
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
    justifyContent: "flex-end",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
});