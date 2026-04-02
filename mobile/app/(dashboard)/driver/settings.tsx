import { ScrollView, StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";

export default function DriverSettingsScreen() {
  return (
    <ScreenWrapper
      title="Driver Settings"
      subtitle="Profile and notification settings"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>General settings</Text>
          <Text style={styles.text}>- Update profile</Text>
          <Text style={styles.text}>- Manage notification preferences</Text>
          <Text style={styles.text}>- Privacy</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, paddingBottom: 40 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
  },
  title: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  text: { fontSize: 12, color: "#334155", marginTop: 4 },
});
