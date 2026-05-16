import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/features/auth/auth.store";
import { roleNavigation } from "@/navigation/roleNavigation";

export default function IndexPage() {
  const { user, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (!user || user.status !== "active") {
    return <Redirect href="/login" />;
  }

  return <Redirect href={roleNavigation[user.role]} />;
}
