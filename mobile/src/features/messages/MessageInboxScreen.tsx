import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ScreenWrapper from "@/components/layout/ScreenWrapper";
import { allChatRoles, getRoleRoute, roleConfig } from "@/config/roleConfig";
import type { UserRole } from "@/features/auth/auth.types";
import { useMessageStore } from "@/features/messages/message.store";
import { formatDateTime, getInitials } from "@/utils/format";

interface MessageInboxScreenProps {
  role: UserRole;
}

export function MessageInboxScreen({ role }: MessageInboxScreenProps) {
  const router = useRouter();
  const config = roleConfig[role];
  const [searchQuery, setSearchQuery] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [contactRole, setContactRole] = useState<string>("all");

  const {
    conversations,
    contacts,
    unreadCount,
    isLoading,
    contactsLoading,
    error,
    fetchUserMessages,
    fetchUnreadCount,
    fetchChatContacts,
    startChatWithUser,
    clearError,
  } = useMessageStore();

  useEffect(() => {
    void fetchUserMessages();
    void fetchUnreadCount();

    const interval = setInterval(() => {
      void fetchUserMessages();
      void fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount, fetchUserMessages]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;

    return conversations.filter((conversation) =>
      [conversation.participant_name, conversation.last_message].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [conversations, searchQuery]);

  const openNewChat = async () => {
    setIsComposerOpen(true);
    await fetchChatContacts();
  };

  const searchContacts = async (nextRole: string, query: string) => {
    await fetchChatContacts(query.trim() || undefined, nextRole === "all" ? undefined : nextRole);
  };

  return (
    <ScreenWrapper title="Messages" subtitle={config.messagesDescription}>
      <View style={styles.screen}>
        <View style={styles.searchCard}>
          <Ionicons name="search-outline" size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Pressable style={styles.composeButton} onPress={() => void openNewChat()}>
            <Ionicons name="add-outline" size={18} color="#ffffff" />
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryValue}>{conversations.length}</Text>
            <Text style={styles.summaryLabel}>Conversations</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryValue}>{unreadCount}</Text>
            <Text style={styles.summaryLabel}>Unread</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                clearError();
                void fetchUserMessages();
                void fetchUnreadCount();
              }}
            />
          }
        >
          {isLoading && conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.emptyTitle}>Loading conversations</Text>
              <Text style={styles.emptyText}>Fetching the latest shared inbox data.</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={28} color="#dc2626" />
              <Text style={styles.emptyTitle}>Could not load messages</Text>
              <Text style={styles.emptyText}>{error}</Text>
            </View>
          ) : filteredConversations.length ? (
            filteredConversations.map((conversation) => (
              <Pressable
                key={conversation.participant_id}
                style={styles.conversationCard}
                onPress={() =>
                  router.push(
                    `${getRoleRoute(role, "messages")}/${conversation.participant_id}` as never,
                  )
                }
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(conversation.participant_name)}</Text>
                </View>

                <View style={styles.conversationBody}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>{conversation.participant_name}</Text>
                    <Text style={styles.conversationTime}>
                      {formatDateTime(conversation.last_message_time)}
                    </Text>
                  </View>
                  <Text style={styles.conversationPreview} numberOfLines={2}>
                    {conversation.last_message || "Start the conversation"}
                  </Text>
                </View>

                {conversation.unread_count > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{conversation.unread_count}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptyText}>
                Start a new chat with any supported role from the shared directory.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <Modal
        animationType="slide"
        visible={isComposerOpen}
        onRequestClose={() => setIsComposerOpen(false)}
      >
        <View style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>New Chat</Text>
              <Text style={styles.modalSubtitle}>Start messaging any platform role from one shared flow.</Text>
            </View>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setIsComposerOpen(false)}
            >
              <Ionicons name="close-outline" size={22} color="#0f172a" />
            </Pressable>
          </View>

          <View style={styles.modalSearchCard}>
            <Ionicons name="search-outline" size={18} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts"
              placeholderTextColor="#94a3b8"
              value={contactSearch}
              onChangeText={setContactSearch}
              onSubmitEditing={() => void searchContacts(contactRole, contactSearch)}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.roleFilterRow}
          >
            {["all", ...allChatRoles].map((item) => (
              <Pressable
                key={item}
                style={[styles.roleChip, contactRole === item && styles.roleChipActive]}
                onPress={() => {
                  setContactRole(item);
                  void searchContacts(item, contactSearch);
                }}
              >
                <Text style={[styles.roleChipText, contactRole === item && styles.roleChipTextActive]}>
                  {item === "all" ? "All" : roleConfig[item as UserRole].label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <ScrollView contentContainerStyle={styles.contactList}>
            {contactsLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.emptyTitle}>Loading contacts</Text>
              </View>
            ) : contacts.length ? (
              contacts.map((contact) => (
                <Pressable
                  key={contact.id}
                  style={styles.contactCard}
                  onPress={() => {
                    void startChatWithUser(contact.id);
                    setIsComposerOpen(false);
                    router.push(`${getRoleRoute(role, "messages")}/${contact.id}` as never);
                  }}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(contact.full_name)}</Text>
                  </View>
                  <View style={styles.contactBody}>
                    <Text style={styles.conversationName}>{contact.full_name}</Text>
                    <Text style={styles.contactMeta} numberOfLines={1}>
                      {contact.business_name || contact.email}
                    </Text>
                  </View>
                  <View style={styles.contactRoleBadge}>
                    <Text style={styles.contactRoleText}>{roleConfig[contact.role].label}</Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={28} color="#94a3b8" />
                <Text style={styles.emptyTitle}>No contacts found</Text>
                <Text style={styles.emptyText}>Try a different name or role filter.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 14 },
  searchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#0f172a" },
  composeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryChip: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
  },
  summaryValue: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  summaryLabel: { marginTop: 4, fontSize: 12, color: "#64748b" },
  listContent: { paddingBottom: 32, gap: 10 },
  conversationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "800", color: "#1d4ed8" },
  conversationBody: { flex: 1 },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  conversationName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  conversationTime: { fontSize: 11, color: "#64748b" },
  conversationPreview: { marginTop: 4, fontSize: 12, color: "#475569", lineHeight: 18 },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: { color: "#ffffff", fontSize: 11, fontWeight: "700" },
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
  modalScreen: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 56,
    paddingHorizontal: 16,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  modalTitle: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  modalSubtitle: { marginTop: 4, fontSize: 13, color: "#64748b" },
  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modalSearchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleFilterRow: { gap: 8, paddingBottom: 4 },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  roleChipActive: { backgroundColor: "#0f172a", borderColor: "#0f172a" },
  roleChipText: { fontSize: 12, fontWeight: "700", color: "#334155" },
  roleChipTextActive: { color: "#ffffff" },
  contactList: { paddingBottom: 32, gap: 10 },
  contactCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactBody: { flex: 1 },
  contactMeta: { marginTop: 3, fontSize: 12, color: "#64748b" },
  contactRoleBadge: {
    borderRadius: 999,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  contactRoleText: { fontSize: 10, fontWeight: "700", color: "#1d4ed8" },
});
