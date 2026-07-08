import { Response } from 'express';
import { aiService } from './service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

export class AiController {
  getConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const conversations = await aiService.getConversations(userId);
    res.json({ success: true, data: conversations });
  });
  
  getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const conversationId = req.params.conversationId as string;
    const messages = await aiService.getMessages(conversationId, userId);
    res.json({ success: true, data: messages });
  });
  
  deleteConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const conversationId = req.params.conversationId as string;
    await aiService.deleteConversation(conversationId, userId);
    res.json({ success: true, message: 'Conversation deleted successfully' });
  });
  
  chat = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const religion = req.user?.religion as string;
    const result = await aiService.chat(userId, religion, req.body);
    res.json({
      success: true,
      data: {
        conversation: result.conversation,
        message: result.message,
      },
    });
  });
}

export const aiController = new AiController();
