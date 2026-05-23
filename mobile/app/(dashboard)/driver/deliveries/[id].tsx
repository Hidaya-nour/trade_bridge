import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, Alert } from "react-native";
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
    case "delivered":
      return { bg: "#ecfdf3", text: "#15803d", border: "#bbf7d0" };
    case "pending":
      return { bg: "#fef3c7", text: "#d97706", border: "#fcd34d" };
    default:
      return { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" };
  }
};

export default function DriverDeliveryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [delivery, setDelivery] = useState<DriverDelivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDelivery = async () => {
    setIsLoading(true);
    setError(null);

    if (!id) {
      setError('Delivery reference is missing.');
      setIsLoading(false);
      return;
    }

    try {
      const deliveryItem = await deliveryService.getDeliveryById(id);
      if (!deliveryItem) {
        setError('Delivery not found');
        setDelivery(null);
      } else {
        setDelivery(deliveryItem);
      }
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message || 'Failed to load delivery details.');
      setDelivery(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDelivery();
  }, [id]);

  const handleStatusUpdate = async (newStatus: DeliveryStatus) => {
    try {
      setIsUpdating(true);
      await deliveryService.updateStatus(delivery!.id, newStatus);
      await loadDelivery(); // Refresh data to show next step
      Alert.alert("Success", `Status updated to ${formatStatus(newStatus)}`);
    } catch (err: any) {
      Alert.alert("Update Failed", err?.response?.data?.message || "Could not update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper title="Delivery Details" subtitle="Driver">
        <View style={styles.missingWrap}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.missingTitle}>Loading delivery</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error || !delivery) {
    return (
      <ScreenWrapper title="Delivery Details" subtitle="Driver">
        <View style={styles.missingWrap}>
          <Text style={styles.missingTitle}>{error || "Delivery not found"}</Text>
          <Pressable style={styles.backButton} onPress={() => router.replace("/driver/deliveries" as never)}>
            <Text style={styles.backButtonText}>Back to Deliveries</Text>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  const statusColors = getStatusColors(delivery.status);

  return (
    <ScreenWrapper title="Delivery Details" subtitle={delivery.orderCode}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Information */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.orderCode}>{delivery.orderCode}</Text>
              <Text style={styles.routeText}>{delivery.supplierName} to {delivery.buyerName}</Text>
            </View>
            <Text style={[styles.badge, { backgroundColor: statusColors.bg, color: statusColors.text, borderColor: statusColors.border }]}>
              {formatStatus(delivery.status)}
            </Text>
          </View>
        </View>

        {/* Dynamic Action Buttons based on Lifecycle */}
        <View style={styles.actionsRow}>
          {isUpdating && <ActivityIndicator size="small" color="#1d4ed8" />}
          
          {/* 1. Pending -> Accept (Assigned) */}
          {delivery.status === "pending" && (
            <Pressable 
              style={[styles.primaryButton, { backgroundColor: "#16a34a" }]} 
              onPress={() => handleStatusUpdate("assigned")}
              disabled={isUpdating}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Accept Delivery</Text>
            </Pressable>
          )}

          {/* 2. Assigned -> Picked Up */}
          {delivery.status === "assigned" && (
            <Pressable 
              style={[styles.primaryButton, { backgroundColor: "#6d28d9" }]} 
              onPress={() => handleStatusUpdate("picked_up")}
              disabled={isUpdating}
            >
              <Ionicons name="cube-outline" size={18} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Mark as Picked Up</Text>
            </Pressable>
          )}

          {/* 3. Picked Up -> Tracking & Completion */}
          {delivery.status === "picked_up" && (
            <>
              <Pressable 
                style={styles.primaryButton} 
                onPress={() => router.push("/driver/tracking" as never)}
              >
                <Ionicons name="navigate-outline" size={18} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Open Live Tracking</Text>
              </Pressable>
              <Pressable 
                style={[styles.primaryButton, { backgroundColor: "#059669", marginTop: 8 }]} 
                onPress={() => handleStatusUpdate("delivered")}
                disabled={isUpdating}
              >
                <Ionicons name="flag-outline" size={18} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Mark as Delivered</Text>
              </Pressable>
            </>
          )}

          <Pressable 
            style={styles.secondaryButton} 
            onPress={() => router.push(`/driver/issues?deliveryId=${delivery.id}` as never)}
          >
            <Ionicons name="alert-circle-outline" size={18} color="#334155" />
            <Text style={styles.secondaryButtonText}>
              {delivery.issueReported ? "View issue log" : "Report issue"}
            </Text>
          </Pressable>
        </View>

        {/* Timeline */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Timeline</Text>
          {Array.isArray(delivery.timeline) && delivery.timeline.length ? (
            delivery.timeline.map((item, idx) => (
              <View key={idx} style={styles.timelineRow}>
                <View style={[styles.timelineDot, item.complete ? styles.timelineDotDone : styles.timelineDotPending]} />
                <View style={styles.timelineTextWrap}>
                  <Text style={styles.timelineLabel}>{item.label}</Text>
                  <Text style={styles.timelineTime}>{item.time || 'Pending'}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptySubtitle}>No timeline data is available for this delivery.</Text>
          )}
        </View>

        {/* Route Info */}
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
        </View>

        {/* Load Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Load Details</Text>
          {Array.isArray(delivery.products) && delivery.products.length ? (
            delivery.products.map((product, idx) => (
              <View key={idx} style={styles.productRow}>
                <View style={styles.productIcon}><Ionicons name="cube-outline" size={16} color="#1d4ed8" /></View>
                <View style={styles.productTextWrap}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productMeta}>{product.quantity} {product.unit}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptySubtitle}>No load details are available for this delivery.</Text>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, gap: 16 },
  heroCard: { backgroundColor: "#ffffff", borderRadius: 18, borderWidth: 1, borderColor: "#e2e8f0", padding: 16 },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  orderCode: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  routeText: { marginTop: 4, fontSize: 13, color: "#475569" },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, overflow: "hidden" },
  sectionCard: { backgroundColor: "#ffffff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", padding: 16, gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  detailRow: { gap: 4, marginBottom: 8 },
  detailLabel: { fontSize: 11, color: "#64748b", fontWeight: "700", textTransform: "uppercase" },
  detailValue: { fontSize: 14, color: "#0f172a", fontWeight: "600" },
  productRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  productIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" },
  productTextWrap: { flex: 1 },
  productName: { fontSize: 14, fontWeight: "700" },
  productMeta: { fontSize: 12, color: "#64748b" },
  timelineRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineDotDone: { backgroundColor: "#16a34a" },
  timelineDotPending: { backgroundColor: "#cbd5e1" },
  timelineTextWrap: { flex: 1 },
  timelineLabel: { fontSize: 14, fontWeight: "700" },
  timelineTime: { fontSize: 12, color: "#64748b" },
  actionsRow: { gap: 10 },
  primaryButton: { backgroundColor: "#1d4ed8", borderRadius: 12, paddingVertical: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  secondaryButton: { backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "#cbd5e1", paddingVertical: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  secondaryButtonText: { color: "#334155", fontSize: 15, fontWeight: "700" },
  missingWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
  missingTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  backButton: { marginTop: 8, backgroundColor: "#1d4ed8", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  backButtonText: { color: "#ffffff", fontWeight: "700" },
  emptySubtitle: { marginTop: 10, fontSize: 13, color: "#64748b", lineHeight: 18 },
});