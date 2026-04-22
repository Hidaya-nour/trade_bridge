import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import type { UserRole } from "@/features/auth/auth.types";
import { roleConfig } from "@/config/roleConfig";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

interface FeaturePlaceholderScreenProps {
  role: UserRole;
  title: string;
  subtitle: string;
  bullets: string[];
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function FeaturePlaceholderScreen({
  role,
  title,
  subtitle,
  bullets,
  icon = "construct-outline",
}: FeaturePlaceholderScreenProps) {
  const { setTabBarVisible } = useRoleShell();
  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  return (
    <ScreenWrapper title={title} subtitle={`${roleConfig[role].label} workspace`}>
      <ScrollView
        contentContainerStyle={styles.container}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={24} color="#1d4ed8" />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.list}>
            {bullets.map((item) => (
              <View key={item} style={styles.listRow}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#16a34a" />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 24,
    gap: 14,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 21,
  },
  list: {
    gap: 10,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  listText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
    lineHeight: 19,
  },
});
