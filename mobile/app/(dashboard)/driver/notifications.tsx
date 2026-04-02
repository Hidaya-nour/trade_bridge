import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { NOTIFICATIONS } from "./driverData";

export default function DriverNotificationsScreen() {
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <ScreenWrapper
      title="Driver Notifications"
      subtitle="Assignment & order update alerts"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.badgeRow}>
          <Ionicons name="notifications-outline" size={18} color="#1d4ed8" />
          <Text style={styles.badgeText}>{unreadCount} unread alerts</Text>
        </View>

        {NOTIFICATIONS.map((item) => (
          <View
            key={item.id}
            style={[styles.card, item.unread && styles.cardActive]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
            <Text style={styles.cardBody}>{item.detail}</Text>
            {item.unread && <View style={styles.dot} />}
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, paddingBottom: 40 },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  badgeText: { color: "#1d4ed8", fontWeight: "700", fontSize: 13 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
  },
  cardActive: { borderColor: "#c7d2fe", backgroundColor: "#eff6ff" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  cardTime: { fontSize: 11, color: "#64748b" },
  cardBody: { fontSize: 12, color: "#334155" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
    position: "absolute",
    top: 12,
    right: 12,
  },
});
