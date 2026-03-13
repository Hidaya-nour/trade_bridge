import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";

export default function RetailerSupplierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenWrapper title="Supplier Profile" subtitle="Retailer">
      <View style={styles.container}>
        <Text style={styles.title}>Supplier Profile</Text>
        <Text style={styles.subtitle}>Supplier ID: {id}</Text>
        <Text style={styles.hint}>Detailed supplier screen is queued for next step.</Text>
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