import { Router } from 'express';
import { notificationController } from './controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, notificationController.getNotifications);
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);
router.put('/:notificationId/read', authMiddleware, notificationController.markRead);
router.put('/mark-all-read', authMiddleware, notificationController.markAllRead);

export default router;
