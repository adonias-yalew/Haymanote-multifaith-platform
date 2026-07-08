import { Router } from 'express';
import { postController } from './controller.js';
import { authMiddleware } from '../../middleware/auth.js';
import { upload } from '../../middleware/multerConfig.js';

const router = Router();

router.get('/', authMiddleware, postController.getAll);
router.get('/my', authMiddleware, postController.getMyPosts);
router.get('/:id', authMiddleware, postController.getById);
router.post('/', authMiddleware, upload.single('image'), postController.create);
router.put('/:id', authMiddleware, postController.update);
router.delete('/:id', authMiddleware, postController.delete);

router.post('/:id/like', authMiddleware, postController.like);
router.delete('/:id/like', authMiddleware, postController.unlike);
router.get('/:id/like', authMiddleware, postController.checkLike);

export default router;
