import { StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "../../../src/components/layout/ScreenWrapper";

export default function RetailerOrdersScreen() {
  return (
    <ScreenWrapper title="Orders" subtitle="Retailer">
      <View style={styles.container}>
        <Text style={styles.title}>Retailer Orders</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
});