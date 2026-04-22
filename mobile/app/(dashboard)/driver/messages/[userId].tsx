import { useLocalSearchParams } from "expo-router";
import { MessageConversationScreen } from "@/features/messages/MessageConversationScreen";

export default function DriverConversationRoute() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();

  return <MessageConversationScreen role="driver" userId={userId ?? ""} />;
}
