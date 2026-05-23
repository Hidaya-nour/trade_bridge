import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PreferencesTab() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const PrefOption = ({ icon, label, value, type = "toggle" }: any) => (
    <View style={styles.optionRow}>
      <View style={styles.optionLeft}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={20} color="#1d4ed8" />
        </View>
        <Text style={styles.optionLabel}>{label}</Text>
      </View>
      {type === "toggle" ? (
        <Switch value={value} onValueChange={() => {}} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preferences</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Appearance</Text>
        <PrefOption icon="moon-outline" label="Dark Mode" value={isDarkMode} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Regional</Text>
        <PrefOption icon="globe-outline" label="Language" type="link" />
        <PrefOption icon="cash-outline" label="Currency (ETB)" type="link" />
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#1e40af" />
        <Text style={styles.infoText}>
          Some preferences are synced across your web and mobile sessions.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 24 },
  title: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  section: { gap: 12 },
  sectionHeader: { fontSize: 14, fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 },
  optionRow: { 
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#e2e8f0"
  },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center" },
  optionLabel: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  infoBox: { 
    flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, 
    backgroundColor: "#eff6ff", borderLeftWidth: 4, borderLeftColor: "#1d4ed8" 
  },
  infoText: { flex: 1, fontSize: 13, color: "#1e40af", lineHeight: 18 }
});