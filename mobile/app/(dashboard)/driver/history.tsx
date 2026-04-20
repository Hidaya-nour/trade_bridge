import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import deliveryService from "@/features/driver-deliveries/delivery.service";
import { type DriverDelivery } from "@/features/driver-deliveries/delivery.types";

export default function DriverHistoryScreen() {
  const router = useRouter();
  const [completedDeliveries, setCompletedDeliveries] = useState<DriverDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await deliveryService.getMyDeliveries();
        setCompletedDeliveries(
          rows.filter((delivery) => delivery.status === "delivered"),
        );
      } catch (loadError: any) {
        setError(
          loadError?.response?.data?.message ||
            "Failed to load delivery history from the backend.",
        );
        setCompletedDeliveries([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <ScreenWrapper title="Delivery History" subtitle="Completed orders list">
      <ScrollView contentContainerStyle={styles.container}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.emptyTitle}>Loading history</Text>
            <Text style={styles.emptySubtitle}>
              Fetching completed deliveries from the backend.
            </Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Could not load history</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
          </View>
        ) : completedDeliveries.length ? (
          completedDeliveries.map((delivery) => (
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
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No completed deliveries</Text>
            <Text style={styles.emptySubtitle}>
              Delivered orders will appear here after they are completed.
            </Text>
          </View>
        )}
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
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 18,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#64748b",
    lineHeight: 18,
  },
  issue: { color: "#b91c1c", backgroundColor: "#fee2e2" },
  success: { color: "#047857", backgroundColor: "#dcfce7" },
});
