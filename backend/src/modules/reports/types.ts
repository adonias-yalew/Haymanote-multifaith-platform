import { ReportStatus, ReportReason } from '../../types/index.js';

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportInput {
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetId: string;
  reason: ReportReason;
  description?: string;
}

export interface ReviewReportInput {
  status: ReportStatus;
  actionTaken?: string;
}
