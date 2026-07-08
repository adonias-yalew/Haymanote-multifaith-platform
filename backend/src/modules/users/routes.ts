import { Router } from 'express';
import { userController } from './controller.js';
import { authMiddleware, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';

const router = Router();

router.get('/', authMiddleware, requireRole(UserRole.ADMIN), userController.getAll);
router.get('/:id', authMiddleware, userController.getById);
router.put('/:id', authMiddleware, userController.update);
router.delete('/:id', authMiddleware, userController.delete);

export default router;
