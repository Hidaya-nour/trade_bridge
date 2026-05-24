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
// When running on a phone that is not on the same local Wi-Fi as the PC,
// use a public tunnel address such as ngrok instead of the LAN IP.
// The app will use EXPO_PUBLIC_API_URL if provided, otherwise it falls
// back to the hard-coded ngrok URL below.
// If you want to use direct LAN access, set EXPO_PUBLIC_API_URL to a
// reachable address or uncomment the getDefaultApiUrl fallback.// export const API_BASE_URL =
//   (process.env.EXPO_PUBLIC_API_URL ?? getDefaultApiUrl()).replace(/\/+$/, "");
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ??
  "https://enlisted-improving-docile.ngrok-free.dev/api"
).replace(/\/+$/, "");