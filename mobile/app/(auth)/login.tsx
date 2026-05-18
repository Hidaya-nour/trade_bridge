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
  Image,
} from "react-native";
import { useRouter } from "expo-router";
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
            {/* Header / Brand Area */}
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
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.subtitleText}>
                Access your account to continue
              </Text>
            </View>

            {/* Form Container Card */}
            <View style={styles.containerCard}>
              {/* Error Box matching web criteria */}
              {displayError ? (
                <View style={styles.errorBox}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#DC2626"
                    style={styles.errorIcon}
                  />
                  <View style={styles.errorTextContainer}>
                    <Text style={styles.errorText}>{displayError}</Text>
                    {isSuspended && (
                      <Pressable
                        onPress={() => router.push("/account-suspended")}
                        style={styles.appealLink}
                      >
                        <Text style={styles.appealLinkText}>
                          Submit an appeal
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ) : null}

              {/* Email Input Group */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#64748B"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    placeholderTextColor="#94A3B8"
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
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#64748B"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    secureTextEntry={!showPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
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
                      color="#64748B"
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
                    <ActivityIndicator color="#FFFFFF" size="small" />
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
    paddingVertical: 24,
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
    borderRadius: 16, // --radius: 0.75rem = 12px, slightly larger for mobile
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
    backgroundColor: "#FEF2F2", // Destructive light background
    borderColor: "#FECACA",
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  errorIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorText: {
    color: "#DC2626", // --destructive: 0 72% 51%
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  appealLink: {
    marginTop: 8,
  },
  appealLinkText: {
    color: "#6366F1", // --primary
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#0F172A", // --foreground
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 8,
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
  loginButton: {
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
  loginButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  loginButtonDisabled: {
    backgroundColor: "#A5B4FC", // Lighter primary color
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
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
  signUpText: {
    color: "#6366F1", // --primary
    fontSize: 14,
    fontWeight: "600",
  },
});