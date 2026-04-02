import { ScrollView, StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { useAuthStore } from "@/features/auth/auth.store";

export default function DriverProfileScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <ScreenWrapper
      title="Driver Profile"
      subtitle="Personal and vehicle summary"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.full_name ?? "Driver Name"}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Contact</Text>
          <Text style={styles.value}>{user?.phone ?? "Phone not set"}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Vehicle</Text>
          <Text style={styles.value}>Isuzu NPR - Box Truck</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Licence Plate</Text>
          <Text style={styles.value}>AA-34567</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, paddingBottom: 40 },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
  },
  label: { fontSize: 11, color: "#64748b", fontWeight: "600" },
  value: { fontSize: 13, color: "#0f172a", fontWeight: "700", marginTop: 4 },
});
