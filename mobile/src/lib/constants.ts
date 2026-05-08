import { Platform } from "react-native";
import Constants from "expo-constants";

const getDefaultApiUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000/api";
  }

  if (Platform.OS === "ios") {
    return "http://localhost:5000/api";
  }

  const hostUri = Constants.expoConfig?.hostUri ?? "";
  const host = hostUri.split(":")[0];

  if (host) {
    return `http://${host}:5000/api`;
  }

  return "http://localhost:5000/api";
};

export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL ?? getDefaultApiUrl()).replace(/\/+$/, "");