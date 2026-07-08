import { Router } from 'express';
import { aiController } from './controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

router.get('/conversations', authMiddleware, aiController.getConversations);
router.get('/conversations/:conversationId/messages', authMiddleware, aiController.getMessages);
router.delete('/conversations/:conversationId', authMiddleware, aiController.deleteConversation);
router.post('/chat', authMiddleware, aiController.chat);

export default router;
