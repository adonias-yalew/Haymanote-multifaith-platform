import { getSupabase } from '../../db/supabaseClient.js';
import { Report, CreateReportInput, ReviewReportInput } from './types.js';
import { ReportStatus, ReportReason } from '../../types/index.js';

export class ReportService {
  async getAllReports(): Promise<Report[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapReport);
  }
  
  async getPendingReports(): Promise<Report[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('status', ReportStatus.PENDING)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapReport);
  }
  
  async getReportById(id: string): Promise<Report | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return this.mapReport(data);
  }
  
  async createReport(reporterId: string, input: CreateReportInput): Promise<Report> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        target_type: input.targetType,
        target_id: input.targetId,
        reason: input.reason,
        description: input.description,
        status: ReportStatus.PENDING,
      })
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to create report');
    return this.mapReport(data);
  }
  
  async reviewReport(
    id: string,
    reviewerId: string,
    input: ReviewReportInput
  ): Promise<Report> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('reports')
      .update({
        status: input.status,
        reviewed_by: reviewerId,
        action_taken: input.actionTaken,
      })
      .eq('id', id)
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to review report');
    return this.mapReport(data);
  }
  
  private mapReport(data: Record<string, unknown>): Report {
    return {
      id: data.id as string,
      reporterId: data.reporter_id as string,
      targetType: data.target_type as 'POST' | 'COMMENT' | 'USER',
      targetId: data.target_id as string,
      reason: data.reason as ReportReason,
      description: data.description as string | undefined,
      status: data.status as ReportStatus,
      reviewedBy: data.reviewed_by as string | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }
}

export const reportService = new ReportService();
