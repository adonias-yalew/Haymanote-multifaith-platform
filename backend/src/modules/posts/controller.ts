import { UserRole } from '../../types/index.js';
import { Response } from 'express';
import { postService } from './service.js';
import { CreatePostInput } from './types.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

export class PostController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const religion = req.user?.religion;
    if (!religion) {
      res.status(401).json({ success: false, error: 'Unauthorized: Religion context is required' });
      return;
    }
    const posts = await postService.getAllPosts(religion);
    res.json({ success: true, data: posts });
  });
  
  getMyPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const posts = await postService.getPostsByAuthor(userId);
    res.json({ success: true, data: posts });
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const religion = req.user?.religion;
    if (!religion) {
      res.status(401).json({ success: false, error: 'Unauthorized: Religion context is required' });
      return;
    }
    const post = await postService.getPostById(id, religion);
    
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }
    
    res.json({ success: true, data: post });
  });
  
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const authorId = req.user?.userId as string;
    const religion = req.user?.religion as string;

    if (req.body?.isAnonymous && req.user?.role !== UserRole.USER) {
      res.status(403).json({
        success: false,
        error: 'Only regular members can post anonymously',
      });
      return;
    }

    const postData = normalizePostBody(req.body);
    if (req.file) {
      postData.imageUrl = `/documents/${req.file.filename}`;
    }

    const post = await postService.createPost(authorId, religion, postData);
    res.status(201).json({ success: true, data: post, message: 'Post created' });
  });
  
  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const religion = req.user?.religion;
    
    // Check ownership
    const existing = await postService.getPostById(id, religion);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }
    
    if (existing.authorId !== userId && req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }
    
    const post = await postService.updatePost(id, req.body);
    res.json({ success: true, data: post, message: 'Post updated' });
  });
  
  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const religion = req.user?.religion;
    
    const existing = await postService.getPostById(id, religion);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }
    
    if (existing.authorId !== userId && req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }
    
    await postService.deletePost(id);
    res.json({ success: true, message: 'Post deleted' });
  });

  like = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const postId = req.params.id as string;
    const religion = req.user?.religion as string;
    
    const success = await postService.likePost(userId, postId, religion);
    if (!success) {
      res.status(400).json({ success: false, error: 'Post is unavailable or already liked' });
      return;
    }
    res.json({ success: true, message: 'Post liked successfully' });
  });

  unlike = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const postId = req.params.id as string;
    const religion = req.user?.religion as string;
    
    const success = await postService.unlikePost(userId, postId, religion);
    if (!success) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }
    res.json({ success: true, message: 'Post unliked successfully' });
  });

  checkLike = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId as string;
    const postId = req.params.id as string;
    const religion = req.user?.religion as string;
    
    const hasLiked = await postService.hasLikedPost(userId, postId, religion);
    res.json({ success: true, hasLiked });
  });
}

export const postController = new PostController();

function normalizePostBody(body: Record<string, unknown>): CreatePostInput {
  return {
    title: typeof body.title === 'string' ? body.title : undefined,
    content: typeof body.content === 'string' ? body.content : undefined,
    isAnonymous: parseBoolean(body.isAnonymous),
    tags: parseTags(body.tags),
  };
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return undefined;
}

function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0);
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0);
    }
  } catch {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}
