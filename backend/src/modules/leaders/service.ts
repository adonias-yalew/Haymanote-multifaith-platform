import { getSupabase } from '../../db/supabaseClient.js';
import { Leader, LeaderApplication, VerifyLeaderInput } from './types.js';
import { LeaderStatus } from '../../types/index.js';

export class LeaderService {
  async getAllLeaders(religion?: string): Promise<Leader[]> {
    const supabase = getSupabase();
    let query = supabase
      .from('leader_profiles')
      .select('*, users!inner(religion)')
      .eq('status', LeaderStatus.VERIFIED);
    if (religion) {
      query = query.eq('users.religion', religion);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapLeader);
  }
  
  async getLeaderById(id: string): Promise<Leader | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('leader_profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return this.mapLeader(data);
  }
  
  async getLeaderByUserId(userId: string): Promise<Leader | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('leader_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) return null;
    return this.mapLeader(data);
  }
  
  async apply(userId: string, input: LeaderApplication): Promise<Leader> {
    const supabase = getSupabase();
    
    // Check if already applied
    const existing = await this.getLeaderByUserId(userId);
    if (existing) {
      throw new Error('Leader application already exists');
    }
    
    const { data, error } = await supabase
      .from('leader_profiles')
      .insert({
        user_id: userId,
        license_number: input.licenseNumber,
        specialization: input.specialization,
        credentials: input.credentials,
        years_of_experience: input.yearsOfExperience,
        verification_documents: input.verificationDocuments || [],
        bio: input.bio,
        status: LeaderStatus.PENDING,
      })
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to submit application');
    return this.mapLeader(data);
  }
  
  async verify(id: string, input: VerifyLeaderInput): Promise<Leader> {
    const supabase = getSupabase();
    
    const updates: Record<string, unknown> = { status: input.status };
    if (input.rejectionReason) updates.rejection_reason = input.rejectionReason;
    
    const { data, error } = await supabase
      .from('leader_profiles')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to verify leader');
    return this.mapLeader(data);
  }
  
  async getPendingVerifications(): Promise<Leader[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('leader_profiles')
      .select('*')
      .eq('status', LeaderStatus.PENDING)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapLeader);
  }
  
  private mapLeader(data: Record<string, unknown>): Leader {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      licenseNumber: data.license_number as string,
      specialization: data.specialization as string,
      credentials: data.credentials as string,
      status: data.status as LeaderStatus,
      bio: data.bio as string | undefined,
      yearsOfExperience: data.years_of_experience as number,
      verificationDocuments: data.verification_documents as string[] || [],
      rejectionReason: data.rejection_reason as string | undefined,
      verifiedAt: data.verified_at as string | undefined,
      verifiedBy: data.verified_by as string | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }
}

export const leaderService = new LeaderService();
