import React from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function VehicleTab() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vehicle Details</Text>
        <Text style={styles.desc}>Manage the vehicle assigned to your transport profile.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Vehicle Model</Text>
          <TextInput style={styles.input} placeholder="e.g. Isuzu FSR" />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Plate Number</Text>
          <TextInput style={styles.input} placeholder="e.g. AA 2 34567" />
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Max Capacity (Tons)</Text>
            <TextInput style={styles.input} placeholder="5.0" keyboardType="numeric" />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.inputPlaceholder}>
              <Text style={{ color: "#0f172a" }}>Heavy Truck</Text>
              <Ionicons name="chevron-down" size={16} color="#64748b" />
            </View>
          </View>
        </View>
      </View>

      <Pressable style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Vehicle Info</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  header: { gap: 4 },
  title: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  desc: { fontSize: 14, color: "#64748b" },
  card: { 
    backgroundColor: "#fff", 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: "#e2e8f0", 
    gap: 16 
  },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: "700", color: "#334155" },
  input: { 
    borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, 
    padding: 12, fontSize: 15, backgroundColor: "#fcfcfc" 
  },
  inputPlaceholder: {
    borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, 
    padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center"
  },
  row: { flexDirection: "row", gap: 12 },
  saveButton: { backgroundColor: "#1d4ed8", padding: 16, borderRadius: 14, alignItems: "center" },
  saveButtonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});