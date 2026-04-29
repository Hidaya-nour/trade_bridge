import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

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
const DEFAULT_REGION = {
  latitude: 9.03,
  longitude: 38.74,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

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
   case "delivered":
      return { bg: "#ecfdf3", text: "#15803d", border: "#bbf7d0" };
    case "pending":
      return { bg: "#fef3c7", text: "#d97706", border: "#fcd34d" };
    case "failed":
    case "cancelled":
      return { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" };
  }
};

const openExternalUrl = async (url: string) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  }
};

export default function DriverTrackingScreen() {
  const mapRef = useRef<MapView | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastPostMsRef = useRef(0);

  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [locations, setLocations] = useState<DriverLocationPoint[]>([]);
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isResolvingGps, setIsResolvingGps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const activeDelivery = useMemo(
    () => deliveries.find((delivery) => delivery.id === activeDeliveryId) ?? null,
    [activeDeliveryId, deliveries],
  );

  const sortedLocations = useMemo(
    () =>
      locations
        .slice()
        .sort(
          (a, b) =>
            new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
        ),
    [locations],
  );

  const latestLocation = sortedLocations[sortedLocations.length - 1] ?? null;

  const routeCoordinates = useMemo(
    () =>
      sortedLocations.map((location) => ({
        latitude: location.latitude,
        longitude: location.longitude,
      })),
    [sortedLocations],
  );

  const currentCoordinate = latestLocation
    ? {
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
      }
    : lastCoords
      ? {
          latitude: lastCoords.lat,
          longitude: lastCoords.lng,
        }
      : null;

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
    if (!activeDelivery?.orderId) {
      setLocations([]);
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const syncLocations = async () => {
      if (cancelled) return;
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
  }, [activeDelivery?.orderId]);

  useEffect(() => {
    if (!currentCoordinate || !mapRef.current) {
      return;
    }

    mapRef.current.animateToRegion(
      {
        ...currentCoordinate,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      500,
    );
  }, [currentCoordinate?.latitude, currentCoordinate?.longitude]);

  useEffect(() => {
    return () => {
      locationSubscriptionRef.current?.remove();
      locationSubscriptionRef.current = null;
    };
  }, []);

  const pushLocation = async (
    delivery: DriverDelivery,
    latitude: number,
    longitude: number,
    force = false,
  ) => {
    const now = Date.now();
    if (!force && now - lastPostMsRef.current < MIN_POST_INTERVAL_MS) {
      return;
    }

    await driverLocationService.create({
      order_id: delivery.orderId,
      latitude,
      longitude,
    });

    lastPostMsRef.current = now;
    setLastCoords({ lat: latitude, lng: longitude });
    setLastSentAt(new Date(now).toISOString());
  };

  const updateDeliveryStatus = async (deliveryId: string, status: DeliveryStatus) => {
    await api.patch(`/deliveries/${deliveryId}/status`, { status });
  };

  const stopSharing = () => {
    locationSubscriptionRef.current?.remove();
    locationSubscriptionRef.current = null;
    setIsSharing(false);
  };

  const ensureLocationPermission = async () => {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      Alert.alert(
        "Location services disabled",
        "Turn on device location services to start live tracking.",
      );
      return false;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Location permission required",
        "Allow foreground location access so Trade Bridge can share live driver position.",
      );
      return false;
    }

    return true;
  };

  const startSharing = async () => {
    if (!activeDelivery) {
      Alert.alert("Select a delivery", "Choose a delivery before starting tracking.");
      return;
    }

    try {
      setIsResolvingGps(true);
      const permissionGranted = await ensureLocationPermission();
      if (!permissionGranted) {
        return;
      }

     

      const initialPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      await pushLocation(
        activeDelivery,
        initialPosition.coords.latitude,
        initialPosition.coords.longitude,
        true,
      );

      locationSubscriptionRef.current?.remove();
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: POLL_INTERVAL_MS,
          distanceInterval: 5,
        },
        async (position) => {
          try {
            await pushLocation(
              activeDelivery,
              position.coords.latitude,
              position.coords.longitude,
            );
            await loadLocations(activeDelivery.orderId);
          } catch {
            setError("Failed to sync driver location to the backend.");
          }
        },
      );

      setIsSharing(true);
      await loadDeliveries();
      await loadLocations(activeDelivery.orderId);
    } catch (startError: any) {
      setError(
        startError?.response?.data?.message ||
          startError?.message ||
          "Failed to start live location sharing.",
      );
      stopSharing();
    } finally {
      setIsResolvingGps(false);
    }
  };

  const openCurrentPoint = async () => {
    if (!currentCoordinate) {
      return;
    }

    await openExternalUrl(
      buildGoogleMapsSearchUrl(
        currentCoordinate.latitude,
        currentCoordinate.longitude,
      ),
    );
  };

  return (
    <ScreenWrapper
      title="Live Tracking"
      subtitle="Native map, live route, and device GPS sharing"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Driver Live Tracking</Text>
          <Text style={styles.heroSubtitle}>
            View your live route on a native map, share device GPS in real time,
            and keep the current delivery centered while you drive.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatChip}>
              <Text style={styles.heroStatValue}>
                {isSharing ? "Live" : "Standby"}
              </Text>
              <Text style={styles.heroStatLabel}>Tracking status</Text>
            </View>
            <View style={styles.heroStatChip}>
              <Text style={styles.heroStatValue}>{routeCoordinates.length}</Text>
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
                      <Text style={styles.deliveryRoute}>{delivery.pickupPoint}</Text>
                      <Text style={styles.deliveryRoute}>{delivery.destination}</Text>
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
          <Text style={styles.sectionTitle}>Live Map</Text>

          {activeDelivery ? (
            <>
              <View style={styles.mapWrap}>
                <MapView
                  ref={mapRef}
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  initialRegion={
                    currentCoordinate
                      ? {
                          ...currentCoordinate,
                          latitudeDelta: 0.02,
                          longitudeDelta: 0.02,
                        }
                      : DEFAULT_REGION
                  }
                  showsUserLocation={isSharing}
                  showsMyLocationButton
                  showsCompass
                >
                  {routeCoordinates.length > 1 && (
                    <Polyline
                      coordinates={routeCoordinates}
                      strokeColor="#2563eb"
                      strokeWidth={5}
                    />
                  )}
                  {routeCoordinates.length > 0 && (
                    <Marker
                      coordinate={routeCoordinates[0]}
                      title="Route start"
                      pinColor="#16a34a"
                    />
                  )}
                  {currentCoordinate && (
                    <Marker
                      coordinate={currentCoordinate}
                      title="Current driver position"
                      description={formatDateTime(lastSentAt)}
                      pinColor="#2563eb"
                    />
                  )}
                </MapView>
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
                  <Text style={styles.infoLabel}>Current point</Text>
                  <Text style={styles.infoValue}>
                    {currentCoordinate
                      ? `${currentCoordinate.latitude}, ${currentCoordinate.longitude}`
                      : "Waiting for GPS"}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Last sync</Text>
                  <Text style={styles.infoValue}>{formatDateTime(lastSentAt)}</Text>
                </View>
              </View>

              <View style={styles.actionsWrap}>
                <Pressable
                  style={[
                    styles.primaryButton,
                    (isSharing || isResolvingGps) && styles.disabledButton,
                  ]}
                  onPress={startSharing}
                  disabled={isSharing || isResolvingGps}
                >
                  {isResolvingGps ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons name="play" size={16} color="#ffffff" />
                  )}
                  <Text style={styles.primaryButtonText}>
                    {isResolvingGps ? "Starting GPS..." : "Start GPS sharing"}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.secondaryButton, !isSharing && styles.disabledButton]}
                  onPress={stopSharing}
                  disabled={!isSharing}
                >
                  <Ionicons name="square" size={16} color="#334155" />
                  <Text style={styles.secondaryButtonText}>Stop sharing</Text>
                </Pressable>

                {currentCoordinate ? (
                  <Pressable style={styles.secondaryButton} onPress={openCurrentPoint}>
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
  mapWrap: {
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  map: {
    width: "100%",
    height: 320,
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
