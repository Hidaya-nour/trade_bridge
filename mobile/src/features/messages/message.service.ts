import api from "@/lib/api";
import type {
  ChatContactsResponse,
  MarkMessagesAsReadData,
  MessageResponse,
  MessagesListResponse,
  SendMessageData,
  UnreadCountResponse,
} from "./message.types";

class MessageService {
  async getUserMessages(): Promise<MessagesListResponse> {
    const response = await api.get("/messages");
    return response.data;
  }

  async getConversation(userId: string, orderId?: string): Promise<MessagesListResponse> {
    const response = await api.get(`/messages/conversation/${userId}`, {
      params: orderId ? { orderId } : undefined,
    });
    return response.data;
  }

  async send(data: SendMessageData): Promise<MessageResponse> {
    const response = await api.post("/messages", data);
    return response.data;
  }

  async markAsRead(data: MarkMessagesAsReadData) {
    const response = await api.patch("/messages/mark-as-read", data);
    return response.data;
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get("/messages/unread-count");
    return response.data;
  }

  async getChatContacts(search?: string, role?: string): Promise<ChatContactsResponse> {
    const response = await api.get("/messages/contacts", {
      params: {
        q: search || undefined,
        role: role || undefined,
      },
    });
    return response.data;
  }
}

export default new MessageService();
