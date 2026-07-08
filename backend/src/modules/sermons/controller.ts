import { UserRole } from '../../types/index.js';
import { Response } from 'express';
import { sermonService } from './service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

export class SermonController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const religion = req.user?.religion as string;
    const sermons = await sermonService.getAllPublished(religion);
    res.json({ success: true, data: sermons });
  });
  
  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const religion = req.user?.religion as string;
    const sermon = await sermonService.getSermonById(id, religion);
    
    if (!sermon) {
      res.status(404).json({ success: false, error: 'Sermon not found' });
      return;
    }
    
    await sermonService.incrementViewCount(id);
    res.json({ success: true, data: sermon });
  });
  
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const authorId = req.user?.userId as string;
    const religion = req.user?.religion as string;
    const body = { ...req.body };
    if (req.file) {
      body.coverImage = `/documents/${req.file.filename}`;
    }
    const sermon = await sermonService.createSermon(authorId, religion, body);
    res.status(201).json({ success: true, data: sermon, message: 'Sermon created successfully' });
  });
  
  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const religion = req.user?.religion;
    
    const existing = await sermonService.getSermonById(id, religion);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Sermon not found' });
      return;
    }
    
    if (existing.authorId !== userId && req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }
    
    const body = { ...req.body };
    if (req.file) {
      body.coverImage = `/documents/${req.file.filename}`;
    }
    const sermon = await sermonService.updateSermon(id, body);
    res.json({ success: true, data: sermon, message: 'Sermon updated successfully' });
  });
  
  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const religion = req.user?.religion;
    
    const existing = await sermonService.getSermonById(id, religion);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Sermon not found' });
      return;
    }
    
    if (existing.authorId !== userId && req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }
    
    await sermonService.deleteSermon(id);
    res.json({ success: true, message: 'Sermon deleted successfully' });
  });
}

export const sermonController = new SermonController();
