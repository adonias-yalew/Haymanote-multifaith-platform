import { Response } from 'express';
import { prayerTrackerService } from './prayerTrackerService.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

export class PrayerTrackerController {
  logPrayer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const religion = req.user?.religion as string;
    const { prayerName } = req.body;

    if (!prayerName) {
      res.status(400).json({ success: false, message: 'Prayer name is required' });
      return;
    }

    const prayer = await prayerTrackerService.logPrayer(userId, prayerName, religion);
    res.status(201).json({ 
      success: true, 
      data: prayer, 
      message: 'Prayer logged successfully' 
    });
  });

  getTodayPrayers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const religion = req.user?.religion as string;

    const prayers = await prayerTrackerService.getTodayPrayers(userId, religion);
    res.json({ success: true, data: prayers });
  });

  getWeekPrayers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const religion = req.user?.religion as string;

    const prayers = await prayerTrackerService.getWeekPrayers(userId, religion);
    res.json({ success: true, data: prayers });
  });

  getMonthPrayers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const religion = req.user?.religion as string;

    const prayers = await prayerTrackerService.getMonthPrayers(userId, religion);
    res.json({ success: true, data: prayers });
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const religion = req.user?.religion as string;

    const stats = await prayerTrackerService.getStats(userId, religion);
    res.json({ success: true, data: stats });
  });

  getDefaultPrayers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const religion = req.user?.religion as string;

    const prayers = prayerTrackerService.getDefaultPrayers(religion);
    res.json({ success: true, data: prayers });
  });

  addCustomPrayer = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const religion = req.user?.religion as string;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Prayer name is required' });
      return;
    }

    const prayer = await prayerTrackerService.addCustomPrayer(userId, name, religion);
    res.status(201).json({ 
      success: true, 
      data: prayer, 
      message: 'Custom prayer added successfully' 
    });
  });
}

export const prayerTrackerController = new PrayerTrackerController();
