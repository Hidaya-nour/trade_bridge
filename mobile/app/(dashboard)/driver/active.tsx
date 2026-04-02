import { ScrollView, StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { ACTIVE_DELIVERIES } from "./driverData";

export default function DriverActiveScreen() {
  return (
    <ScreenWrapper title="Active Deliveries" subtitle="Current assigned orders">
      <ScrollView contentContainerStyle={styles.container}>
        {ACTIVE_DELIVERIES.map((delivery) => (
          <View key={delivery.id} style={styles.card}>
            <Text style={styles.orderCode}>{delivery.orderCode}</Text>
            <Text style={styles.details}>
              {delivery.supplierName} → {delivery.buyerName}
            </Text>
            <Text style={styles.details}>
              ETA: {delivery.etaMinutes} min • {delivery.routeProgress}%
            </Text>
            <Text style={styles.status}>
              {delivery.status.replace("_", " ")}
            </Text>
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, paddingBottom: 40 },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  orderCode: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  details: { fontSize: 12, color: "#334155", marginTop: 4 },
  status: { marginTop: 6, fontSize: 11, fontWeight: "700", color: "#1d4ed8" },
});
