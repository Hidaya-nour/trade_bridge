import type { UserRole } from "@/features/auth/auth.types";

export interface ChatUser {
  id: string;
  full_name?: string;
  email?: string;
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
}

export interface Conversation {
  participant_id: string;
  participant_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  order_id?: string | null;
}

export interface ChatContact {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  business_name?: string;
  profile_image?: string;
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

export interface ChatContactsResponse {
  success: boolean;
  data: ChatContact[];
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}
