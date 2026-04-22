import { create } from "zustand";
import { useAuthStore } from "@/features/auth/auth.store";
import messageService from "./message.service";
import type {
  ChatContact,
  Conversation,
  Message,
  SendMessageData,
} from "./message.types";

interface MessageState {
  messages: Message[];
  conversationMessages: Message[];
  conversations: Conversation[];
  currentConversationUserId: string | null;
  contacts: ChatContact[];
  contactsLoading: boolean;
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  fetchUserMessages: () => Promise<void>;
  fetchConversation: (userId: string, orderId?: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  fetchChatContacts: (search?: string, role?: string) => Promise<void>;
  sendMessage: (data: SendMessageData) => Promise<Message | null>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  startChatWithUser: (userId: string) => Promise<void>;
  setCurrentConversation: (userId: string | null) => void;
  clearError: () => void;
}

const getParticipantId = (message: Message, currentUserId: string) =>
  message.sender_id === currentUserId ? message.receiver_id : message.sender_id;

const getParticipantName = (message: Message, participantId: string) => {
  if (message.sender_id === participantId) {
    return message.sender?.full_name || message.sender?.email || "Unknown user";
  }

  return message.receiver?.full_name || message.receiver?.email || "Unknown user";
};

const toConversations = (messages: Message[], currentUserId: string): Conversation[] => {
  const map = new Map<string, Conversation>();

  for (const message of messages) {
    const participantId = getParticipantId(message, currentUserId);
    const existing = map.get(participantId);
    const unreadForConversation =
      message.receiver_id === currentUserId && !message.is_read ? 1 : 0;

    if (!existing) {
      map.set(participantId, {
        participant_id: participantId,
        participant_name: getParticipantName(message, participantId),
        last_message: message.message,
        last_message_time: message.created_at,
        unread_count: unreadForConversation,
        order_id: message.order_id || null,
      });
      continue;
    }

    if (
      new Date(message.created_at).getTime() >
      new Date(existing.last_message_time).getTime()
    ) {
      existing.last_message = message.message;
      existing.last_message_time = message.created_at;
      existing.order_id = message.order_id || existing.order_id || null;
      existing.participant_name = getParticipantName(message, participantId);
    }

    existing.unread_count += unreadForConversation;
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.last_message_time).getTime() -
      new Date(a.last_message_time).getTime(),
  );
};

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  conversationMessages: [],
  conversations: [],
  currentConversationUserId: null,
  contacts: [],
  contactsLoading: false,
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  error: null,

  fetchUserMessages: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await messageService.getUserMessages();
      const currentUserId = useAuthStore.getState().user?.id;
      const messages = response.data || [];

      set({
        messages,
        conversations: currentUserId ? toConversations(messages, currentUserId) : [],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to load messages.",
        isLoading: false,
      });
    }
  },

  fetchConversation: async (userId: string, orderId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await messageService.getConversation(userId, orderId);
      set({
        conversationMessages: response.data || [],
        currentConversationUserId: userId,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to load conversation.",
        isLoading: false,
      });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await messageService.getUnreadCount();
      set({ unreadCount: response.data.unreadCount || 0 });
    } catch {
      set({ unreadCount: 0 });
    }
  },

  fetchChatContacts: async (search?: string, role?: string) => {
    set({ contactsLoading: true, error: null });
    try {
      const response = await messageService.getChatContacts(search, role);
      set({ contacts: response.data || [], contactsLoading: false });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to load chat contacts.",
        contactsLoading: false,
      });
    }
  },

  sendMessage: async (data: SendMessageData) => {
    set({ isSending: true, error: null });
    try {
      const response = await messageService.send(data);
      const sentMessage = response.data.message;
      const currentUserId = useAuthStore.getState().user?.id;
      const nextMessages = [sentMessage, ...get().messages];

      set((state) => ({
        messages: nextMessages,
        conversations: currentUserId
          ? toConversations(nextMessages, currentUserId)
          : state.conversations,
        conversationMessages:
          state.currentConversationUserId === data.receiver_id
            ? [...state.conversationMessages, sentMessage]
            : state.conversationMessages,
        isSending: false,
      }));

      return sentMessage;
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to send message.",
        isSending: false,
      });
      return null;
    }
  },

  markAsRead: async (messageIds: string[]) => {
    if (!messageIds.length) return;

    try {
      await messageService.markAsRead({ messageIds });
      const markedIds = new Set(messageIds);
      const currentUserId = useAuthStore.getState().user?.id;
      const updatedMessages = get().messages.map((message) =>
        markedIds.has(message.id) ? { ...message, is_read: true } : message,
      );
      const updatedConversationMessages = get().conversationMessages.map((message) =>
        markedIds.has(message.id) ? { ...message, is_read: true } : message,
      );

      set({
        messages: updatedMessages,
        conversationMessages: updatedConversationMessages,
        conversations: currentUserId
          ? toConversations(updatedMessages, currentUserId)
          : get().conversations,
      });

      await get().fetchUnreadCount();
    } catch (error: any) {
      set({
        error: error?.response?.data?.message || "Failed to mark messages as read.",
      });
    }
  },

  startChatWithUser: async (userId: string) => {
    const alreadyExists = get().conversations.some(
      (conversation) => conversation.participant_id === userId,
    );

    if (!alreadyExists) {
      const contact = get().contacts.find((item) => item.id === userId);
      const placeholder: Conversation = {
        participant_id: userId,
        participant_name: contact?.full_name || "New chat",
        last_message: "",
        last_message_time: new Date().toISOString(),
        unread_count: 0,
        order_id: null,
      };

      set((state) => ({
        conversations: [placeholder, ...state.conversations],
        currentConversationUserId: userId,
        conversationMessages: [],
      }));
    } else {
      set({ currentConversationUserId: userId });
    }

    await get().fetchConversation(userId);
  },

  setCurrentConversation: (userId: string | null) =>
    set({ currentConversationUserId: userId }),

  clearError: () => set({ error: null }),
}));
