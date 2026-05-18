// LoginScreen.tsx
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
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/features/auth/auth.store";
import { roleNavigation } from "@/navigation/roleNavigation";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const { login, logout, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    setLocalError("");
    clearError();

    if (!email.trim() || !password) {
      setLocalError("Email and password are required");
      return;
    }

    try {
      const { user } = await login(email.trim(), password);
      if (user.status !== "active") {
        await logout();
        setLocalError("Your account is not active yet. Please wait for approval or contact support.");
        return;
      }
      const nextRoute = roleNavigation[user.role];
      router.replace(nextRoute);
    } catch {
      // Store error is displayed in UI natively
    }
  };

  const displayError = localError || error;
  const isSuspended = displayError?.toLowerCase().includes("suspended");

  return (
    <LinearGradient
      colors={["#0b63f6", "#052e75"]}
      style={styles.gradientBackground}
    >
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
            {/* Header / Brand Area */}
            <View style={styles.headerContainer}>
              <View style={styles.logoBadge}>
                <Ionicons name="git-merge-outline" size={32} color="#0b63f6" />
              </View>
              <Text style={styles.brandText}>TradeBridge</Text>
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.subtitleText}>Access your account to continue</Text>
            </View>

            {/* Form Container Card */}
            <View style={styles.containerCard}>
              
              {/* Error Box matching web criteria */}
              {displayError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" style={styles.errorIcon} />
                  <View style={styles.errorTextContainer}>
                    <Text style={styles.errorText}>{displayError}</Text>
                    {isSuspended && (
                      <Pressable 
                        onPress={() => router.push("/account-suspended")}
                        style={styles.appealLink}
                      >
                        <Text style={styles.appealLinkText}>Submit an appeal</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ) : null}

              {/* Email Input Group */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#8a8f98" style={styles.inputIcon} />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    placeholderTextColor="#8a8f98"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password Input Group */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#8a8f98" style={styles.inputIcon} />
                  <TextInput
                    secureTextEntry={!showPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#8a8f98"
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    disabled={isLoading}
                    style={styles.eyeButton}
                    hitSlop={12}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#6b7280"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Login Action Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && !isLoading ? styles.loginButtonPressed : null,
                  isLoading ? styles.loginButtonDisabled : null,
                ]}
                disabled={isLoading}
                onPress={handleLogin}
              >
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.loginButtonText}>Logging in...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </Pressable>

              {/* Footer Alternative Web Link Alignment */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Pressable onPress={() => router.push("/register")} hitSlop={8}>
                  <Text style={styles.signUpText}>Sign up</Text>
                </Pressable>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    paddingVertical: 24,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  brandText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e0f2fe",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 15,
    color: "#bfdbfe",
    textAlign: "center",
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
    alignItems: "flex-start",
  },
  errorIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 14,
    lineHeight: 18,
  },
  appealLink: {
    marginTop: 6,
  },
  appealLinkText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    color: "#1e293b",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0f172a",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0f172a",
  },
  eyeButton: {
    paddingLeft: 10,
    paddingVertical: 10,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#0b63f6",
    shadowColor: "#0b63f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  loginButtonDisabled: {
    backgroundColor: "#93c5fd",
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
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
    marginTop: 20,
  },
  footerText: {
    color: "#64748b",
    fontSize: 14,
  },
  signUpText: {
    color: "#0b63f6",
    fontSize: 14,
    fontWeight: "600",
  },
});