import { Request, Response } from 'express';
import { leaderService } from './service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';
import { LeaderStatus } from '../../types/index.js';

export class LeaderController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const religion = req.user?.religion;
    const leaders = await leaderService.getAllLeaders(religion);
    res.json({ success: true, data: leaders });
  });
  
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const leader = await leaderService.getLeaderById(id);
    
    if (!leader) {
      res.status(404).json({ success: false, error: 'Leader not found' });
      return;
    }
    
    res.json({ success: true, data: leader });
  });
  
  apply = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    
    if (req.user?.isAnonymous) {
      res.status(403).json({ 
        success: false, 
        error: 'Anonymous users cannot apply as leaders. Please use a verified account.' 
      });
      return;
    }
    
    const leader = await leaderService.apply(userId, req.body);
    res.status(201).json({ 
      success: true, 
      data: leader, 
      message: 'Application submitted for review' 
    });
  });
  
  verify = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const leader = await leaderService.verify(id, req.body);
    res.json({ 
      success: true, 
      data: leader, 
      message: `Leader ${leader.status === LeaderStatus.VERIFIED ? 'verified' : 'rejected'}` 
    });
  });
  
  getPending = asyncHandler(async (_req: Request, res: Response) => {
    const pending = await leaderService.getPendingVerifications();
    res.json({ success: true, data: pending });
  });
}

export const leaderController = new LeaderController();
