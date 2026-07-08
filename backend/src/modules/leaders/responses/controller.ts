import { Request, Response } from 'express';
import { leaderResponseService } from './service.js';
import { asyncHandler } from '../../../middleware/errorHandler.js';
import { AuthRequest } from '../../../middleware/auth.js';

export class LeaderResponseController {
  getByPost = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.postId as string;
    const responses = await leaderResponseService.getResponsesByPost(postId);
    res.json({ success: true, data: responses });
  });
  
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const leaderId = req.user?.userId as string;
    
    if (req.user?.isAnonymous) {
      res.status(403).json({
        success: false,
        error: 'Anonymous users cannot respond as leaders. Please use a verified account.',
      });
      return;
    }
    
    const response = await leaderResponseService.createResponse(leaderId, req.body);
    res.status(201).json({ success: true, data: response, message: 'Response created successfully' });
  });
  
  markHelpful = asyncHandler(async (req: AuthRequest, res: Response) => {
    const responseId = req.params.id as string;
    await leaderResponseService.markAsHelpful(responseId);
    res.json({ success: true, message: 'Response marked as helpful' });
  });
}

export const leaderResponseController = new LeaderResponseController();
