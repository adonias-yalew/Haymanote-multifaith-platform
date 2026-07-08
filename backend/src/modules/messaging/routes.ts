import { Router } from 'express';
import { messagingController } from './controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

router.get('/conversations', authMiddleware, messagingController.getConversations);
router.post('/conversations', authMiddleware, messagingController.getOrCreateConversation);
router.get('/conversations/:conversationId/messages', authMiddleware, messagingController.getMessages);
router.post('/messages', authMiddleware, messagingController.sendMessage);
router.put('/conversations/:conversationId/read', authMiddleware, messagingController.markRead);

export default router;
