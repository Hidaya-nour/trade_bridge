import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { UserRole } from "@/features/auth/auth.types";
import { roleConfig } from "@/config/roleConfig";
import { useAuthStore } from "@/features/auth/auth.store";
import { useMessageStore } from "@/features/messages/message.store";
import { formatDateTime, getInitials } from "@/utils/format";

interface MessageConversationScreenProps {
  role: UserRole;
  userId: string;
}

export function MessageConversationScreen({ role, userId }: MessageConversationScreenProps) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const scrollViewRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState("");

  const {
    conversations,
    conversationMessages,
    isLoading,
    isSending,
    error,
    fetchConversation,
    fetchUserMessages,
    fetchUnreadCount,
    sendMessage,
    markAsRead,
  } = useMessageStore();

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.participant_id === userId) || null,
    [conversations, userId],
  );

  useEffect(() => {
    if (!userId) return;

    void fetchConversation(userId);
    void fetchUserMessages();
    void fetchUnreadCount();

    const interval = setInterval(() => {
      void fetchConversation(userId);
      void fetchUserMessages();
      void fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchConversation, fetchUnreadCount, fetchUserMessages, userId]);

  useEffect(() => {
    if (!currentUser?.id || !conversationMessages.length) return;

    const unreadIds = conversationMessages
      .filter((message) => message.receiver_id === currentUser.id && !message.is_read)
      .map((message) => message.id);

    if (unreadIds.length) {
      void markAsRead(unreadIds);
    }
  }, [conversationMessages, currentUser?.id, markAsRead]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [conversationMessages.length]);

  const handleSend = async () => {
    const message = draft.trim();
    if (!userId || !message) return;

    const sent = await sendMessage({ receiver_id: userId, message });
    if (sent) {
      setDraft("");
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} color="#0f172a" />
        </Pressable>

        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {getInitials(activeConversation?.participant_name || "Chat")}
          </Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{activeConversation?.participant_name || "Conversation"}</Text>
          <Text style={styles.headerSubtitle}>{roleConfig[role].label} messaging</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      >
        {isLoading && !conversationMessages.length ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.emptyTitle}>Loading conversation</Text>
          </View>
        ) : error && !conversationMessages.length ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={28} color="#dc2626" />
            <Text style={styles.emptyTitle}>Could not load chat</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : conversationMessages.length ? (
          conversationMessages.map((message) => {
            const mine = message.sender_id === currentUser?.id;

            return (
              <View
                key={message.id}
                style={[styles.messageRow, mine ? styles.messageRowMine : styles.messageRowTheirs]}
              >
                <View style={[styles.messageBubble, mine ? styles.myBubble : styles.theirBubble]}>
                  <Text style={[styles.messageText, mine && styles.myMessageText]}>{message.message}</Text>
                  <View style={styles.messageMeta}>
                    <Text style={[styles.messageTime, mine && styles.myMessageTime]}>
                      {formatDateTime(message.created_at)}
                    </Text>
                    {mine ? (
                      <Ionicons
                        name={message.is_read ? "checkmark-done" : "checkmark"}
                        size={13}
                        color="#dbeafe"
                      />
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={28} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>Send the first message to start the conversation.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          style={styles.composerInput}
          multiline
          placeholder="Type your message..."
          placeholderTextColor="#94a3b8"
          value={draft}
          onChangeText={setDraft}
        />
        <Pressable
          style={[styles.sendButton, (!draft.trim() || isSending) && styles.sendButtonDisabled]}
          disabled={!draft.trim() || isSending}
          onPress={() => void handleSend()}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="send" size={18} color="#ffffff" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: { fontSize: 13, fontWeight: "800", color: "#1d4ed8" },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  headerSubtitle: { marginTop: 2, fontSize: 12, color: "#64748b" },
  messageList: { flex: 1 },
  messageListContent: { padding: 16, gap: 10, paddingBottom: 24 },
  messageRow: { flexDirection: "row" },
  messageRowMine: { justifyContent: "flex-end" },
  messageRowTheirs: { justifyContent: "flex-start" },
  messageBubble: {
    maxWidth: "82%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myBubble: { backgroundColor: "#2563eb", borderBottomRightRadius: 6 },
  theirBubble: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderBottomLeftRadius: 6,
  },
  messageText: { fontSize: 14, color: "#0f172a", lineHeight: 20 },
  myMessageText: { color: "#ffffff" },
  messageMeta: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 4,
  },
  messageTime: { fontSize: 10, color: "#64748b" },
  myMessageTime: { color: "#dbeafe" },
  composer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  composerInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0f172a",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: { backgroundColor: "#93c5fd" },
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "700", color: "#0f172a" },
  emptyText: { marginTop: 6, textAlign: "center", fontSize: 13, color: "#64748b", lineHeight: 19 },
});
