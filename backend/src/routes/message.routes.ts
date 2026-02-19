import express from 'express';
import { ChatMessageController } from '../controllers/chat-message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();
const chatController = new ChatMessageController();

// ========================================================================
// Routes
// ========================================================================

// All message routes require authentication
router.use(authenticate);

// ========================================================================
// POST Routes
// ========================================================================

// POST /api/messages - Send a message
router.post('/', validate(ChatMessageController.sendMessageValidation), chatController.sendMessage);

// ========================================================================
// GET Routes
// ========================================================================

// GET /api/messages - Get all messages for current user
router.get('/', chatController.getUserMessages);

// GET /api/messages/conversation/:userId - Get conversation with a user
router.get('/conversation/:userId', validate(ChatMessageController.conversationValidation), chatController.getConversation);

// GET /api/messages/unread-count - Get unread messages count
router.get('/unread-count', chatController.getUnreadCount);

// GET /api/messages/:id - Get message by ID
router.get('/:id', validate(ChatMessageController.messageIdValidation), chatController.getMessageById);

// ========================================================================
// PUT Routes
// ========================================================================

// PUT /api/messages/mark-read - Mark messages as read
router.put('/mark-read', validate(ChatMessageController.markAsReadValidation), chatController.markAsRead);

export default router;
