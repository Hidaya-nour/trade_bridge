import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onMenuPress?: () => void;
}

export default function AppHeader({ title, subtitle, onMenuPress }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftGroup}>
        {onMenuPress ? (
          <Pressable onPress={onMenuPress} style={styles.menuButton} hitSlop={8}>
            <Ionicons name="menu-outline" size={22} color="#0f172a" />
          </Pressable>
        ) : null}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.brandBadge}>
        <Text style={styles.brandText}>TB</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});