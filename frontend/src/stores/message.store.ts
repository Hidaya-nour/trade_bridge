import { create } from 'zustand';
import messageService from '@/services/message.service';
import { useAuthStore } from '@/stores/auth.store';
import type { ChatContact, Conversation, Message, SendMessageData } from '@/types/message.types';

interface MessageState {
  messages: Message[];
  conversationMessages: Message[];
  conversations: Conversation[];
  currentConversationUserId: string | null;
  currentMessage: Message | null;
  contacts: ChatContact[];
  contactsLoading: boolean;
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  fetchUserMessages: () => Promise<void>;
  fetchConversation: (userId: string, orderId?: string) => Promise<void>;
  fetchMessageById: (id: string) => Promise<Message | null>;
  fetchUnreadCount: () => Promise<void>;
  sendMessage: (data: SendMessageData) => Promise<Message | null>;
  markAsRead: (messageIds: string[]) => Promise<boolean>;
  fetchChatContacts: (search?: string, role?: string) => Promise<void>;
  fetchChatContactById: (userId: string) => Promise<ChatContact | null>;
  startChatWithUser: (userId: string) => Promise<void>;
  setCurrentConversation: (userId: string | null) => void;
  clearError: () => void;
}

const getParticipantId = (message: Message, currentUserId: string): string =>
  message.sender_id === currentUserId ? message.receiver_id : message.sender_id;

const getParticipantName = (message: Message, participantId: string): string => {
  if (message.sender_id === participantId) {
    return message.sender?.full_name || message.sender?.email || 'Unknown user';
  }
  return message.receiver?.full_name || message.receiver?.email || 'Unknown user';
};

const toConversations = (messages: Message[], currentUserId: string): Conversation[] => {
  const map = new Map<string, Conversation>();

  for (const message of messages) {
    const participantId = getParticipantId(message, currentUserId);
    const existing = map.get(participantId);
    const unreadForThisConversation =
      message.receiver_id === currentUserId && !message.is_read ? 1 : 0;

    if (!existing) {
      map.set(participantId, {
        participant_id: participantId,
        participant_name: getParticipantName(message, participantId),
        last_message: message.message,
        last_message_time: message.created_at,
        unread_count: unreadForThisConversation,
        order_id: message.order_id || null,
      });
      continue;
    }

    if (new Date(message.created_at).getTime() > new Date(existing.last_message_time).getTime()) {
      existing.last_message = message.message;
      existing.last_message_time = message.created_at;
      existing.order_id = message.order_id || existing.order_id || null;
      existing.participant_name = getParticipantName(message, participantId);
    }

    existing.unread_count += unreadForThisConversation;
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
  );
};

const isBadConversationName = (name: string | null | undefined) => {
  const value = String(name || '').trim().toLowerCase();
  return value.length === 0 || value === 'unknown user' || value === 'new chat';
};

const mergeConversations = (primary: Conversation[], fallback: Conversation[]) => {
  const map = new Map<string, Conversation>();
  for (const conv of primary) {
    map.set(conv.participant_id, conv);
  }
  for (const conv of fallback) {
    const existing = map.get(conv.participant_id);
    if (!existing) {
      map.set(conv.participant_id, conv);
      continue;
    }

    // Prefer non-placeholder participant names when merging.
    if (isBadConversationName(existing.participant_name) && !isBadConversationName(conv.participant_name)) {
      existing.participant_name = conv.participant_name;
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime(),
  );
};

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  conversationMessages: [],
  conversations: [],
  currentConversationUserId: null,
  currentMessage: null,
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
      const existingConversations = get().conversations;

      const nextConversations = currentUserId ? toConversations(messages, currentUserId) : [];
      set({
        messages,
        // Preserve any locally-created placeholder conversations (e.g. deep-link "Contact Supplier")
        // even if the backend has no messages yet for that participant.
        conversations: mergeConversations(nextConversations, existingConversations),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch messages',
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
        error: error.response?.data?.message || 'Failed to fetch conversation',
        isLoading: false,
      });
    }
  },

  fetchMessageById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await messageService.getById(id);
      const message = response.data.message;
      set({ currentMessage: message, isLoading: false });
      return message;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch message',
        isLoading: false,
      });
      return null;
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

  sendMessage: async (data: SendMessageData) => {
    set({ isSending: true, error: null });
    try {
      const response = await messageService.send(data);
      const sentMessage = response.data.message;
      const { messages, conversationMessages, currentConversationUserId } = get();
      const currentUserId = useAuthStore.getState().user?.id;
      const nextMessages = [sentMessage, ...messages];

      set({
        messages: nextMessages,
        conversations: currentUserId ? toConversations(nextMessages, currentUserId) : [],
        conversationMessages:
          currentConversationUserId === data.receiver_id
            ? [...conversationMessages, sentMessage]
            : conversationMessages,
        isSending: false,
      });

      return sentMessage;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to send message',
        isSending: false,
      });
      return null;
    }
  },

  markAsRead: async (messageIds: string[]) => {
    if (!messageIds.length) return true;

    try {
      await messageService.markAsRead({ messageIds });
      const { messages, conversationMessages } = get();
      const messageIdSet = new Set(messageIds);

      const updatedMessages = messages.map((m) =>
        messageIdSet.has(m.id) ? { ...m, is_read: true } : m
      );
      const updatedConversation = conversationMessages.map((m) =>
        messageIdSet.has(m.id) ? { ...m, is_read: true } : m
      );
      const currentUserId = useAuthStore.getState().user?.id;

      set({
        messages: updatedMessages,
        conversationMessages: updatedConversation,
        conversations: currentUserId ? toConversations(updatedMessages, currentUserId) : [],
      });
      await get().fetchUnreadCount();
      return true;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to mark messages as read' });
      return false;
    }
  },

  fetchChatContacts: async (search?: string, role?: string) => {
    set({ contactsLoading: true, error: null });
    try {
      const response = await messageService.getChatContacts(search, role);
      set({ contacts: response.data || [], contactsLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch chat contacts',
        contactsLoading: false,
      });
    }
  },

  fetchChatContactById: async (userId: string) => {
    try {
      const response = await messageService.getChatContactById(userId);
      const contact = response?.data?.contact;
      if (!contact?.id) return null;

      set((state) => ({
        contacts: state.contacts.some((c) => c.id === contact.id)
          ? state.contacts
          : [contact, ...state.contacts],
        conversations: state.conversations.map((c) =>
          c.participant_id === contact.id
            ? {
                ...c,
                participant_name:
                  contact.business_name ||
                  contact.full_name ||
                  contact.email ||
                  c.participant_name,
              }
            : c,
        ),
      }));

      return contact as ChatContact;
    } catch {
      return null;
    }
  },

  startChatWithUser: async (userId: string) => {
    const { conversations, contacts } = get();
    const alreadyExists = conversations.some((c) => c.participant_id === userId);

    if (!alreadyExists) {
      const contact = contacts.find((c) => c.id === userId);
      const placeholder: Conversation = {
        participant_id: userId,
        participant_name: contact?.business_name || contact?.full_name || contact?.email || 'New chat',
        last_message: '',
        last_message_time: new Date().toISOString(),
        unread_count: 0,
        order_id: null,
      };

      set({
        conversations: [placeholder, ...conversations],
        currentConversationUserId: userId,
        conversationMessages: [],
      });
    } else {
      set({ currentConversationUserId: userId });
    }

    // Best-effort hydrate the conversation participant name for deep links (no prior messages).
    void get().fetchChatContactById(userId);
  },

  setCurrentConversation: (userId: string | null) => set({ currentConversationUserId: userId }),

  clearError: () => set({ error: null }),
}));
