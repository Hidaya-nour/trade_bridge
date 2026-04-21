import express from 'express';
import { ChatMessageController } from '../controllers/chat-message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();
const chatMessageController = new ChatMessageController();

router.use(authenticate);

router.post(
  '/',
  validate(ChatMessageController.sendMessageValidation),
  chatMessageController.sendMessage
);

router.get('/', chatMessageController.getUserMessages);

router.get('/unread-count', chatMessageController.getUnreadCount);

router.get(
  '/contacts',
  validate(ChatMessageController.chatContactsValidation),
  chatMessageController.getChatContacts
);
router.get(
  '/contacts/:userId',
  validate(ChatMessageController.chatContactByIdValidation),
  chatMessageController.getChatContactById
);

router.get(
  '/conversation/:userId',
  validate(ChatMessageController.conversationValidation),
  chatMessageController.getConversation
);

router.patch(
  '/mark-as-read',
  validate(ChatMessageController.markAsReadValidation),
  chatMessageController.markAsRead
);

router.get(
  '/:id',
  validate(ChatMessageController.messageIdValidation),
  chatMessageController.getMessageById
);

export default router;
