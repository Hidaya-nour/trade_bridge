import { ChatMessageRepository } from '../../repositories/chat-message.repository';
import { UserRepository } from '../../repositories/user.repository';
import { AppError } from '../../utils/errors';
import { IChatContact, IChatMessage } from '../../types/chat-message.types';
import { UserRole } from '../../types/auth.types';
import logger from '../../utils/logger';

export class ChatMessageService {
  private chatRepo = new ChatMessageRepository();
  private userRepo = new UserRepository();

  async sendMessage(data: {
    sender_id: string;
    receiver_id: string;
    order_id?: string;
    message: string;
  }): Promise<IChatMessage> {
    // Validate sender and receiver exist
    const [sender, receiver] = await Promise.all([
      this.userRepo.findById(data.sender_id),
      this.userRepo.findById(data.receiver_id)
    ]);

    if (!sender) {
      throw new AppError('Sender not found', 404);
    }

    if (!receiver) {
      throw new AppError('Receiver not found', 404);
    }

    // If order_id provided, validate it exists (optional, can add later)

    const message = await this.chatRepo.create(data);

    logger.info(`Message sent from ${data.sender_id} to ${data.receiver_id}`);

    return message;
  }

  async getConversation(senderId: string, receiverId: string, orderId?: string): Promise<IChatMessage[]> {
    return this.chatRepo.findConversation(senderId, receiverId, orderId);
  }

  async getUserMessages(userId: string): Promise<IChatMessage[]> {
    return this.chatRepo.findByUser(userId);
  }

  async markMessagesAsRead(messageIds: string[], userId: string): Promise<number> {
    const updated = await this.chatRepo.markAsRead(messageIds, userId);
    if (updated > 0) {
      logger.info(`${updated} messages marked as read for user ${userId}`);
    }
    return updated;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.chatRepo.getUnreadCount(userId);
  }

  async getMessageById(id: string): Promise<IChatMessage | null> {
    return this.chatRepo.findById(id);
  }

  async getChatContacts(
    currentUserId: string,
    search?: string,
    role?: UserRole
  ): Promise<IChatContact[]> {
    const query = search?.trim() || '';

    const users = query
      ? await this.userRepo.searchUsers(query, role)
      : await this.userRepo.findActiveUsers();

    return users
      .filter((user) => user.id !== currentUserId && user.status === 'active')
      .filter((user) => (role ? user.role === role : true))
      .slice(0, 30)
      .map((user) => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        business_name: user.business_name,
        profile_image: user.profile_image,
      }));
  }
}
