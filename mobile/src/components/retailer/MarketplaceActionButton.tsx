import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Variant = "primary" | "secondary" | "icon";

interface MarketplaceActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  variant?: Variant;
  active?: boolean;
  badge?: string | number;
  onPress: () => void;
}

function MarketplaceActionButton({
  icon,
  label,
  variant = "secondary",
  active = false,
  badge,
  onPress,
}: MarketplaceActionButtonProps) {
  const isIconOnly = variant === "icon";

  return (
    <Pressable
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        isIconOnly && styles.iconOnly,
        active && styles.active,
      ]}
      onPress={onPress}
    >
      <View style={styles.iconWrap}>
        <Ionicons
          name={icon}
          size={16}
          color={variant === "primary" ? "#ffffff" : active ? "#1d4ed8" : "#334155"}
        />
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {label ? (
        <Text
          style={[
            styles.label,
            variant === "primary" && styles.primaryLabel,
            active && variant !== "primary" && styles.activeLabel,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default memo(MarketplaceActionButton);

const styles = StyleSheet.create({
  base: {
    minHeight: 42,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  primary: {
    backgroundColor: "#1d4ed8",
  },
  secondary: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  iconOnly: {
    width: 42,
    paddingHorizontal: 0,
  },
  active: {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
  },
  iconWrap: {
    position: "relative",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  primaryLabel: {
    color: "#ffffff",
  },
  activeLabel: {
    color: "#1d4ed8",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#dc2626",
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
});
