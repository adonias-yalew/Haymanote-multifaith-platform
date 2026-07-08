import { Router } from 'express';
import { commentController } from './controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

router.get('/post/:postId', authMiddleware, commentController.getByPost);
router.post('/', authMiddleware, commentController.create);
router.put('/:id', authMiddleware, commentController.update);
router.delete('/:id', authMiddleware, commentController.delete);
router.post('/:id/like', authMiddleware, commentController.like);

export default router;
