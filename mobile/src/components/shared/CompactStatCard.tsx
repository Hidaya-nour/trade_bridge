import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface CompactStatCardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export default function CompactStatCard({
  label,
  value,
  subtitle,
  icon,
  onPress,
}: CompactStatCardProps) {
  const content = (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={16} color="#1d4ed8" />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

const styles = StyleSheet.create({
  card: {
    width: 138,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    padding: 14,
    gap: 8,
  },
  topRow: {
    gap: 8,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "700",
  },
  value: {
    fontSize: 22,
    color: "#0f172a",
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 16,
  },
});
