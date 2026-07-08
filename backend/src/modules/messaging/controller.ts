import { Response } from 'express';
import { messagingService } from './service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

export class MessagingController {
  getConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const conversations = await messagingService.getUserConversations(userId);
    res.json({ success: true, data: conversations });
  });

  getOrCreateConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const conversation = await messagingService.getOrCreateConversation(userId, req.body);
    res.json({ success: true, data: conversation });
  });

  getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const conversationId = req.params.conversationId as string;
    const messages = await messagingService.getConversationMessages(conversationId, userId);
    res.json({ success: true, data: messages });
  });

  sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const message = await messagingService.sendMessage(userId, req.body);
    res.status(201).json({ success: true, data: message });
  });

  markRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const conversationId = req.params.conversationId as string;
    await messagingService.markMessagesRead(conversationId, userId);
    res.json({ success: true, message: 'Messages marked as read' });
  });
}

export const messagingController = new MessagingController();
