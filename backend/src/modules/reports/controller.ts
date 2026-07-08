import { Request, Response } from 'express';
import { reportService } from './service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

export class ReportController {
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const reports = await reportService.getAllReports();
    res.json({ success: true, data: reports });
  });
  
  getPending = asyncHandler(async (_req: Request, res: Response) => {
    const reports = await reportService.getPendingReports();
    res.json({ success: true, data: reports });
  });
  
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const report = await reportService.getReportById(id);
    
    if (!report) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }
    
    res.json({ success: true, data: report });
  });
  
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const reporterId = req.user?.userId as string;
    const report = await reportService.createReport(reporterId, req.body);
    res.status(201).json({ success: true, data: report, message: 'Report submitted' });
  });
  
  review = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const reviewerId = req.user?.userId as string;
    const report = await reportService.reviewReport(id, reviewerId, req.body);
    res.json({ success: true, data: report, message: 'Report reviewed' });
  });
}

export const reportController = new ReportController();
