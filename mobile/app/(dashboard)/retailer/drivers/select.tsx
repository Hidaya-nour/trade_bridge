import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import driverLocationService, { type NearbyDriver } from "@/features/driver-location/driver-location.service";
import deliveryService from "@/features/deliveries/delivery.service";
import { useOrderStore } from "@/features/orders/order.store";

type DriverWithDistance = NearbyDriver & { distance_km?: number };

const toRad = (value: number) => (value * Math.PI) / 180;
const haversineKm = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

export default function RetailerDriverSelectScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const normalizedOrderId = String(orderId || "");

  const { fetchOrderById } = useOrderStore();

  const [dropoff, setDropoff] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (normalizedOrderId) {
        const order = await fetchOrderById(normalizedOrderId);
        if (order?.delivery?.dropoff_location) {
          setDropoff(order.delivery.dropoff_location);
        }
      }

      const rows = await driverLocationService.getNearbyDrivers(60);
      setDrivers(rows);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load drivers");
      setDrivers([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchOrderById, normalizedOrderId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const resolveLocation = async () => {
      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) return;

        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") return;

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setMyLocation({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
      } catch {
        // Ignore location errors; we can still show drivers unsorted by distance.
      }
    };

    void resolveLocation();
  }, []);

  const sortedDrivers: DriverWithDistance[] = useMemo(() => {
    const enriched: DriverWithDistance[] = drivers.map((d) => {
      if (!myLocation) return d;
      return {
        ...d,
        distance_km: haversineKm(myLocation, {
          latitude: d.last_location.latitude,
          longitude: d.last_location.longitude,
        }),
      };
    });

    return enriched.sort((a, b) => {
      const da = typeof a.distance_km === "number" ? a.distance_km : Number.POSITIVE_INFINITY;
      const db = typeof b.distance_km === "number" ? b.distance_km : Number.POSITIVE_INFINITY;
      if (da !== db) return da - db;
      return String(a.driver_user?.full_name || "").localeCompare(String(b.driver_user?.full_name || ""));
    });
  }, [drivers, myLocation]);

  const handleChat = useCallback(
    (driverUserId?: string | null) => {
      if (!driverUserId) return;
      router.push(`/retailer/messages/${driverUserId}` as never);
    },
    [router],
  );

  const handleCall = useCallback(async (phone?: string | null) => {
    const value = String(phone || "").trim();
    if (!value) return;
    await Linking.openURL(`tel:${value.replace(/\s+/g, "")}`);
  }, []);

  const assignDriver = useCallback(
    async (driver: NearbyDriver) => {
      if (!normalizedOrderId) {
        Alert.alert("Missing order", "Open this screen from an order to assign a driver.");
        return;
      }

      const dropoffValue = dropoff.trim();
      if (!dropoffValue) {
        Alert.alert("Delivery address required", "Enter where the driver should deliver this order.");
        return;
      }

      const driverName = driver.driver_user?.full_name || "Driver";
      Alert.alert("Assign driver", `Assign ${driverName} to deliver this order?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Assign",
          onPress: async () => {
            setSubmitting(true);
            try {
              await deliveryService.assignDriverForOrder(normalizedOrderId, {
                driver_id: driver.id,
                dropoff_location: dropoffValue,
                pickup_location: "",
              });
              Alert.alert("Driver assigned", "This driver is now assigned to your order.", [
                {
                  text: "OK",
                  onPress: () => router.replace(`/retailer/orders/${normalizedOrderId}` as never),
                },
              ]);
            } catch (err: any) {
              Alert.alert(
                "Assignment failed",
                err?.response?.data?.message || err?.message || "Please try again.",
              );
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]);
    },
    [dropoff, normalizedOrderId, router],
  );

  if (isLoading) {
    return (
      <ScreenWrapper title="Select Driver" subtitle="Retailer">
        <View style={styles.centeredWrap}>
          <ActivityIndicator size="small" color="#1d4ed8" />
          <Text style={styles.metaText}>Loading driversâ€¦</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Select Driver" subtitle="Retailer">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery address</Text>
          <Text style={styles.metaText}>
            Drivers are sorted by proximity to your current location when location permission is granted.
          </Text>
          <TextInput
            value={dropoff}
            onChangeText={setDropoff}
            placeholder="Enter delivery address (e.g., Addis Ababa, Bole, …)"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            editable={!submitting}
            multiline
          />
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Unable to load drivers</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.secondaryButton} onPress={() => void load()} disabled={submitting}>
              <Text style={styles.secondaryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available drivers</Text>
          <Text style={styles.sectionSubtitle}>{sortedDrivers.length} nearby</Text>
        </View>

        {sortedDrivers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No drivers found</Text>
            <Text style={styles.emptyText}>Ask a driver to share their location, then refresh.</Text>
            <Pressable style={styles.secondaryButton} onPress={() => void load()} disabled={submitting}>
              <Text style={styles.secondaryButtonText}>Refresh</Text>
            </Pressable>
          </View>
        ) : (
          sortedDrivers.map((driver) => {
            const driverName = driver.driver_user?.full_name || "Driver";
            const phone = driver.driver_user?.phone || null;
            const distanceLabel =
              typeof driver.distance_km === "number" ? `${driver.distance_km.toFixed(1)} km` : "Distance unknown";
            const vehicle = driver.vehicle_type || "Vehicle";
            const plate = driver.license_plate ? `â€¢ ${driver.license_plate}` : "";

            return (
              <View key={driver.id} style={styles.driverCard}>
                <View style={styles.driverHeader}>
                  <View style={styles.driverAvatar}>
                    <Ionicons name="car-outline" size={18} color="#1d4ed8" />
                  </View>
                  <View style={styles.driverCopy}>
                    <Text style={styles.driverName} numberOfLines={1}>
                      {driverName}
                    </Text>
                    <Text style={styles.driverMeta} numberOfLines={1}>
                      {vehicle} {plate}
                    </Text>
                    <Text style={styles.driverMeta}>{distanceLabel}</Text>
                  </View>
                  <Pressable
                    style={[styles.assignButton, submitting && styles.assignButtonDisabled]}
                    onPress={() => void assignDriver(driver)}
                    disabled={submitting}
                  >
                    <Text style={styles.assignButtonText}>Assign</Text>
                  </Pressable>
                </View>

                <View style={styles.driverActions}>
                  <Pressable
                    style={[styles.actionChip, !phone && styles.actionChipDisabled]}
                    onPress={() => void handleCall(phone)}
                    disabled={!phone || submitting}
                  >
                    <Ionicons name="call-outline" size={14} color={phone ? "#1d4ed8" : "#94a3b8"} />
                    <Text style={[styles.actionChipText, !phone && styles.actionChipTextDisabled]}>
                      Call
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.actionChip}
                    onPress={() => handleChat(driver.driver_user?.id || null)}
                    disabled={submitting}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color="#1d4ed8" />
                    <Text style={styles.actionChipText}>Chat</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  centeredWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#0f172a",
    minHeight: 56,
  },
  driverCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 12,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  driverCopy: {
    flex: 1,
    gap: 4,
  },
  driverName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  driverMeta: {
    fontSize: 12,
    color: "#64748b",
  },
  assignButton: {
    borderRadius: 14,
    backgroundColor: "#1d4ed8",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  assignButtonDisabled: {
    opacity: 0.6,
  },
  assignButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  driverActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionChipDisabled: {
    opacity: 0.7,
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  actionChipTextDisabled: {
    color: "#94a3b8",
  },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 8,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  emptyText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#eff6ff",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  errorCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
    padding: 16,
    gap: 8,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#991b1b",
  },
  errorText: {
    fontSize: 12,
    color: "#7f1d1d",
    lineHeight: 18,
  },
});

