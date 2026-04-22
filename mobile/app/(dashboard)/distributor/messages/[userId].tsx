import { useLocalSearchParams } from "expo-router";
import { MessageConversationScreen } from "@/features/messages/MessageConversationScreen";

export default function DistributorConversationRoute() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();

  return <MessageConversationScreen role="distributor" userId={userId ?? ""} />;
}
