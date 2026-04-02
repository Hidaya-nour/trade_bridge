import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "@/components/layout/ScreenWrapper";

export default function DriverTrackingScreen() {
  return (
    <ScreenWrapper title="Live Tracking" subtitle="Real-time location and route">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={36} color="#94a3b8" />
          <Text style={styles.hint}>Live map view will be available here.</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Current vehicle status</Text>
          <Text style={styles.infoText}>Connected • Tracking updates every 15 seconds</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, paddingBottom: 40 },
  mapPlaceholder: { height: 220, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", gap: 8 },
  hint: { color: "#64748b", fontSize: 12 },
  infoCard: { backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", padding: 12 },
  infoTitle: { fontSize: 13, fontWeight: "700", color: "#0f172a" },
  infoText: { color: "#334155", fontSize: 12, marginTop: 4 },
});