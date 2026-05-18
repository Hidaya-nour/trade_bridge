// RegisterScreen.tsx
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Modal,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/features/auth/auth.store";

type RoleType = "retailer" | "distributor" | "factory" | "driver";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    role: "retailer" as RoleType,
    phone: "",
    business_name: "",
  });

  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const roleLabels: Record<RoleType, string> = {
    retailer: "Retailer",
    distributor: "Distributor",
    factory: "Factory",
    driver: "Driver",
  };

  const handleSubmit = async () => {
    clearError();
    setConfirmError(null);

    if (
      !formData.full_name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.phone.trim()
    ) {
      setConfirmError("All required fields must be filled.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setConfirmError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const {confirmPassword: _, ...payload } = formData;
      await register(payload);
      
      const needsApproval = formData.role === "factory" || formData.role === "distributor";
      
      router.replace({
        pathname: "/login",
        params: {
          message: needsApproval
            ? "Registration successful. Please upload your business license for admin approval."
            : "Registration successful.",
        },
      });
    } catch (err) {
      // Handled globally via auth store
    }
  };

  const displayError = error || confirmError;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardRoot}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Identity with Logo */}
            <View style={styles.headerContainer}>
              <View style={styles.logoWrapper}>
                <View style={styles.logoBadge}>
                  <Image
                    source={require("@/assets/image/logo.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
              <Text style={styles.brandText}>TradeBridge</Text>
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subtitleText}>Join our supply chain network</Text>
            </View>

            {/* Registration Card Form */}
            <View style={styles.containerCard}>
              {displayError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={18} color="#DC2626" style={styles.errorIcon} />
                  <Text style={styles.errorText}>{displayError}</Text>
                </View>
              ) : null}

              {/* Full Name Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name <Text style={styles.requiredStar}>*</Text></Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter your full name"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    value={formData.full_name}
                    onChangeText={(val) => setFormData({ ...formData, full_name: val })}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address <Text style={styles.requiredStar}>*</Text></Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="name@company.com"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(val) => setFormData({ ...formData, email: val })}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Phone Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number <Text style={styles.requiredStar}>*</Text></Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    keyboardType="phone-pad"
                    placeholder="Enter phone number"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(val) => setFormData({ ...formData, phone: val })}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Custom Native Role Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Account Type <Text style={styles.requiredStar}>*</Text></Text>
                <Pressable
                  style={[styles.inputContainer, styles.pickerTrigger]}
                  onPress={() => !isLoading && setIsPickerVisible(true)}
                >
                  <Ionicons name="briefcase-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <Text style={[styles.input, { color: formData.role ? "#0F172A" : "#94A3B8" }]}>
                    {roleLabels[formData.role]}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#64748B" />
                </Pressable>
              </View>

              {/* Conditional Business Name Field */}
              {formData.role !== "driver" && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Business Name (Optional)</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="business-outline" size={20} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Enter legal entity name"
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                      value={formData.business_name}
                      onChangeText={(val) => setFormData({ ...formData, business_name: val })}
                      editable={!isLoading}
                    />
                  </View>
                </View>
              )}

              {/* Password Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Password <Text style={styles.requiredStar}>*</Text></Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    secureTextEntry={!showPassword}
                    placeholder="Choose password"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(val) => setFormData({ ...formData, password: val })}
                    editable={!isLoading}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton} hitSlop={12}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
                  </Pressable>
                </View>
                <Text style={styles.hintText}>Min. 8 characters with upper, numbers & symbols</Text>
              </View>

              {/* Confirm Password Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirm Password <Text style={styles.requiredStar}>*</Text></Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Repeat password"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    value={formData.confirmPassword}
                    onChangeText={(val) => setFormData({ ...formData, confirmPassword: val })}
                    editable={!isLoading}
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton} hitSlop={12}>
                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
                  </Pressable>
                </View>
              </View>

              {/* Action Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.registerButton,
                  pressed && !isLoading ? styles.registerButtonPressed : null,
                  isLoading ? styles.registerButtonDisabled : null,
                ]}
                disabled={isLoading}
                onPress={handleSubmit}
              >
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.registerButtonText}>Creating account...</Text>
                  </View>
                ) : (
                  <Text style={styles.registerButtonText}>Register</Text>
                )}
              </Pressable>

              {/* Footer Alignment Link */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Pressable onPress={() => router.push("/login")} hitSlop={8}>
                  <Text style={styles.loginLinkText}>Login here</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Modern Low-sheet Account Type Modal Picker */}
      <Modal visible={isPickerVisible} transparent={true} animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setIsPickerVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Account Type</Text>
            {(Object.keys(roleLabels) as RoleType[]).map((roleKey) => (
              <Pressable
                key={roleKey}
                style={[
                  styles.modalItem,
                  formData.role === roleKey && styles.modalItemActive,
                ]}
                onPress={() => {
                  setFormData({ ...formData, role: roleKey });
                  setIsPickerVisible(false);
                }}
              >
                <Text style={[styles.modalItemText, formData.role === roleKey && styles.modalItemTextActive]}>
                  {roleLabels[roleKey]}
                </Text>
                {formData.role === roleKey && (
                  <Ionicons name="checkmark-circle" size={22} color="#6366F1" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // --background: 220 20% 98%
  },
  safeArea: {
    flex: 1,
  },
  keyboardRoot: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  brandText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6366F1", // --primary: 250 60% 55%
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A", // --foreground: 222 47% 11%
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 15,
    color: "#64748B", // --muted-foreground: 215 16% 47%
    textAlign: "center",
  },
  containerCard: {
    backgroundColor: "#FFFFFF", // --card: 0 0% 100%
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0", // --border: 220 13% 91%
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    color: "#DC2626", // --destructive: 0 72% 51%
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    fontWeight: "500",
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    color: "#0F172A", // --foreground
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 8,
  },
  requiredStar: {
    color: "#DC2626",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0", // --border: 220 13% 91%
    borderRadius: 12,
    backgroundColor: "#F8FAFC", // --background
    paddingHorizontal: 14,
  },
  pickerTrigger: {
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0F172A", // --foreground
  },
  eyeButton: {
    paddingLeft: 10,
    paddingVertical: 10,
  },
  hintText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 6,
    paddingHorizontal: 2,
  },
  registerButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#6366F1", // --primary: 250 60% 55%
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  registerButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  registerButtonDisabled: {
    backgroundColor: "#A5B4FC",
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: "#FFFFFF", // --primary-foreground: 210 40% 98%
    fontSize: 16,
    fontWeight: "600",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#64748B", // --muted-foreground: 215 16% 47%
    fontSize: 14,
  },
  loginLinkText: {
    color: "#6366F1", // --primary
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 20,
    textAlign: "center",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalItemActive: {
    borderBottomColor: "#E2E8F0",
  },
  modalItemText: {
    fontSize: 16,
    color: "#475569",
    fontWeight: "500",
  },
  modalItemTextActive: {
    color: "#6366F1",
    fontWeight: "600",
  },
});