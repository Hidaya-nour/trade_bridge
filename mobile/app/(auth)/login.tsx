import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
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
      // Store error is displayed in UI.
    }
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.brand}>TradeBridge</Text>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Access your account to continue</Text>

          {displayError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
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
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#6b7280"
                />
              </Pressable>
            </View>
          </View>

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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  keyboardRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    color: "#4b5563",
    marginTop: 6,
    marginBottom: 22,
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 13,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    color: "#111827",
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: "#111827",
  },
  passwordContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: "#111827",
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: "#0b63f6",
  },
  loginButtonPressed: {
    opacity: 0.9,
  },
  loginButtonDisabled: {
    backgroundColor: "#6b9dfa",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
