import { Router } from 'express';
import { leaderResponseController } from './controller.js';
import { authMiddleware, requireVerifiedLeader, requireNonAnonymous } from '../../../middleware/auth.js';

const router = Router();

// Public routes
router.get('/post/:postId', leaderResponseController.getByPost);

// Protected routes - Leaders only, non-anonymous
router.post(
  '/',
  authMiddleware,
  requireNonAnonymous,
  requireVerifiedLeader,
  leaderResponseController.create
);

// Mark as helpful
router.post('/:id/helpful', authMiddleware, leaderResponseController.markHelpful);

export default router;
