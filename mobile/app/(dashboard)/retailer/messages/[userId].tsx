import { useLocalSearchParams } from "expo-router";
import { MessageConversationScreen } from "@/features/messages/MessageConversationScreen";

export default function RetailerConversationRoute() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();

  return <MessageConversationScreen role="retailer" userId={userId ?? ""} />;
}
