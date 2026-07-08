import { Response } from 'express';
import { notificationService } from './service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

export class NotificationController {
  getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const notifications = await notificationService.getUserNotifications(userId);
    const unreadCount = await notificationService.getUnreadCount(userId);
    res.json({ success: true, data: { notifications, unreadCount } });
  });

  markRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const notificationId = req.params.notificationId as string;
    await notificationService.markAsRead(notificationId, userId);
    res.json({ success: true, message: 'Notification marked as read' });
  });

  markAllRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    await notificationService.markAllAsRead(userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  });

  getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ success: true, data: { count } });
  });
}

export const notificationController = new NotificationController();
