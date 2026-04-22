import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { getRoleRoute, roleConfig } from "@/config/roleConfig";
import type { UserRole } from "@/features/auth/auth.types";
import { useAuthStore } from "@/features/auth/auth.store";

interface SettingsScreenProps {
  role: UserRole;
}

export function SettingsScreen({ role }: SettingsScreenProps) {
  const router = useRouter();
  const config = roleConfig[role];
  const changePassword = useAuthStore((state) => state.changePassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const quickLinks = [
    { label: "Profile", icon: "person-outline", href: getRoleRoute(role, "profile") },
    { label: "Notifications", icon: "notifications-outline", href: getRoleRoute(role, "notifications") },
    { label: "Messages", icon: "chatbubble-ellipses-outline", href: getRoleRoute(role, "messages") },
    { label: "Help & Support", icon: "help-circle-outline", href: getRoleRoute(role, "support") },
  ];

  const handleChangePassword = async () => {
    setFeedback(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setFeedback("Current password and new password are required.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback("New password and confirm password must match.");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setFeedback("Password changed successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setFeedback(error?.message ?? "Could not change password.");
    }
  };

  return (
    <ScreenWrapper title="Settings" subtitle={`Shared settings structure for the ${config.label.toLowerCase()} role`}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quick access</Text>
          <Text style={styles.sectionSubtitle}>
            These shared destinations stay consistent across roles and can expand without duplicating routes.
          </Text>
          {quickLinks.map((item) => (
            <Pressable
              key={item.href}
              style={styles.linkRow}
              onPress={() => router.push(item.href as never)}
            >
              <View style={styles.linkIcon}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color="#1d4ed8" />
              </View>
              <Text style={styles.linkLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward-outline" size={18} color="#94a3b8" />
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Security</Text>
          <Text style={styles.sectionSubtitle}>Change your password using the same backend account flow as web.</Text>

          {[
            { key: "currentPassword", label: "Current password", placeholder: "Enter current password" },
            { key: "newPassword", label: "New password", placeholder: "Enter new password" },
            { key: "confirmPassword", label: "Confirm password", placeholder: "Repeat new password" },
          ].map((field) => (
            <View key={field.key} style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder={field.placeholder}
                placeholderTextColor="#94a3b8"
                value={passwordForm[field.key as keyof typeof passwordForm]}
                onChangeText={(text) =>
                  setPasswordForm((current) => ({ ...current, [field.key]: text }))
                }
              />
            </View>
          ))}

          {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

          <Pressable
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
            disabled={isLoading}
            onPress={() => void handleChangePassword()}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Saving..." : "Update password"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Prepared for expansion</Text>
          <Text style={styles.sectionSubtitle}>
            Notification preferences, appearance, and role-specific controls can plug into this shared settings shell next.
          </Text>
          <View style={styles.infoPill}>
            <Ionicons name="construct-outline" size={16} color="#92400e" />
            <Text style={styles.infoPillText}>Settings modules are now centralized instead of driver-only.</Text>
          </View>
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
  linkRow: {
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  linkIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  linkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
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
  feedbackText: {
    fontSize: 13,
    color: "#1d4ed8",
  },
  primaryButton: {
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
  infoPill: {
    borderRadius: 14,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoPillText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
  },
});
