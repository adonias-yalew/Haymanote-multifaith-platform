import { Response } from 'express';
import { prayerService } from './service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

export class PrayerController {
  getMyPrayers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const prayers = await prayerService.getMyPrayers(userId);
    res.json({ success: true, data: prayers });
  });
  
  getPublicPrayers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const religion = req.user?.religion;
    const prayers = await prayerService.getPublicPrayers(religion);
    res.json({ success: true, data: prayers });
  });
  
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const religion = req.user?.religion as string;
    const prayer = await prayerService.createPrayer(userId, religion, req.body);
    res.status(201).json({ success: true, data: prayer, message: 'Prayer request created successfully' });
  });
  
  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.userId as string;
    const prayer = await prayerService.updatePrayer(id, userId, req.body);
    res.json({ success: true, data: prayer, message: 'Prayer request updated successfully' });
  });
  
  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.userId as string;
    await prayerService.deletePrayer(id, userId);
    res.json({ success: true, message: 'Prayer request deleted successfully' });
  });
  
  prayFor = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    await prayerService.incrementPrayedCount(id);
    res.json({ success: true, message: 'Prayed for request successfully' });
  });
}

export const prayerController = new PrayerController();
