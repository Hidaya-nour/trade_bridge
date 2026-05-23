import { Platform } from "react-native";
import Constants from "expo-constants";

const getDefaultApiUrl = () => {
  // Get Expo dev server host (works in LAN/tunnel mode)
  const hostUri = Constants.expoConfig?.hostUri ?? "";
  const host = hostUri.split(":")[0];

  if (host) {
    return `http://${host}:5000/api`;
  }

  // Fallback for manual testing (your PC IP)
  return "http://192.168.137.1:5000/api";
};

// export const API_BASE_URL =
//   (process.env.EXPO_PUBLIC_API_URL ?? getDefaultApiUrl()).replace(/\/+$/, "");
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ??
  "https://enlisted-improving-docile.ngrok-free.dev/api"
).replace(/\/+$/, "");