import { ScrollView, StyleSheet, Text, View, Linking } from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";

export default function DriverSupportScreen() {
  return (
    <ScreenWrapper title="Help & Support" subtitle="Driver support resources">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Contact Support</Text>
          <Text style={styles.text}>Email: support@tradebridge.app</Text>
          <Text style={styles.text}>Phone: +251 912 345 678</Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL("mailto:support@tradebridge.app")}
          >
            Send email
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Quick Access</Text>
          <Text style={styles.text}>- Settings</Text>
          <Text style={styles.text}>- Notifications</Text>
          <Text style={styles.text}>- Messages</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Self-Help</Text>
          <Text style={styles.text}>- Delivery delay policies</Text>
          <Text style={styles.text}>- Damage claims</Text>
          <Text style={styles.text}>- Vehicle assistance</Text>
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
  link: { marginTop: 8, color: "#1d4ed8", fontWeight: "700" },
});
