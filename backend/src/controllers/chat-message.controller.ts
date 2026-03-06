import { Request, Response } from 'express';
import { ChatMessageService } from '../services/chat-message/chat-message.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { body, param, query } from 'express-validator';
import { UserRole } from '../types/auth.types';

const chatService = new ChatMessageService();

export class ChatMessageController {
  // Send a message
  async sendMessage(req: Request, res: Response) {
    try {
      const { receiver_id, order_id, message } = req.body;
      const sender_id = (req as any).user.id;

      const chatMessage = await chatService.sendMessage({
        sender_id,
        receiver_id,
        order_id,
        message
      });

      res.status(201).json({ success: true, data: { message: chatMessage } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get conversation between two users
  async getConversation(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { orderId } = req.query;
      const currentUserId = (req as any).user.id;

      const messages = await chatService.getConversation(currentUserId, userId, orderId as string);

      res.json({ success: true, data: messages });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get conversation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get all messages for current user
  async getUserMessages(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const messages = await chatService.getUserMessages(userId);

      res.json({ success: true, data: messages });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get user messages error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Mark messages as read
  async markAsRead(req: Request, res: Response) {
    try {
      const { messageIds } = req.body;
      const userId = (req as any).user.id;

      const updated = await chatService.markMessagesAsRead(messageIds, userId);

      res.json({ success: true, data: { updatedCount: updated } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Mark as read error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get unread count
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const count = await chatService.getUnreadCount(userId);

      res.json({ success: true, data: { unreadCount: count } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get unread count error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get message by ID
  async getMessageById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const message = await chatService.getMessageById(id);

      if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }

      res.json({ success: true, data: { message } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get message error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get contacts for starting a new chat
  async getChatContacts(req: Request, res: Response) {
    try {
      const currentUserId = (req as any).user.id;
      const search = req.query.q as string | undefined;
      const role = req.query.role as UserRole | undefined;

      const contacts = await chatService.getChatContacts(currentUserId, search, role);
      res.json({ success: true, data: contacts });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get chat contacts error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Validation rules
  static sendMessageValidation = [
    body('receiver_id').isUUID().withMessage('Invalid receiver ID'),
    body('order_id').optional().isUUID().withMessage('Invalid order ID'),
    body('message').isString().notEmpty().withMessage('Message cannot be empty')
  ];

  static conversationValidation = [
    param('userId').isUUID().withMessage('Invalid user ID'),
    query('orderId').optional().isUUID().withMessage('Invalid order ID')
  ];

  static markAsReadValidation = [
    body('messageIds').isArray().withMessage('Message IDs must be an array'),
    body('messageIds.*').isUUID().withMessage('Invalid message ID')
  ];

  static messageIdValidation = [
    param('id').isUUID().withMessage('Invalid message ID')
  ];

  static chatContactsValidation = [
    query('q').optional().isString().isLength({ max: 100 }).withMessage('Invalid search query'),
    query('role')
      .optional()
      .isIn(['retailer', 'distributor', 'factory', 'driver', 'admin'])
      .withMessage('Invalid role filter'),
  ];
}
