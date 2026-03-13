import { StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";

export default function DriverDashboardScreen() {
  return (
    <ScreenWrapper title="Driver Dashboard" subtitle="Delivery operations">
      <View style={styles.container}>
        <Text style={styles.title}>Driver Dashboard</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
});