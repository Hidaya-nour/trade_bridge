import { useLocalSearchParams } from "expo-router";
import { MessageConversationScreen } from "@/features/messages/MessageConversationScreen";

export default function AdminConversationRoute() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();

  return <MessageConversationScreen role="admin" userId={userId ?? ""} />;
}
