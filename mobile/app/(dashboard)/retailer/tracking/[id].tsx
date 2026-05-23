import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
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

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import driverLocationService, {
  type DriverLocationPoint,
} from "@/features/driver-location/driver-location.service";
import orderService from "@/features/orders/order.service";
import { type Order } from "@/features/orders/order.types";

const POLL_INTERVAL_MS = 5000;
const MIN_MOVEMENT_METERS = 20;
const DEFAULT_REGION = {
  latitude: 9.03,
  longitude: 38.74,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const buildGoogleMapsSearchUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const parseCoord = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseLatLngFromText = (value?: string | null) => {
  if (!value) return null;

  const match = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { lat, lng };
};

type PartyAddresses = NonNullable<Order["buyer"]>["addresses"];

const latestAddressCoords = (addresses?: PartyAddresses) => {
  if (!Array.isArray(addresses) || !addresses.length) return null;

  const sorted = addresses.slice().sort(
    (a, b) =>
      new Date(b?.created_at || 0).getTime() -
      new Date(a?.created_at || 0).getTime(),
  );

  for (const row of sorted) {
    const lat = parseCoord(row?.latitude);
    const lng = parseCoord(row?.longitude);
    if (lat === null || lng === null) continue;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;
    return { lat, lng };
  }

  return null;
};

const addressLabel = (addresses?: PartyAddresses) => {
  const first = Array.isArray(addresses) && addresses.length ? addresses[0] : null;
  return [first?.common_name, first?.subcity, first?.city]
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .join(", ");
};

const toRadians = (deg: number) => (deg * Math.PI) / 180;

const distanceMeters = (
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) => {
  const earthRadius = 6371000;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return earthRadius * y;
};

const filterMeaningfulLocations = (rows: DriverLocationPoint[]) => {
  if (rows.length <= 1) return rows;

  const kept: DriverLocationPoint[] = [rows[0]];
  for (let i = 1; i < rows.length; i += 1) {
    const prev = kept[kept.length - 1];
    const current = rows[i];
    const moved = distanceMeters(
      {
        latitude: Number(prev.latitude),
        longitude: Number(prev.longitude),
      },
      {
        latitude: Number(current.latitude),
        longitude: Number(current.longitude),
      },
    );

    if (moved >= MIN_MOVEMENT_METERS) {
      kept.push(current);
    }
  }

  if (kept[kept.length - 1]?.id !== rows[rows.length - 1]?.id) {
    kept.push(rows[rows.length - 1]);
  }

  return kept;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "No updates yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No updates yet";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
    Alert.alert("Unable to open map", "Google Maps could not be opened.");
  }
};

export default function RetailerTrackingScreen() {
  const router = useRouter();
  const { id: orderId } = useLocalSearchParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [locations, setLocations] = useState<DriverLocationPoint[]>([]);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLib, setMapLib] = useState<any | null>(null);

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

  const filteredLocations = useMemo(
    () => filterMeaningfulLocations(sortedLocations),
    [sortedLocations],
  );

  const latest = filteredLocations[filteredLocations.length - 1] ?? null;
  const firstLocation = filteredLocations[0] ?? null;
  const pickupCoords =
    parseLatLngFromText(order?.delivery?.pickup_location) ||
    latestAddressCoords(order?.supplier?.addresses);
  const dropoffCoords =
    parseLatLngFromText(order?.delivery?.dropoff_location) ||
    latestAddressCoords(order?.buyer?.addresses);
  const startPoint =
    pickupCoords ||
    (firstLocation
      ? {
          lat: Number(firstLocation.latitude),
          lng: Number(firstLocation.longitude),
        }
      : null);
  const currentPoint = latest
    ? {
        lat: Number(latest.latitude),
        lng: Number(latest.longitude),
      }
    : null;
  const center = currentPoint || startPoint || dropoffCoords;
  const routeCoordinates = filteredLocations.map((point) => ({
    latitude: Number(point.latitude),
    longitude: Number(point.longitude),
  }));

  useEffect(() => {
    let mounted = true;
    try {
      const RNMaps = require("react-native-maps");
      if (mounted) {
        setMapLib({
          MapView: RNMaps.default,
          Marker: RNMaps.Marker,
          Polyline: RNMaps.Polyline,
        });
      }
    } catch {
      if (mounted) setMapLib(null);
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    const loadOrder = async () => {
      try {
        setIsLoadingOrder(true);
        setError(null);
        const response = await orderService.getOrderById(String(orderId));
        if (!cancelled) {
          setOrder(response.data?.order || null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load order details.");
        }
      } finally {
        if (!cancelled) setIsLoadingOrder(false);
      }
    };

    void loadOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const loadLocations = async () => {
      try {
        const rows = await driverLocationService.getByOrderId(String(orderId));
        if (!cancelled) {
          setLocations(rows || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load tracking points.");
        }
      } finally {
        if (!cancelled) setIsLoadingLocations(false);
      }
    };

    void loadLocations();
    intervalId = setInterval(loadLocations, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderId]);

  const MapComp = mapLib?.MapView;
  const MarkerComp = mapLib?.Marker;
  const PolylineComp = mapLib?.Polyline;
  const isInitialLoading = (isLoadingOrder || isLoadingLocations) && !center;
  const dropoffLabel =
    order?.delivery?.dropoff_location ||
    addressLabel(order?.buyer?.addresses) ||
    "Not provided";

  return (
    <ScreenWrapper title="Order Tracking" subtitle="Retailer">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Live Order Tracking</Text>
              <Text style={styles.metaText}>
                {order ? `Order #${order.id.slice(0, 8)}` : "Loading order"}
              </Text>
            </View>
            <Pressable style={styles.iconButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back-outline" size={18} color="#334155" />
            </Pressable>
          </View>
          <Text style={styles.metaText}>Driver location updates every 5 seconds.</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Live Map</Text>

          {isInitialLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.emptyTitle}>Loading route points</Text>
            </View>
          ) : MapComp ? (
            <View style={styles.mapWrap}>
              <MapComp
                style={styles.map}
                initialRegion={
                  center
                    ? {
                        latitude: center.lat,
                        longitude: center.lng,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                      }
                    : DEFAULT_REGION
                }
                showsCompass
              >
                {PolylineComp && routeCoordinates.length > 1 && (
                  <PolylineComp
                    coordinates={routeCoordinates}
                    strokeColor="#2563eb"
                    strokeWidth={4}
                  />
                )}
                {PolylineComp && currentPoint && dropoffCoords && (
                  <PolylineComp
                    coordinates={[
                      { latitude: currentPoint.lat, longitude: currentPoint.lng },
                      { latitude: dropoffCoords.lat, longitude: dropoffCoords.lng },
                    ]}
                    strokeColor="#93c5fd"
                    strokeWidth={4}
                  />
                )}

                {MarkerComp && startPoint && (
                  <MarkerComp coordinate={{ latitude: startPoint.lat, longitude: startPoint.lng }}>
                    <View style={styles.routeIconStart}>
                      <Text style={styles.routeIconText}>S</Text>
                    </View>
                  </MarkerComp>
                )}
                {MarkerComp && currentPoint && (
                  <MarkerComp coordinate={{ latitude: currentPoint.lat, longitude: currentPoint.lng }}>
                    <View style={styles.routeIconCurrent}>
                      <Text style={styles.routeIconText}>D</Text>
                    </View>
                  </MarkerComp>
                )}
                {MarkerComp && dropoffCoords && (
                  <MarkerComp coordinate={{ latitude: dropoffCoords.lat, longitude: dropoffCoords.lng }}>
                    <View style={styles.routeIconDropoff}>
                      <Text style={styles.routeIconText}>E</Text>
                    </View>
                  </MarkerComp>
                )}
              </MapComp>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Map unavailable</Text>
              <Text style={styles.metaText}>Native maps are unavailable in this environment.</Text>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Route Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pickup</Text>
            <Text style={styles.infoValue}>
              {order?.delivery?.pickup_location ||
                addressLabel(order?.supplier?.addresses) ||
                "Not provided"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dropoff</Text>
            <Text style={styles.infoValue}>{dropoffLabel}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last update</Text>
            <Text style={styles.infoValue}>{formatDateTime(latest?.recorded_at)}</Text>
          </View>
          <Text style={styles.legendText}>Markers: S pickup, D driver, E dropoff.</Text>

          <View style={styles.actionRow}>
            {currentPoint ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() =>
                  openExternalUrl(buildGoogleMapsSearchUrl(currentPoint.lat, currentPoint.lng))
                }
              >
                <Ionicons name="navigate-outline" size={16} color="#334155" />
                <Text style={styles.secondaryButtonText}>Current Point</Text>
              </Pressable>
            ) : null}
            {dropoffCoords ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() =>
                  openExternalUrl(buildGoogleMapsSearchUrl(dropoffCoords.lat, dropoffCoords.lng))
                }
              >
                <Ionicons name="location-outline" size={16} color="#334155" />
                <Text style={styles.secondaryButtonText}>Dropoff</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, gap: 14 },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbe3ef",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  mapWrap: {
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  map: { width: "100%", height: 340 },
  emptyState: { alignItems: "center", justifyContent: "center", padding: 22, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  metaText: { fontSize: 12, lineHeight: 18, color: "#64748b" },
  errorBox: {
    borderRadius: 14,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 12,
  },
  errorText: { color: "#b91c1c", fontSize: 13, lineHeight: 19 },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 12,
  },
  infoRow: { gap: 4 },
  infoLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
  },
  infoValue: { fontSize: 13, color: "#0f172a", fontWeight: "600" },
  legendText: { fontSize: 12, color: "#64748b" },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  secondaryButton: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  secondaryButtonText: { color: "#334155", fontWeight: "700", fontSize: 12 },
  routeIconStart: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
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
  },
  routeIconText: { color: "#ffffff", fontWeight: "800", fontSize: 11 },
});
