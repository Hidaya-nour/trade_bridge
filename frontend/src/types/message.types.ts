export interface ChatUser {
  id: string;
  full_name?: string;
  email?: string;
}

export interface ChatOrder {
  id: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  order_id?: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: ChatUser;
  receiver?: ChatUser;
  order?: ChatOrder;
}

export interface Conversation {
  participant_id: string;
  participant_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  order_id?: string | null;
}

export interface SendMessageData {
  receiver_id: string;
  message: string;
  order_id?: string;
}

export interface MarkMessagesAsReadData {
  messageIds: string[];
}

export interface MessagesListResponse {
  success: boolean;
  data: Message[];
}

export interface MessageResponse {
  success: boolean;
  data: {
    message: Message;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

export interface MarkAsReadResponse {
  success: boolean;
  data: {
    updatedCount: number;
  };
}
