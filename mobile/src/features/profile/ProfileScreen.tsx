import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
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
import type { UserRole } from "@/features/auth/auth.types";
import { useProfileForm } from "./useProfileForm";
import { getInitials } from "@/utils/format";
import { useRoleShell } from "@/navigation/RoleShellContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";

interface ProfileScreenProps {
  role: UserRole;
}

const fieldMeta = {
  full_name: { label: "Full name", placeholder: "Enter your full name", keyboardType: "default" as const },
  email: { label: "Email", placeholder: "Email", keyboardType: "email-address" as const },
  phone: { label: "Phone", placeholder: "Enter your phone number", keyboardType: "phone-pad" as const },
  business_name: { label: "Business name", placeholder: "Enter your business name", keyboardType: "default" as const },
  tin_number: { label: "TIN number", placeholder: "Enter your TIN number", keyboardType: "default" as const },
};

export function ProfileScreen({ role }: ProfileScreenProps) {
  const config = roleConfig[role];
  const { setTabBarVisible } = useRoleShell();
  const {
    form,
    setForm,
    errors,
    isEditing,
    isLoading,
    successMessage,
    setIsEditing,
    save,
    user,
    visibleFields,
  } = useProfileForm(role);

  const roleLabel = useMemo(() => `${config.label} account`, [config.label]);
  const { onScroll } = useScrollDirection({
    onDirectionChange: (direction) => setTabBarVisible(direction === "up"),
  });

  return (
    <ScreenWrapper title="Profile" subtitle={config.profileDescription}>
      <ScrollView
        contentContainerStyle={styles.container}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.full_name || config.label)}</Text>
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.heroTitle}>{user?.full_name || `${config.label} user`}</Text>
            <Text style={styles.heroSubtitle}>{roleLabel}</Text>
            <View style={styles.heroBadgeRow}>
              <View style={[styles.badge, user?.verified ? styles.badgeSuccess : styles.badgeMuted]}>
                <Ionicons
                  name={user?.verified ? "shield-checkmark-outline" : "shield-outline"}
                  size={14}
                  color={user?.verified ? "#166534" : "#475569"}
                />
                <Text style={[styles.badgeText, user?.verified ? styles.badgeTextSuccess : styles.badgeTextMuted]}>
                  {user?.verified ? "Verified" : "Pending verification"}
                </Text>
              </View>
            </View>
          </View>
          <Pressable
            style={[styles.editButton, isEditing && styles.editButtonActive]}
            onPress={() => setIsEditing((current) => !current)}
          >
            <Text style={[styles.editButtonText, isEditing && styles.editButtonTextActive]}>
              {isEditing ? "Cancel" : "Edit"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account details</Text>
          <Text style={styles.sectionSubtitle}>
            Update the details other teams and support staff use to identify you.
          </Text>

          {visibleFields.map((field) => {
            if (field === "verification") return null;

            const meta = fieldMeta[field];
            const value = form[field];
            const editable = isEditing && field !== "email";

            return (
              <View key={field} style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{meta.label}</Text>
                <TextInput
                  style={[styles.input, !editable && styles.inputDisabled, errors[field] && styles.inputError]}
                  value={value}
                  editable={editable}
                  keyboardType={meta.keyboardType}
                  placeholder={meta.placeholder}
                  placeholderTextColor="#94a3b8"
                  onChangeText={(text) => setForm((current) => ({ ...current, [field]: text }))}
                />
                {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
              </View>
            );
          })}

          {visibleFields.includes("verification") ? (
            <View style={styles.inlineInfoCard}>
              <Ionicons name="information-circle-outline" size={18} color="#1d4ed8" />
              <Text style={styles.inlineInfoText}>
                Verification status is controlled by the platform and will update automatically after review.
              </Text>
            </View>
          ) : null}

          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
          {isEditing ? (
            <Pressable
              style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
              disabled={isLoading}
              onPress={() => void save()}
            >
              <Text style={styles.primaryButtonText}>{isLoading ? "Saving..." : "Save changes"}</Text>
            </Pressable>
          ) : null}
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
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  heroBody: {
    flex: 1,
    gap: 6,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f8fafc",
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#cbd5e1",
  },
  heroBadgeRow: {
    flexDirection: "row",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeSuccess: {
    backgroundColor: "#dcfce7",
  },
  badgeMuted: {
    backgroundColor: "#e2e8f0",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeTextSuccess: {
    color: "#166534",
  },
  badgeTextMuted: {
    color: "#475569",
  },
  editButton: {
    minWidth: 72,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  editButtonActive: {
    backgroundColor: "#dbeafe",
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  editButtonTextActive: {
    color: "#1d4ed8",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 14,
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
  inputDisabled: {
    backgroundColor: "#f8fafc",
    color: "#64748b",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
  },
  inlineInfoCard: {
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  inlineInfoText: {
    flex: 1,
    fontSize: 13,
    color: "#1e3a8a",
    lineHeight: 19,
  },
  successText: {
    fontSize: 13,
    color: "#166534",
    fontWeight: "600",
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
