import { Router } from 'express';
import { reportController } from './controller.js';
import { authMiddleware, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

// Any authenticated user can report
router.post('/', authMiddleware, reportController.create);

// Admin only routes
router.get('/', authMiddleware, requireRole(UserRole.ADMIN), reportController.getAll);
router.get('/pending', authMiddleware, requireRole(UserRole.ADMIN), reportController.getPending);
router.get('/:id', authMiddleware, requireRole(UserRole.ADMIN), reportController.getById);
router.put('/:id/review', authMiddleware, requireRole(UserRole.ADMIN), reportController.review);

export default router;
