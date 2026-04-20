import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { DRIVER_DELIVERIES } from "./driverData";

export default function DriverHistoryScreen() {
  const router = useRouter();
  const completedDeliveries = DRIVER_DELIVERIES.filter(
    (delivery) => delivery.status === "delivered",
  );

  return (
    <ScreenWrapper title="Delivery History" subtitle="Completed orders list">
      <ScrollView contentContainerStyle={styles.container}>
        {completedDeliveries.map((delivery) => (
          <Pressable
            key={delivery.id}
            style={styles.card}
            onPress={() => router.push(`/driver/deliveries/${delivery.id}` as never)}
          >
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.orderCode}>{delivery.orderCode}</Text>
                <Text style={styles.destination}>{delivery.destination}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.date}>Delivered {delivery.deliveredAt}</Text>
              <Text
                style={[
                  styles.status,
                  delivery.issueReported ? styles.issue : styles.success,
                ]}
              >
                {delivery.issueReported ? "Issue reported" : "Completed"}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 40 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  orderCode: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  destination: { color: "#475569", fontSize: 12, marginTop: 4 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  date: { fontSize: 12, color: "#64748b" },
  status: {
    fontWeight: "700",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  issue: { color: "#b91c1c", backgroundColor: "#fee2e2" },
  success: { color: "#047857", backgroundColor: "#dcfce7" },
});
