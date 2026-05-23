import React from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";

export default function SecurityTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security</Text>
      <Text style={styles.desc}>Update your password to keep your account secure.</Text>

      {["Current Password", "New Password", "Confirm Password"].map((label) => (
        <View key={label} style={styles.fieldGroup}>
          <Text style={styles.label}>{label}</Text>
          <TextInput style={styles.input} secureTextEntry placeholder={`Enter ${label}`} />
        </View>
      ))}

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Update Password</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  title: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  desc: { fontSize: 13, color: "#64748b", marginBottom: 10 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, padding: 12, backgroundColor: "#fff" },
  button: { backgroundColor: "#1d4ed8", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "700" }
});