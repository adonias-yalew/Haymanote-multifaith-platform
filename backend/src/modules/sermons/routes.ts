import { Router } from 'express';
import { sermonController } from './controller.js';
import { authMiddleware, requireVerifiedLeader } from '../../middleware/auth.js';
import { upload } from '../../middleware/multerConfig.js';

const router = Router();

router.get('/', authMiddleware, sermonController.getAll);
router.get('/:id', authMiddleware, sermonController.getById);

// Protected routes - Leaders/Admins only for creating/updating
router.post('/', authMiddleware, requireVerifiedLeader, upload.single('coverImage'), sermonController.create);
router.put('/:id', authMiddleware, upload.single('coverImage'), sermonController.update);
router.delete('/:id', authMiddleware, sermonController.delete);

export default router;
