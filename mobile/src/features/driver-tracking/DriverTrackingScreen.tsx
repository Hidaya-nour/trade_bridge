import { Platform } from "react-native";
import type { ComponentType } from "react";

let DriverTrackingScreen: ComponentType<any>;

if (Platform.OS === "web") {
  DriverTrackingScreen = require("./DriverTrackingScreen.web").default;
} else {
  DriverTrackingScreen = require("./DriverTrackingScreen.native").default;
}

export default DriverTrackingScreen;
