import { useLocalSearchParams } from "expo-router";
import { MessageConversationScreen } from "@/features/messages/MessageConversationScreen";

export default function FactoryConversationRoute() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();

  return <MessageConversationScreen role="factory" userId={userId ?? ""} />;
}
