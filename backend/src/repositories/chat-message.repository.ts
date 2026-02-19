import { BaseRepository } from './base.repository';
import ChatMessage from '../models/chat-message.model';
import { User } from '../models/user.model';
import Order from '../models/order.model';
import { Op } from 'sequelize';

export class ChatMessageRepository extends BaseRepository<ChatMessage> {
  constructor() {
    super(ChatMessage);
  }

  async findById(id: string): Promise<ChatMessage | null> {
    return this.model.findByPk(id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id']
        }
      ]
    });
  }

  async findConversation(senderId: string, receiverId: string, orderId?: string): Promise<ChatMessage[]> {
    const where: any = {
      [Op.or]: [
        { sender_id: senderId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: senderId }
      ]
    };

    if (orderId) {
      where.order_id = orderId;
    }

    return this.model.findAll({
      where,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['created_at', 'ASC']]
    });
  }

  async findByUser(userId: string): Promise<ChatMessage[]> {
    return this.model.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async markAsRead(messageIds: string[], userId: string): Promise<number> {
    const [updated] = await this.model.update(
      { is_read: true },
      {
        where: {
          id: messageIds,
          receiver_id: userId,
          is_read: false
        }
      }
    );
    return updated;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.model.count({
      where: {
        receiver_id: userId,
        is_read: false
      }
    });
  }
}