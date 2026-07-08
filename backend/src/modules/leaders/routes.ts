import { Router } from 'express';
import { leaderController } from './controller.js';
import { authMiddleware, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

// Public routes
router.get('/', leaderController.getAll);
router.get('/:id', leaderController.getById);

// Protected routes
router.post('/apply', authMiddleware, leaderController.apply);
router.get('/verifications/pending', authMiddleware, requireRole(UserRole.ADMIN), leaderController.getPending);
router.put('/:id/verify', authMiddleware, requireRole(UserRole.ADMIN), leaderController.verify);

export default router;
