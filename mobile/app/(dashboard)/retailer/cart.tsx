import { StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "../../../src/components/layout/ScreenWrapper";

export default function RetailerCartScreen() {
  return (
    <ScreenWrapper title="Cart" subtitle="Retailer">
      <View style={styles.container}>
        <Text style={styles.title}>Retailer Cart</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
});