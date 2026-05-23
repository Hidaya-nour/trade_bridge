import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  if (!value) return "No updates yet";

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
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination,
  )}`;

const parseLatLngFromText = (value?: string | null) => {
  if (!value) return null;

  const match = value.match(
    /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/,
  );

  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng };
};

const latestAddressCoords = (
  addresses?: Array<{
    latitude?: number | string | null;
    longitude?: number | string | null;
    created_at?: string | number | null;
  }>,
) => {
  if (!Array.isArray(addresses) || !addresses.length) {
    return null;
  }

  const sorted = addresses.slice().sort(
    (a, b) =>
      new Date(b?.created_at || 0).getTime() -
      new Date(a?.created_at || 0).getTime(),
  );

  for (const row of sorted) {
    const lat =
      typeof row?.latitude === "number"
        ? row.latitude
        : Number(row?.latitude);

    const lng =
      typeof row?.longitude === "number"
        ? row.longitude
        : Number(row?.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;

    return { lat, lng };
  }

  return null;
};

const getAddressLabel = (
  addresses?: Array<{
    common_name?: string | null;
    subcity?: string | null;
    city?: string | null;
  }>,
) => {
  if (!Array.isArray(addresses) || !addresses.length) return null;

  const row = addresses[0];
  const values = [row?.common_name, row?.subcity, row?.city].filter(Boolean);
  return values.join(", ") || null;
};

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
  try {
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      await Linking.openURL(url);
      return;
    }

    await Linking.openURL(url);
  } catch {
    Alert.alert(
      "Unable to open map",
      "Google Maps could not be opened.",
    );
  }
};

export default function DriverTrackingScreen() {
  const mapRef = useRef<any | null>(null);

  const locationSubscriptionRef =
    useRef<Location.LocationSubscription | null>(null);

  const lastPostMsRef = useRef(0);

  const [mapLib, setMapLib] = useState<any | null>(null);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [locations, setLocations] = useState<DriverLocationPoint[]>([]);

  const [activeDeliveryId, setActiveDeliveryId] =
    useState<string | null>(null);

  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const [isResolvingGps, setIsResolvingGps] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [lastSentAt, setLastSentAt] = useState<string | null>(null);

  const [lastCoords, setLastCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const activeDelivery = useMemo(
    () =>
      deliveries.find((delivery) => delivery.id === activeDeliveryId) ??
      null,
    [activeDeliveryId, deliveries],
  );

  const sortedLocations = useMemo(
    () =>
      locations
        .slice()
        .sort(
          (a, b) =>
            new Date(a.recorded_at).getTime() -
            new Date(b.recorded_at).getTime(),
        ),
    [locations],
  );

  const latestLocation =
    sortedLocations[sortedLocations.length - 1] ?? null;

  // FIX 1: Ensured line segment history items are strictly floating doubles
  const routeCoordinates = useMemo(
    () =>
      sortedLocations.map((location) => ({
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      })),
    [sortedLocations],
  );

  const pickupCoords =
    parseLatLngFromText(activeDelivery?.pickupPoint) ||
    latestAddressCoords(activeDelivery?.supplierAddresses);

  const dropoffCoords =
    parseLatLngFromText(activeDelivery?.destination) ||
    latestAddressCoords(activeDelivery?.buyerAddresses);

  // FIX 2: Explicit casting on tracking state fallbacks
  const currentCoordinate = latestLocation
    ? {
        latitude: Number(latestLocation.latitude),
        longitude: Number(latestLocation.longitude),
      }
    : lastCoords
      ? {
          latitude: Number(lastCoords.lat),
          longitude: Number(lastCoords.lng),
        }
      : null;

  // FIX 3: Explicit numeric casting on Start Anchor Point
  const startPoint = pickupCoords
    ? {
        latitude: Number(pickupCoords.lat),
        longitude: Number(pickupCoords.lng),
      }
    : routeCoordinates[0] ?? null;

  // FIX 4: Explicit parsing on the destination placeholder vector array
  const remainingCoordinates =
    latestLocation && dropoffCoords
      ? [
          {
            latitude: Number(latestLocation.latitude),
            longitude: Number(latestLocation.longitude),
          },
          {
            latitude: Number(dropoffCoords.lat),
            longitude: Number(dropoffCoords.lng),
          },
        ]
      : [];

  useEffect(() => {
    loadDeliveries();
  }, []);

  useEffect(() => {
    let mounted = true;

    try {
      if (Platform.OS === "web") {
        throw new Error("Maps unsupported on web");
      }

      const RNMaps = require("react-native-maps");
      if (mounted) {
        setMapLib({
          MapView: RNMaps.default,
          Marker: RNMaps.Marker,
          Polyline: RNMaps.Polyline,
        });

        setMapLoadError(null);
      }
    } catch (err: any) {
      if (mounted) {
        setMapLib(null);

        setMapLoadError(
          err?.message || "Native map unavailable.",
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeDelivery?.orderId) {
      setLocations([]);
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval>;

    const syncLocations = async () => {
      if (cancelled) return;
      await loadLocations(activeDelivery.orderId);
    };

    syncLocations();
    intervalId = setInterval(syncLocations, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
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
  }, [currentCoordinate]);

  useEffect(() => {
    return () => {
      locationSubscriptionRef.current?.remove();
    };
  }, []);

  const loadDeliveries = async () => {
    try {
      setIsLoadingDeliveries(true);
      setError(null);

      const rows = await deliveryService.getMyDeliveries();
      setDeliveries(rows);

      setActiveDeliveryId((current) =>
        current && rows.some((d) => d.id === current)
          ? current
          : rows[0]?.id ?? null,
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load deliveries.",
      );
      setDeliveries([]);
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  const loadLocations = async (orderId: string) => {
    try {
      setIsLoadingLocations(true);

      const rows =
        await driverLocationService.getByOrderId(orderId);
      setLocations(rows);

      if (rows.length) {
        const latest = rows.reduce((winner, current) =>
          new Date(current.recorded_at) >
          new Date(winner.recorded_at)
            ? current
            : winner,
        );

        setLastCoords({
          lat: Number(latest.latitude),
          lng: Number(latest.longitude),
        });

        setLastSentAt(latest.recorded_at);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load tracking points.",
      );
      setLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const pushLocation = async (
    delivery: DriverDelivery,
    latitude: number,
    longitude: number,
    force = false,
  ) => {
    const now = Date.now();

    if (
      !force &&
      now - lastPostMsRef.current < MIN_POST_INTERVAL_MS
    ) {
      return;
    }

    await driverLocationService.create({
      order_id: delivery.orderId,
      latitude,
      longitude,
    });

    lastPostMsRef.current = now;

    setLastCoords({
      lat: latitude,
      lng: longitude,
    });

    setLastSentAt(new Date(now).toISOString());
  };

  const stopSharing = () => {
    locationSubscriptionRef.current?.remove();
    locationSubscriptionRef.current = null;
    setIsSharing(false);
  };

  const ensureLocationPermission = async () => {
    const servicesEnabled =
      await Location.hasServicesEnabledAsync();

    if (!servicesEnabled) {
      Alert.alert(
        "Location disabled",
        "Enable location services.",
      );
      return false;
    }

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Location permission is needed.",
      );
      return false;
    }

    return true;
  };

  const startSharing = async () => {
    if (!activeDelivery) {
      Alert.alert(
        "Select delivery",
        "Choose a delivery first.",
      );
      return;
    }

    try {
      setIsResolvingGps(true);

      const permissionGranted =
        await ensureLocationPermission();

      if (!permissionGranted) {
        return;
      }

      const initialPosition =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

      await pushLocation(
        activeDelivery,
        initialPosition.coords.latitude,
        initialPosition.coords.longitude,
        true,
      );

      locationSubscriptionRef.current?.remove();

      locationSubscriptionRef.current =
        await Location.watchPositionAsync(
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
              setError(
                "Failed to sync driver location.",
              );
            }
          },
        );

      setIsSharing(true);
      await loadLocations(activeDelivery.orderId);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to start tracking.",
      );
      stopSharing();
    } finally {
      setIsResolvingGps(false);
    }
  };

  const openCurrentPoint = async () => {
    if (!currentCoordinate) return;

    await openExternalUrl(
      buildGoogleMapsSearchUrl(
        currentCoordinate.latitude,
        currentCoordinate.longitude,
      ),
    );
  };

  const MapComp = mapLib?.MapView;
  const MarkerComp = mapLib?.Marker;
  const PolylineComp = mapLib?.Polyline;

  return (
    <ScreenWrapper
      title="Live Tracking"
      subtitle="Driver GPS and live route"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Live Map</Text>

          {activeDelivery ? (
            <>
              <View style={styles.mapWrap}>
                {MapComp ? (
                  <MapComp
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={
                      currentCoordinate
                        ? {
                            ...currentCoordinate,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                          }
                        : startPoint
                          ? {
                              ...startPoint,
                              latitudeDelta: 0.02,
                              longitudeDelta: 0.02,
                            }
                          : DEFAULT_REGION
                    }
                    showsUserLocation={isSharing}
                    showsMyLocationButton
                    showsCompass
                  >
                    {PolylineComp && routeCoordinates.length > 1 && (
                      <PolylineComp
                        coordinates={routeCoordinates}
                        strokeColor="#2563eb"
                        strokeWidth={5}
                      />
                    )}
                    {PolylineComp && remainingCoordinates.length === 2 && (
                      <PolylineComp
                        coordinates={remainingCoordinates}
                        strokeColor="#93c5fd"
                        strokeWidth={5}
                      />
                    )}

                    {MarkerComp && startPoint && (
                      <MarkerComp coordinate={startPoint}>
                        <View style={styles.routeIconStart}>
                          <Text style={styles.routeIconText}>S</Text>
                        </View>
                      </MarkerComp>
                    )}

                    {MarkerComp && currentCoordinate && (
                      <MarkerComp coordinate={currentCoordinate}>
                        <View style={styles.routeIconCurrent}>
                          <Text style={styles.routeIconText}>D</Text>
                        </View>
                      </MarkerComp>
                    )}

                    {MarkerComp && dropoffCoords && (
                      <MarkerComp
                        coordinate={{
                          latitude: Number(dropoffCoords.lat),
                          longitude: Number(dropoffCoords.lng),
                        }}
                      >
                        <View style={styles.routeIconDropoff}>
                          <Text style={styles.routeIconText}>E</Text>
                        </View>
                      </MarkerComp>
                    )}
                  </MapComp>
                ) : (
                  <View
                    style={[styles.map, styles.mapFallback]}
                  >
                    <Text style={styles.fallbackTitle}>
                      Map unavailable
                    </Text>

                    <Text style={styles.fallbackText}>
                      Expo Go or web preview may not support
                      native maps.
                    </Text>

                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() =>
                        openExternalUrl(
                          buildGoogleMapsDirectionsUrl(
                            activeDelivery.destination,
                          ),
                        )
                      }
                    >
                      <Ionicons
                        name="navigate-outline"
                        size={18}
                        color="#334155"
                      />

                      <Text
                        style={styles.secondaryButtonText}
                      >
                        Open in Google Maps
                      </Text>
                    </Pressable>

                    {mapLoadError ? (
                      <Text style={styles.errorText}>
                        {mapLoadError}
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>

              <View style={styles.locationSummary}>
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>Pickup</Text>
                  <Text style={styles.locationValue} numberOfLines={2}>
                    {activeDelivery?.pickupPoint ||
                      getAddressLabel(activeDelivery?.supplierAddresses) ||
                      "Unknown pickup"}
                  </Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>Dropoff</Text>
                  <Text style={styles.locationValue} numberOfLines={2}>
                    {activeDelivery?.destination ||
                      getAddressLabel(activeDelivery?.buyerAddresses) ||
                      "Unknown dropoff"}
                  </Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>Last shared</Text>
                  <Text style={styles.locationValue}>
                    {lastSentAt ? formatDateTime(lastSentAt) : "Not shared yet"}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsWrap}>
                <Pressable
                  style={[
                    styles.primaryButton,
                    (isSharing || isResolvingGps) &&
                      styles.disabledButton,
                  ]}
                  onPress={startSharing}
                  disabled={isSharing || isResolvingGps}
                >
                  {isResolvingGps ? (
                    <ActivityIndicator
                      size="small"
                      color="#ffffff"
                    />
                  ) : (
                    <Ionicons
                      name="play"
                      size={16}
                      color="#ffffff"
                    />
                  )}

                  <Text style={styles.primaryButtonText}>
                    {isResolvingGps
                      ? "Starting..."
                      : "Start GPS Sharing"}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.secondaryButton,
                    !isSharing && styles.disabledButton,
                  ]}
                  onPress={stopSharing}
                  disabled={!isSharing}
                >
                  <Ionicons
                    name="square"
                    size={16}
                    color="#334155"
                  />

                  <Text style={styles.secondaryButtonText}>
                    Stop Sharing
                  </Text>
                </Pressable>

                {currentCoordinate ? (
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={openCurrentPoint}
                  >
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#334155"
                    />

                    <Text
                      style={styles.secondaryButtonText}
                    >
                      Open Current Location
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                No delivery selected
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
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
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
  mapFallback: {
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    gap: 12,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  fallbackText: {
    textAlign: "center",
    color: "#64748b",
  },
  actionsWrap: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  locationSummary: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 10,
  },
  locationRow: {
    gap: 6,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
  },
  locationValue: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "600",
  },
  routeIconStart: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    elevation: 5,
  },
  routeIconCurrent: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    elevation: 5,
  },
  routeIconDropoff: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    elevation: 5,
  },
  routeIconText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 11,
  },
});