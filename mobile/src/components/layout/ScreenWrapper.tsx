import { PropsWithChildren } from "react";
import { View } from "react-native";

export default function ScreenWrapper({ children }: PropsWithChildren) {
  return <View>{children}</View>;
}
