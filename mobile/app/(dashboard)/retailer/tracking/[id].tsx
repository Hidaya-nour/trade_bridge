import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import driverLocationService, { type DriverLocationPoint } from "@/features/driver-location/driver-location.service";

const POLL_INTERVAL_MS = 5000;

const buildGoogleMapsSearchUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

export default function RetailerTrackingScreen() {
  const { id: orderId } = useLocalSearchParams<{ id: string }>();

  const [locations, setLocations] = useState<DriverLocationPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mapLib, setMapLib] = useState<any | null>(null);

  const sortedLocations = useMemo(
    () =>
      locations
        .slice()
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()),
    [locations],
  );

  const latest = sortedLocations[sortedLocations.length - 1] ?? null;

  useEffect(() => {
    let mounted = true;
    try {
      const RNMaps = require('react-native-maps');
      if (mounted) {
        setMapLib({ MapView: RNMaps.default, Marker: RNMaps.Marker, Polyline: RNMaps.Polyline });
      }
    } catch (err: any) {
      setMapLib(null);
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const rows = await driverLocationService.getByOrderId(String(orderId));
        if (cancelled) return;
        setLocations(rows || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load tracking points.');
        setLocations([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
    intervalId = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderId]);

  const openExternalUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch {}
  };

  const MapComp = mapLib?.MapView;
  const MarkerComp = mapLib?.Marker;
  const PolylineComp = mapLib?.Polyline;

  return (
    <ScreenWrapper title="Order Tracking" subtitle="Retailer">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Live Map</Text>

          {isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.emptyTitle}>Loading route points</Text>
            </View>
          ) : MapComp ? (
            <View style={styles.mapWrap}>
              <MapComp
                style={styles.map}
                initialRegion={
                  latest
                    ? { latitude: Number(latest.latitude), longitude: Number(latest.longitude), latitudeDelta: 0.02, longitudeDelta: 0.02 }
                    : { latitude: 9.03, longitude: 38.74, latitudeDelta: 0.08, longitudeDelta: 0.08 }
                }
              >
                {PolylineComp && sortedLocations.length > 1 && (
                  <PolylineComp
                    coordinates={sortedLocations.map((p) => ({ latitude: Number(p.latitude), longitude: Number(p.longitude) }))}
                    strokeColor="#2563eb"
                    strokeWidth={4}
                  />
                )}

                {MarkerComp && sortedLocations.length > 0 && (
                  <MarkerComp coordinate={{ latitude: Number(sortedLocations[sortedLocations.length - 1].latitude), longitude: Number(sortedLocations[sortedLocations.length - 1].longitude) }} />
                )}
              </MapComp>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last point</Text>
                <Text style={styles.infoValue}>
                  {latest ? `${Number(latest.latitude).toFixed(6)}, ${Number(latest.longitude).toFixed(6)}` : 'No points yet'}
                </Text>
                {latest ? (
                  <Pressable style={styles.secondaryButton} onPress={() => openExternalUrl(buildGoogleMapsSearchUrl(Number(latest.latitude), Number(latest.longitude)))}>
                    <Text style={styles.secondaryButtonText}>Open in Google Maps</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Map unavailable</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  sectionCard: { backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 16, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  mapWrap: { overflow: 'hidden', borderRadius: 18, borderWidth: 1, borderColor: '#bfdbfe' },
  map: { width: '100%', height: 320 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  infoRow: { marginTop: 12, gap: 8 },
  infoLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  infoValue: { fontSize: 13, color: '#0f172a', fontWeight: '600', marginTop: 4 },
  secondaryButton: { marginTop: 8, backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 10, alignItems: 'center' },
  secondaryButtonText: { color: '#334155', fontWeight: '700' },
});
