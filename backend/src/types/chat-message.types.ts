export interface IChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  order_id?: string; // Optional, for order-related chats
  message: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}