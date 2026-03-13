import { StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";

export default function RetailerCompareScreen() {
  return (
    <ScreenWrapper title="Compare Suppliers" subtitle="Retailer">
      <View style={styles.container}>
        <Text style={styles.title}>Compare Suppliers</Text>
        <Text style={styles.subtitle}>This page is queued for the next implementation step.</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  subtitle: { marginTop: 8, fontSize: 13, color: "#64748b", textAlign: "center" },
});