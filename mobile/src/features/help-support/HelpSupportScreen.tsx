import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { roleConfig } from "@/config/roleConfig";
import { supportService } from "@/services/support.service";
import type { UserRole } from "@/features/auth/auth.types";
import { useAuthStore } from "@/features/auth/auth.store";
import { validateSupportForm } from "@/utils/validation";

interface HelpSupportScreenProps {
  role: UserRole;
}

const faqItems = [
  {
    id: "tracking",
    question: "How do I track order and delivery progress?",
    answer: "Open notifications for quick updates and use the relevant order or delivery pages for the latest status.",
  },
  {
    id: "messages",
    question: "Where can I contact other platform users?",
    answer: "Use the shared messages module to start or continue conversations across supported roles.",
  },
  {
    id: "account",
    question: "How do I update my account details?",
    answer: "Profile changes are available from the shared profile screen and save through the same backend account endpoints as web.",
  },
];

export function HelpSupportScreen({ role }: HelpSupportScreenProps) {
  const user = useAuthStore((state) => state.user);
  const config = roleConfig[role];
  const [form, setForm] = useState({
    name: user?.full_name ?? "",
    email: user?.email ?? "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async () => {
    const nextErrors = validateSupportForm(form);
    setErrors(nextErrors);
    setFeedback(null);

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      setIsSubmitting(true);
      await supportService.submit(form, config.label);
      setFeedback("Your email app opened with a ready-to-send support request.");
      setForm((current) => ({ ...current, subject: "", message: "" }));
    } catch (error: any) {
      setFeedback(error?.message ?? "Could not open support email on this device.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper title="Help & Support" subtitle={config.supportDescription}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-buoy-outline" size={24} color="#1d4ed8" />
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.heroTitle}>Support for {config.label.toLowerCase()} workflows</Text>
            <Text style={styles.heroText}>
              Browse common answers, then contact support with the right context already filled in.
            </Text>
          </View>
        </View>

        <View style={styles.quickActionRow}>
          <Pressable style={styles.quickActionCard} onPress={() => void supportService.call()}>
            <Ionicons name="call-outline" size={20} color="#0f172a" />
            <Text style={styles.quickActionTitle}>Call support</Text>
            <Text style={styles.quickActionText}>Urgent delivery and account help</Text>
          </Pressable>
          <View style={styles.quickActionCard}>
            <Ionicons name="mail-outline" size={20} color="#0f172a" />
            <Text style={styles.quickActionTitle}>Email support</Text>
            <Text style={styles.quickActionText}>{supportService.email}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Role focus areas</Text>
          {config.supportTopics.map((topic) => (
            <View key={topic.id} style={styles.topicRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#16a34a" />
              <View style={styles.topicBody}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicText}>{topic.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Common questions</Text>
          {faqItems.map((item) => (
            <View key={item.id} style={styles.faqCard}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Send a support request</Text>
          <Text style={styles.sectionSubtitle}>
            Your request will open in the device email client so you can review and send it.
          </Text>

          {[
            { key: "name", label: "Name", placeholder: "Your full name" },
            { key: "email", label: "Email", placeholder: "you@example.com" },
            { key: "subject", label: "Subject", placeholder: "What do you need help with?" },
            { key: "message", label: "Message", placeholder: "Describe the issue in detail." },
          ].map((field) => (
            <View key={field.key} style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <TextInput
                style={[
                  styles.input,
                  field.key === "message" && styles.multilineInput,
                  errors[field.key as keyof typeof form] && styles.inputError,
                ]}
                value={form[field.key as keyof typeof form]}
                placeholder={field.placeholder}
                placeholderTextColor="#94a3b8"
                multiline={field.key === "message"}
                onChangeText={(text) => setForm((current) => ({ ...current, [field.key]: text }))}
              />
              {errors[field.key as keyof typeof form] ? (
                <Text style={styles.errorText}>{errors[field.key as keyof typeof form]}</Text>
              ) : null}
            </View>
          ))}

          {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

          <Pressable
            style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
            disabled={isSubmitting}
            onPress={() => void handleSubmit()}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Preparing request..." : "Email support"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#dbeafe",
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBody: {
    flex: 1,
    gap: 6,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  heroText: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 20,
  },
  quickActionRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 8,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  quickActionText: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 20,
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  topicBody: {
    flex: 1,
    gap: 4,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  topicText: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 19,
  },
  faqCard: {
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    padding: 14,
    gap: 6,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  faqAnswer: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
  },
  feedbackText: {
    fontSize: 13,
    color: "#1d4ed8",
    lineHeight: 19,
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 16,
    backgroundColor: "#1d4ed8",
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
});
