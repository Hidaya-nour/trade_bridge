import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect, Stack } from "expo-router";
import { roleNavigation } from "@/navigation/roleNavigation";
import { useAuthStore } from "@/features/auth/auth.store";

export default function AuthLayout() {
  const { user, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (user?.status === "active") {
    return <Redirect href={roleNavigation[user.role]} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
