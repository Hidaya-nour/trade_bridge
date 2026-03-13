import { StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";

export default function AdminUsersScreen() {
  return (
    <ScreenWrapper title="Users" subtitle="Admin">
      <View style={styles.container}>
        <Text style={styles.title}>User Management</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
});