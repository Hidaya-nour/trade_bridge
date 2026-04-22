import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RoleNavigationItem } from "./navigationConfig";

interface AnimatedBottomTabBarProps extends BottomTabBarProps {
  items: RoleNavigationItem[];
  visible: boolean;
}

export const TAB_BAR_BASE_HEIGHT = 68;

export default function AnimatedBottomTabBar({
  state,
  descriptors,
  navigation,
  items,
  visible,
}: AnimatedBottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : TAB_BAR_BASE_HEIGHT + insets.bottom + 20,
      duration: visible ? 160 : 220,
      useNativeDriver: true,
    }).start();
  }, [insets.bottom, translateY, visible]);

  const routesByName = useMemo(
    () => new Map(state.routes.map((route) => [route.name, route])),
    [state.routes],
  );

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.outer,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.inner}>
        {items.map((item) => {
          const route = routesByName.get(item.screen);
          if (!route) return null;

          const routeIndex = state.routes.findIndex((candidate) => candidate.key === route.key);
          const isFocused = state.index === routeIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const color = isFocused ? "#1d4ed8" : "#64748b";

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.item}
            >
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                <Ionicons name={item.icon} size={20} color={color} />
              </View>
              <Text style={[styles.label, isFocused && styles.labelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    backgroundColor: "transparent",
  },
  inner: {
    minHeight: TAB_BAR_BASE_HEIGHT,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ef",
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
  },
  iconWrap: {
    width: 38,
    height: 30,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "#eff6ff",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  labelActive: {
    color: "#1d4ed8",
    fontWeight: "800",
  },
});
