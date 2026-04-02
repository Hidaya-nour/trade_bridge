import { ScrollView, StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { DELIVERY_HISTORY } from "./driverData";

export default function DriverHistoryScreen() {
  return (
    <ScreenWrapper title="Delivery History" subtitle="Completed orders list">
      <ScrollView contentContainerStyle={styles.container}>
        {DELIVERY_HISTORY.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.orderCode}>{item.orderCode}</Text>
              <Text style={styles.date}>{item.deliveredAt}</Text>
            </View>
            <Text style={styles.destination}>To: {item.destination}</Text>
            <Text style={[styles.status, item.issueReported ? styles.issue : styles.success]}>
              {item.issueReported ? "Issue reported" : "Completed"}
            </Text>
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, paddingBottom: 40 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  card: { backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", padding: 12 },
  orderCode: { fontSize: 13, fontWeight: "700", color: "#0f172a" },
  date: { fontSize: 11, color: "#64748b" },
  destination: { color: "#334155", fontSize: 12, marginTop: 6 },
  status: { fontWeight: "700", fontSize: 11, marginTop: 4 },
  issue: { color: "#b91c1c" },
  success: { color: "#047857" },
});