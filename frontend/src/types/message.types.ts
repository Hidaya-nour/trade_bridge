// types/message.types.ts

export interface Message {
  id: string;                    // CHAR(36) PK
  sender_id: string;              // CHAR(36) FK - references users.id
  receiver_id: string;            // CHAR(36) FK - references users.id
  order_id?: string | null;       // CHAR(36) FK - references orders.id (optional)
  content: string;                // TEXT
  is_read: number;                // TINYINT(1) - 0 or 1
  sent_at: string;                // TIMESTAMP
  deleted_at?: string | null;     // TIMESTAMP
  
  // Relations (joined data)
  sender?: {
    id: string;
    full_name: string;
    business_name?: string;
    profile_image?: string;
  };
  
  receiver?: {
    id: string;
    full_name: string;
    business_name?: string;
    profile_image?: string;
  };
  
  order?: {
    id: string;
    order_number?: string;        // Computed field
    total_price: number;
    order_status: string;
    created_at: string;
  };
}

// ============================================================================
// Conversation Types
// ============================================================================

export interface Conversation {
  participant_id: string;         // The other user's ID
  participant_name: string;       // The other user's name
  participant_business?: string;  // The other user's business name
  participant_image?: string;     // Profile image
  last_message: string;           // Last message content
  last_message_time: string;      // When last message was sent
  unread_count: number;           // Number of unread messages
  order_id?: string;              // Related order if any
  order_number?: string;          // Formatted order number
}

// ============================================================================
// Message Filters
// ============================================================================

export interface MessageFilters {
  conversation_with?: string;      // Filter by specific user
  order_id?: string;               // Filter by order
  is_read?: boolean;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Message API Types
// ============================================================================

export interface MessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface MessageResponse {
  success: boolean;
  data: {
    message: Message;
  };
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    total: number;
  };
}

export interface SendMessageData {
  receiver_id: string;
  content: string;
  order_id?: string;
}

export interface MarkMessagesAsReadData {
  sender_id: string;              // Mark all messages from this sender as read
}

// ============================================================================
// Message Store State
// ============================================================================

export interface MessageState {
  // Data
  messages: Message[];
  currentMessage: Message | null;
  conversations: Conversation[];
  currentConversation: string | null; // Current conversation partner ID
  totalMessages: number;
  currentPage: number;
  totalPages: number;
  unreadCount: number;
  
  // UI States
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  
  // Filters
  filters: MessageFilters;
}

export interface MessageActions {
  // Fetch actions
  fetchMessages: (conversationWith: string, filters?: MessageFilters) => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchMessageById: (id: string) => Promise<Message | null>;
  fetchUnreadCount: () => Promise<void>;
  
  // Message actions
  sendMessage: (data: SendMessageData) => Promise<Message | null>;
  markAsRead: (senderId: string) => Promise<boolean>;
  deleteMessage: (id: string) => Promise<boolean>;
  
  // Real-time actions (for WebSocket)
  addNewMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, isRead: boolean) => void;
  
  // Conversation actions
  setCurrentConversation: (userId: string | null) => void;
  clearConversation: () => void;
  
  // Filter actions
  setFilters: (filters: MessageFilters) => void;
  clearFilters: () => void;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

export type MessageStore = MessageState & MessageActions;