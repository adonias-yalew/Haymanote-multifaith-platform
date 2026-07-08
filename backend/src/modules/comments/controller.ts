import { UserRole } from '../../types/index.js';
import { Response } from 'express';
import { commentService } from './service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

export class CommentController {
  getByPost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const postId = req.params.postId as string;
    const religion = req.user?.religion;
    if (!religion) {
      res.status(401).json({ success: false, error: 'Unauthorized: Religion context is required' });
      return;
    }
    const comments = await commentService.getCommentsByPost(postId, religion);
    res.json({ success: true, data: comments });
  });
  
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const authorId = req.user?.userId as string;
    const religion = req.user?.religion as string;
    const userRole = req.user?.role;

    if (req.body?.isAnonymous && userRole !== UserRole.USER) {
      res.status(403).json({
        success: false,
        error: 'Only regular members can post anonymously',
      });
      return;
    }

    // If no parentId, it's a top-level response to the post
    // Only leaders can create top-level responses
    if (!req.body?.parentId && userRole !== UserRole.LEADER && userRole !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Only verified leaders can respond to questions. Users can reply to leader responses.',
      });
      return;
    }

    // Leaders cannot be anonymous when creating top-level responses
    if (!req.body?.parentId && req.body?.isAnonymous) {
      res.status(403).json({
        success: false,
        error: 'Leader responses cannot be anonymous',
      });
      return;
    }

    const comment = await commentService.createComment(authorId, religion, req.body, userRole);
    res.status(201).json({ success: true, data: comment, message: 'Comment created' });
  });
  
  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    
    const existing = await commentService.getCommentById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Comment not found' });
      return;
    }
    
    if (existing.authorId !== userId && req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }
    
    const comment = await commentService.updateComment(id, req.body);
    res.json({ success: true, data: comment, message: 'Comment updated' });
  });
  
  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    
    const existing = await commentService.getCommentById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Comment not found' });
      return;
    }
    
    if (existing.authorId !== userId && req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }
    
    await commentService.deleteComment(id);
    res.json({ success: true, message: 'Comment deleted' });
  });
  
  like = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    await commentService.likeComment(id);
    res.json({ success: true, message: 'Comment liked' });
  });
}

export const commentController = new CommentController();
