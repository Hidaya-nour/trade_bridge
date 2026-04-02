import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { ISSUE_LABELS, type IssueType } from "./driverData";

export default function DriverIssuesScreen() {
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [submitted, setSubmitted] = useState<string[]>([]);

  const report = () => {
    if (!selectedIssue) return;
    setSubmitted((prev) => [ISSUE_LABELS[selectedIssue], ...prev]);
    setSelectedIssue(null);
    Alert.alert("Issue submitted", "Your report has been recorded.");
  };

  return (
    <ScreenWrapper
      title="Delivery Issue Reporting"
      subtitle="Damaged, delay, failed attempt, breakdown"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headline}>Select an issue type</Text>

        <View style={styles.chipContainer}>
          {(Object.keys(ISSUE_LABELS) as IssueType[]).map((it) => (
            <Pressable
              key={it}
              style={[styles.chip, selectedIssue === it && styles.chipActive]}
              onPress={() => setSelectedIssue(it)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedIssue === it && styles.chipTextActive,
                ]}
              >
                {ISSUE_LABELS[it]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          disabled={!selectedIssue}
          onPress={report}
          style={[styles.button, !selectedIssue && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>Submit Report</Text>
        </Pressable>

        {submitted.length > 0 && (
          <View style={styles.submittedList}>
            <Text style={styles.submittedTitle}>Recent Reports</Text>
            {submitted.map((text, idx) => (
              <Text key={`${text}-${idx}`} style={styles.submittedItem}>
                {text}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, paddingBottom: 40 },
  headline: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#ffffff",
  },
  chipActive: { backgroundColor: "#eff6ff", borderColor: "#93c5fd" },
  chipText: { fontSize: 12, color: "#334155", fontWeight: "700" },
  chipTextActive: { color: "#1d4ed8" },
  button: {
    marginTop: 12,
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#94a3b8" },
  buttonText: { color: "#ffffff", fontWeight: "700" },
  submittedList: {
    marginTop: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
  },
  submittedTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  submittedItem: { fontSize: 11, color: "#334155", marginBottom: 3 },
});
