import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "../../../../src/components/layout/ScreenWrapper";

export default function RetailerOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenWrapper title="Order Details" subtitle="Retailer">
      <View style={styles.container}>
        <Text style={styles.title}>Order Details</Text>
        <Text style={styles.subtitle}>Order ID: {id}</Text>
        <Text style={styles.hint}>Detailed order screen is queued for next step.</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  subtitle: { marginTop: 8, fontSize: 14, color: "#334155" },
  hint: { marginTop: 8, fontSize: 12, color: "#64748b" },
});