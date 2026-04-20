import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import deliveryService from "@/features/driver-deliveries/delivery.service";
import {
  type DriverDelivery,
  type DeliveryStatus,
} from "@/features/driver-deliveries/delivery.types";
import driverLocationService, {
  type DriverLocationPoint,
} from "@/features/driver-location/driver-location.service";
import api from "@/lib/api";

const POLL_INTERVAL_MS = 5000;
const MIN_POST_INTERVAL_MS = 5000;

const formatStatus = (status: DeliveryStatus) =>
  status.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "No updates yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No updates yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const openExternalUrl = async (url: string) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  }
};

const buildGoogleMapsSearchUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const buildGoogleMapsDirectionsUrl = (destination: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

const getStatusTone = (status: DeliveryStatus) => {
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
    case "cancelled":
      return { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" };
  }
};

export default function DriverTrackingScreen() {
  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [locations, setLocations] = useState<DriverLocationPoint[]>([]);
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const watchIdRef = useRef<number | null>(null);
  const lastPostMsRef = useRef(0);

  const activeDelivery = useMemo(
    () => deliveries.find((delivery) => delivery.id === activeDeliveryId) ?? null,
    [activeDeliveryId, deliveries],
  );

  const latestLocation = useMemo(
    () =>
      locations.length
        ? locations.reduce((latest, current) =>
            new Date(current.recorded_at) > new Date(latest.recorded_at)
              ? current
              : latest,
          )
        : null,
    [locations],
  );

  const supportsGeolocation =
    typeof navigator !== "undefined" &&
    !!navigator.geolocation &&
    Platform.OS === "web";

  const loadDeliveries = async () => {
    try {
      setIsLoadingDeliveries(true);
      setError(null);
      const rows = await deliveryService.getMyDeliveries();
      setDeliveries(rows);

      setActiveDeliveryId((current) =>
        current && rows.some((delivery) => delivery.id === current)
          ? current
          : rows[0]?.id ?? null,
      );
    } catch (loadError: any) {
      setError(
        loadError?.response?.data?.message ||
          "Failed to load deliveries from the backend.",
      );
      setDeliveries([]);
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  const loadLocations = async (orderId: string) => {
    try {
      setIsLoadingLocations(true);
      const rows = await driverLocationService.getByOrderId(orderId);
      setLocations(rows);

      if (rows.length) {
        const latest = rows.reduce((winner, current) =>
          new Date(current.recorded_at) > new Date(winner.recorded_at)
            ? current
            : winner,
        );
        setLastCoords({ lat: latest.latitude, lng: latest.longitude });
        setLastSentAt(latest.recorded_at);
      }
    } catch (loadError: any) {
      setError(
        loadError?.response?.data?.message ||
          "Failed to load live tracking points.",
      );
      setLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  useEffect(() => {
    if (!activeDelivery?.id) {
      setLocations([]);
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const syncLocations = async () => {
      if (cancelled || !activeDelivery.orderId) return;
      await loadLocations(activeDelivery.orderId);
    };

    syncLocations();
    intervalId = setInterval(syncLocations, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeDelivery?.id]);

  useEffect(() => {
    return () => {
      if (
        watchIdRef.current !== null &&
        typeof navigator !== "undefined" &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const pushLocation = async (
    delivery: DriverDelivery,
    lat: number,
    lng: number,
    force = false,
  ) => {
    const now = Date.now();
    if (!force && now - lastPostMsRef.current < MIN_POST_INTERVAL_MS) return;

    await driverLocationService.create({
      order_id: delivery.orderId,
      latitude: lat,
      longitude: lng,
    });

    lastPostMsRef.current = now;
    setLastCoords({ lat, lng });
    setLastSentAt(new Date(now).toISOString());
  };

  const stopSharing = () => {
    if (
      watchIdRef.current !== null &&
      typeof navigator !== "undefined" &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsSharing(false);
  };

  const updateDeliveryStatus = async (deliveryId: string, status: DeliveryStatus) => {
    await api.patch(`/deliveries/${deliveryId}/status`, { status });
  };

  const startSharing = async () => {
    if (!activeDelivery || !supportsGeolocation) {
      return;
    }

    try {
      if (
        activeDelivery.status === "assigned" ||
        activeDelivery.status === "picked_up" ||
        activeDelivery.status === "pending"
      ) {
        await updateDeliveryStatus(activeDelivery.id, "in_transit");
      }

      const initialPosition = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        },
      );

      await pushLocation(
        activeDelivery,
        initialPosition.coords.latitude,
        initialPosition.coords.longitude,
        true,
      );

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          await pushLocation(
            activeDelivery,
            position.coords.latitude,
            position.coords.longitude,
          );
          await loadLocations(activeDelivery.id);
        },
        () => {
          stopSharing();
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        },
      );

      setIsSharing(true);
      await loadDeliveries();
      await loadLocations(activeDelivery.orderId);
    } catch (startError: any) {
      setError(
        startError?.response?.data?.message ||
          "Failed to start live location sharing.",
      );
      stopSharing();
    }
  };

  return (
    <ScreenWrapper
      title="Live Tracking"
      subtitle="Vehicle location, route points, and Google Maps actions"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Driver Live Tracking</Text>
          <Text style={styles.heroSubtitle}>
            Monitor your latest route points, sync GPS when supported, and jump
            into Google Maps for navigation.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatChip}>
              <Text style={styles.heroStatValue}>
                {isSharing ? "Live" : "Standby"}
              </Text>
              <Text style={styles.heroStatLabel}>Tracking status</Text>
            </View>
            <View style={styles.heroStatChip}>
              <Text style={styles.heroStatValue}>{locations.length}</Text>
              <Text style={styles.heroStatLabel}>Route points</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Selection</Text>
            <Pressable style={styles.inlineButton} onPress={loadDeliveries}>
              <Ionicons name="refresh-outline" size={16} color="#0f172a" />
              <Text style={styles.inlineButtonText}>Refresh</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {isLoadingDeliveries ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.emptyTitle}>Loading deliveries</Text>
            </View>
          ) : deliveries.length ? (
            deliveries.map((delivery) => {
              const tone = getStatusTone(delivery.status);
              const isActive = activeDeliveryId === delivery.id;

              return (
                <Pressable
                  key={delivery.id}
                  style={[
                    styles.deliveryCard,
                    isActive && styles.deliveryCardActive,
                  ]}
                  onPress={() => setActiveDeliveryId(delivery.id)}
                >
                  <View style={styles.rowBetween}>
                    <View style={styles.deliveryTextWrap}>
                      <Text style={styles.deliveryCode}>{delivery.orderCode}</Text>
                      <Text style={styles.deliveryRoute}>
                        {delivery.pickupPoint}
                      </Text>
                      <Text style={styles.deliveryRoute}>
                        {delivery.destination}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: tone.bg,
                          color: tone.text,
                          borderColor: tone.border,
                        },
                      ]}
                    >
                      {formatStatus(delivery.status)}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No deliveries assigned</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tracking Console</Text>

          {activeDelivery ? (
            <>
              <View style={styles.mapCard}>
                <Ionicons name="navigate-outline" size={36} color="#2563eb" />
                <Text style={styles.mapTitle}>Latest driver position</Text>
                <Text style={styles.mapText}>
                  {latestLocation
                    ? `${latestLocation.latitude}, ${latestLocation.longitude}`
                    : lastCoords
                      ? `${lastCoords.lat}, ${lastCoords.lng}`
                      : "Waiting for backend location points"}
                </Text>
                <Text style={styles.mapHint}>
                  Embedded native maps need an additional mobile map package. For
                  now this screen stays synced with backend route points and opens
                  Google Maps directly.
                </Text>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Pickup</Text>
                  <Text style={styles.infoValue}>{activeDelivery.pickupPoint}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Dropoff</Text>
                  <Text style={styles.infoValue}>{activeDelivery.destination}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Last sync</Text>
                  <Text style={styles.infoValue}>{formatDateTime(lastSentAt)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text style={styles.infoValue}>{isSharing ? "Live" : "Standby"}</Text>
                </View>
              </View>

              <View style={styles.actionsWrap}>
                {supportsGeolocation ? (
                  <>
                    <Pressable
                      style={[styles.primaryButton, isSharing && styles.disabledButton]}
                      onPress={startSharing}
                      disabled={isSharing}
                    >
                      <Ionicons name="play" size={16} color="#ffffff" />
                      <Text style={styles.primaryButtonText}>Start GPS sharing</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.secondaryButton, !isSharing && styles.disabledButton]}
                      onPress={stopSharing}
                      disabled={!isSharing}
                    >
                      <Ionicons name="square" size={16} color="#334155" />
                      <Text style={styles.secondaryButtonText}>Stop sharing</Text>
                    </Pressable>
                  </>
                ) : (
                  <View style={styles.noticeBox}>
                    <Text style={styles.noticeText}>
                      GPS sharing is currently available on the web build where
                      browser geolocation is present. This mobile screen still shows
                      live backend points and Google Maps actions.
                    </Text>
                  </View>
                )}

                {latestLocation ? (
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() =>
                      openExternalUrl(
                        buildGoogleMapsSearchUrl(
                          latestLocation.latitude,
                          latestLocation.longitude,
                        ),
                      )
                    }
                  >
                    <Ionicons name="location-outline" size={16} color="#334155" />
                    <Text style={styles.secondaryButtonText}>
                      Open current point in Google Maps
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  style={styles.secondaryButton}
                  onPress={() =>
                    openExternalUrl(
                      buildGoogleMapsDirectionsUrl(activeDelivery.destination),
                    )
                  }
                >
                  <Ionicons name="navigate-outline" size={16} color="#334155" />
                  <Text style={styles.secondaryButtonText}>
                    Navigate to dropoff in Google Maps
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Select a delivery first</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Route Points</Text>

          {isLoadingLocations ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.emptyTitle}>Loading route points</Text>
            </View>
          ) : locations.length ? (
            locations
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.recorded_at).getTime() -
                  new Date(a.recorded_at).getTime(),
              )
              .map((location) => (
                <View key={location.id} style={styles.pointRow}>
                  <View style={styles.pointTextWrap}>
                    <Text style={styles.pointCoords}>
                      {location.latitude}, {location.longitude}
                    </Text>
                    <Text style={styles.pointTime}>
                      {formatDateTime(location.recorded_at)}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.iconButton}
                    onPress={() =>
                      openExternalUrl(
                        buildGoogleMapsSearchUrl(
                          location.latitude,
                          location.longitude,
                        ),
                      )
                    }
                  >
                    <Ionicons name="open-outline" size={16} color="#1d4ed8" />
                  </Pressable>
                </View>
              ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No route points yet</Text>
              <Text style={styles.emptySubtitle}>
                Once location updates are posted to the backend, they will appear
                here.
              </Text>
            </View>
          )}
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
    padding: 18,
    gap: 14,
  },
  heroTitle: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 19,
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 10,
  },
  heroStatChip: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  heroStatValue: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800",
  },
  heroStatLabel: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
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
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
    lineHeight: 18,
  },
  deliveryCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 14,
  },
  deliveryCardActive: {
    borderColor: "#60a5fa",
    backgroundColor: "#eff6ff",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  deliveryTextWrap: {
    flex: 1,
  },
  deliveryCode: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  deliveryRoute: {
    marginTop: 4,
    fontSize: 12,
    color: "#475569",
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    overflow: "hidden",
  },
  mapCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    gap: 8,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  mapText: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "600",
    textAlign: "center",
  },
  mapHint: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    textAlign: "center",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoItem: {
    width: "47%",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoLabel: {
    fontSize: 11,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  infoValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  actionsWrap: {
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
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  noticeBox: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  noticeText: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
  },
  pointRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  pointTextWrap: {
    flex: 1,
  },
  pointCoords: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  pointTime: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
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
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#64748b",
    lineHeight: 18,
  },
});
