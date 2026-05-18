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
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
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
  });;

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

    try {
      const { confirmPassword: _, ...payload } = formData;
      await register(payload);
      
      const needsApproval = formData.role === "factory" || formData.role === "distributor";
      
      // Navigate back to login screen passing flash message params
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
    <LinearGradient colors={["#0b63f6", "#052e75"]} style={styles.gradientBackground}>
      <StatusBar barStyle="light-content" />
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
            {/* Header Identity */}
            <View style={styles.headerContainer}>
              <Text style={styles.brandText}>TradeBridge</Text>
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subtitleText}>Join our supply chain network</Text>
            </View>

            {/* Registration Card Form */}
            <View style={styles.containerCard}>
              {displayError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" style={styles.errorIcon} />
                  <Text style={styles.errorText}>{displayError}</Text>
                </View>
              ) : null}

              {/* Full Name Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#8a8f98" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter your full name"
                    placeholderTextColor="#8a8f98"
                    style={styles.input}
                    value={formData.full_name}
                    onChangeText={(val) => setFormData({ ...formData, full_name: val })}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#8a8f98" style={styles.inputIcon} />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="name@company.com"
                    placeholderTextColor="#8a8f98"
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(val) => setFormData({ ...formData, email: val })}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Phone Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#8a8f98" style={styles.inputIcon} />
                  <TextInput
                    keyboardType="phone-pad"
                    placeholder="Enter phone number"
                    placeholderTextColor="#8a8f98"
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(val) => setFormData({ ...formData, phone: val })}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Custom Native Role Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Account Type</Text>
                <Pressable
                  style={[styles.inputContainer, styles.pickerTrigger]}
                  onPress={() => !isLoading && setIsPickerVisible(true)}
                >
                  <Ionicons name="briefcase-outline" size={20} color="#8a8f98" style={styles.inputIcon} />
                  <Text style={[styles.input, { color: formData.role ? "#0f172a" : "#8a8f98" }]}>
                    {roleLabels[formData.role]}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#64748b" />
                </Pressable>
              </View>

              {/* Conditional Business Name Field */}
              {formData.role !== "driver" && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Business Name (Optional)</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="business-outline" size={20} color="#8a8f98" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Enter legal entity name"
                      placeholderTextColor="#8a8f98"
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
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#8a8f98" style={styles.inputIcon} />
                  <TextInput
                    secureTextEntry={!showPassword}
                    placeholder="Choose password"
                    placeholderTextColor="#8a8f98"
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(val) => setFormData({ ...formData, password: val })}
                    editable={!isLoading}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton} hitSlop={12}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
                  </Pressable>
                </View>
                <Text style={styles.hintText}>Min. 8 characters with upper, numbers & symbols</Text>
              </View>

              {/* Confirm Password Field */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#8a8f98" style={styles.inputIcon} />
                  <TextInput
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Repeat password"
                    placeholderTextColor="#8a8f98"
                    style={styles.input}
                    value={formData.confirmPassword}
                    onChangeText={(val) => setFormData({ ...formData, confirmPassword: val })}
                    editable={!isLoading}
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton} hitSlop={12}>
                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6b7280" />
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
                    <ActivityIndicator color="#ffffff" size="small" />
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
                  <Ionicons name="checkmark-circle" size={22} color="#0b63f6" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
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
    marginBottom: 24,
  },
  brandText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#e0f2fe",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: "#bfdbfe",
  },
  containerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#142850",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 14,
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#1e293b",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
  },
  pickerTrigger: {
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
  },
  eyeButton: {
    paddingLeft: 8,
  },
  hintText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
    paddingHorizontal: 2,
  },
  registerButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#0b63f6",
    shadowColor: "#0b63f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  registerButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  registerButtonDisabled: {
    backgroundColor: "#93c5fd",
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  footerText: {
    color: "#64748b",
    fontSize: 13,
  },
  loginLinkText: {
    color: "#0b63f6",
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
    textAlign: "center",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalItemActive: {
    borderBottomColor: "#e2e8f0",
  },
  modalItemText: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "500",
  },
  modalItemTextActive: {
    color: "#0b63f6",
    fontWeight: "600",
  },
});