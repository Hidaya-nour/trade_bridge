import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import deliveryService from "@/features/driver-deliveries/delivery.service";
import { type DeliveryPriority, type DeliveryStatus, type DriverDelivery } from "@/features/driver-deliveries/delivery.types";

const formatStatus = (status: DeliveryStatus) =>
  status.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusColors = (status: DeliveryStatus) => {
  switch (status) {
    case "assigned":
      return { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" };
    case "picked_up":
      return { bg: "#ede9fe", text: "#6d28d9", border: "#ddd6fe" };
    case "in_transit":
      return { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" };
    case "delivered":
      return { bg: "#ecfdf3", text: "#15803d", border: "#bbf7d0" };
    case "pending":
      return { bg: "#fef3c7", text: "#d97706", border: "#fcd34d" };
    case "failed":
      return { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" };
    case "cancelled":
      return { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" };
  }
};

const getPriorityColors = (priority: DeliveryPriority) => {
  switch (priority) {
    case "urgent":
      return { bg: "#fef2f2", text: "#b91c1c" };
    case "fragile":
      return { bg: "#fff7ed", text: "#c2410c" };
    default:
      return { bg: "#f8fafc", text: "#475569" };
  }
};

export default function DriverDeliveryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [delivery, setDelivery] = useState<DriverDelivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDelivery = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await deliveryService.getMyDeliveries();
        setDelivery(rows.find((item) => item.id === id) ?? null);
      } catch (loadError: any) {
        setError(
          loadError?.response?.data?.message ||
            "Failed to load delivery details from the backend.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDelivery();
  }, [id]);

  if (isLoading) {
    return (
      <ScreenWrapper title="Delivery Details" subtitle="Driver">
        <View style={styles.missingWrap}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.missingTitle}>Loading delivery</Text>
          <Text style={styles.missingSubtitle}>
            Fetching delivery details from the backend.
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper title="Delivery Details" subtitle="Driver">
        <View style={styles.missingWrap}>
          <Text style={styles.missingTitle}>Could not load delivery</Text>
          <Text style={styles.missingSubtitle}>{error}</Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace("/driver/deliveries" as never)}
          >
            <Text style={styles.backButtonText}>Back to Deliveries</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  if (!delivery) {
    return (
      <ScreenWrapper title="Delivery Details" subtitle="Driver">
        <View style={styles.missingWrap}>
          <Text style={styles.missingTitle}>Delivery not found</Text>
          <Text style={styles.missingSubtitle}>
            This delivery may have been removed or the link is no longer valid.
          </Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace("/driver/deliveries" as never)}
          >
            <Text style={styles.backButtonText}>Back to Deliveries</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  const statusColors = getStatusColors(delivery.status);
  const priorityColors = getPriorityColors(delivery.priority);
  const totalUnits = delivery.products.reduce(
    (total, product) => total + product.quantity,
    0,
  );

  return (
    <ScreenWrapper title="Delivery Details" subtitle={delivery.orderCode}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.orderCode}>{delivery.orderCode}</Text>
              <Text style={styles.routeText}>
                {delivery.supplierName} to {delivery.buyerName}
              </Text>
            </View>
            <Pressable
              style={styles.inlineButton}
              onPress={() => router.replace("/driver/deliveries" as never)}
            >
              <Ionicons name="list-outline" size={16} color="#0f172a" />
              <Text style={styles.inlineButtonText}>All deliveries</Text>
            </Pressable>
          </View>

          <View style={styles.badgeRow}>
            <Text
              style={[
                styles.badge,
                {
                  backgroundColor: statusColors.bg,
                  color: statusColors.text,
                  borderColor: statusColors.border,
                },
              ]}
            >
              {formatStatus(delivery.status)}
            </Text>
            <Text
              style={[
                styles.badge,
                {
                  backgroundColor: priorityColors.bg,
                  color: priorityColors.text,
                  borderColor: "transparent",
                },
              ]}
            >
              {delivery.priority.toUpperCase()}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>
                {delivery.status === "delivered" ? "Delivered" : "ETA"}
              </Text>
              <Text style={styles.metricValue}>
                {delivery.status === "delivered"
                  ? delivery.deliveredAt
                  : `${delivery.etaMinutes} min`}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Distance</Text>
              <Text style={styles.metricValue}>{delivery.distanceKm} km</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Load</Text>
              <Text style={styles.metricValue}>{totalUnits} units</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${delivery.routeProgress}%` }]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {delivery.routeProgress}% route complete
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Route Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup</Text>
            <Text style={styles.detailValue}>{delivery.pickupPoint}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dropoff</Text>
            <Text style={styles.detailValue}>{delivery.destination}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery window</Text>
            <Text style={styles.detailValue}>{delivery.scheduledWindow}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehicle</Text>
            <Text style={styles.detailValue}>{delivery.vehiclePlate}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recipient Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contact person</Text>
            <Text style={styles.detailValue}>{delivery.contactPerson}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{delivery.contactPhone}</Text>
          </View>
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>Driver note</Text>
            <Text style={styles.noteText}>{delivery.notes}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Load Details</Text>
          {delivery.products.map((product) => (
            <View key={`${delivery.id}-${product.name}`} style={styles.productRow}>
              <View style={styles.productIcon}>
                <Ionicons name="cube-outline" size={16} color="#1d4ed8" />
              </View>
              <View style={styles.productTextWrap}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productMeta}>
                  {product.quantity} {product.unit}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Timeline</Text>
          {delivery.timeline.map((item) => (
            <View key={`${delivery.id}-${item.label}`} style={styles.timelineRow}>
              <View
                style={[
                  styles.timelineDot,
                  item.complete ? styles.timelineDotDone : styles.timelineDotPending,
                ]}
              />
              <View style={styles.timelineTextWrap}>
                <Text style={styles.timelineLabel}>{item.label}</Text>
                <Text style={styles.timelineTime}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actionsRow}>
          {delivery.status !== "delivered" ? (
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/driver/tracking" as never)}
            >
              <Ionicons name="navigate-outline" size={16} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Open live tracking</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.push(`/driver/issues?deliveryId=${delivery.id}` as never)
            }
          >
            <Ionicons name="alert-circle-outline" size={16} color="#334155" />
            <Text style={styles.secondaryButtonText}>
              {delivery.issueReported ? "View issue log" : "Report issue"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  orderCode: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  routeText: {
    marginTop: 4,
    fontSize: 13,
    color: "#475569",
  },
  inlineButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inlineButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    overflow: "hidden",
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
  },
  metricValue: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#dbeafe",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 999,
  },
  progressLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "600",
    lineHeight: 20,
  },
  noteBox: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1d4ed8",
    textTransform: "uppercase",
  },
  noteText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#334155",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  productIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  productTextWrap: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  productMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748b",
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineDotDone: {
    backgroundColor: "#16a34a",
  },
  timelineDotPending: {
    backgroundColor: "#cbd5e1",
  },
  timelineTextWrap: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  timelineTime: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748b",
  },
  actionsRow: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
  },
  missingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  missingTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  missingSubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 19,
  },
  backButton: {
    marginTop: 8,
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
