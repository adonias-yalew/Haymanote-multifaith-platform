import { getSupabase } from '../../../db/supabaseClient.js';

export interface LeaderResponse {
  id: string;
  postId: string;
  leaderId: string;
  content: string;
  isOfficialResponse: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResponseInput {
  postId: string;
  content: string;
  isOfficialResponse?: boolean;
}

export class LeaderResponseService {
  async getResponsesByPost(postId: string): Promise<LeaderResponse[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('leader_responses')
      .select(`
        *,
        leader:users(id, display_name, avatar_url),
        leader_profile:leader_profiles(specialization, credentials)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapResponse);
  }
  
  async createResponse(
    leaderId: string,
    input: CreateResponseInput
  ): Promise<LeaderResponse> {
    const supabase = getSupabase();
    
    // Verify leader is verified
    const { data: profile } = await supabase
      .from('leader_profiles')
      .select('status')
      .eq('user_id', leaderId)
      .single();
    
    if (!profile || profile.status !== 'VERIFIED') {
      throw new Error('Only verified spiritual leaders can respond to posts');
    }
    
    const { data, error } = await supabase
      .from('leader_responses')
      .insert({
        post_id: input.postId,
        leader_id: leaderId,
        content: input.content,
        is_official_response: input.isOfficialResponse || false,
        helpful_count: 0,
      })
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to create response');
    
    // Award Spirit Points (reputation points) to leader for responding
    await this.awardReputation(leaderId, 10, 'RESPONSE_CREATED', 'leader_responses', data.id);
    
    return this.mapResponse(data);
  }
  
  async markAsHelpful(responseId: string): Promise<void> {
    const supabase = getSupabase();
    
    const { data: response } = await supabase
      .from('leader_responses')
      .select('leader_id, helpful_count')
      .eq('id', responseId)
      .single();
    
    if (!response) throw new Error('Response not found');
    
    await supabase
      .from('leader_responses')
      .update({ helpful_count: (response.helpful_count || 0) + 1 })
      .eq('id', responseId);
    
    // Award reputation to leader for helpful response
    await this.awardReputation(response.leader_id, 5, 'HELPFUL_RESPONSE', 'leader_responses', responseId);
  }
  
  private async awardReputation(
    userId: string,
    points: number,
    actionType: string,
    referenceType: string,
    referenceId: string
  ): Promise<void> {
    const supabase = getSupabase();
    
    await supabase.from('user_reputation_history').insert({
      user_id: userId,
      action_type: actionType,
      points: points,
      reference_type: referenceType,
      reference_id: referenceId,
    });
    
    // Recalculate user reputation/Spirit Points
    await supabase.rpc('calculate_user_reputation', { user_uuid: userId });
  }
  
  private mapResponse(data: Record<string, unknown>): LeaderResponse {
    return {
      id: data.id as string,
      postId: data.post_id as string,
      leaderId: data.leader_id as string,
      content: data.content as string,
      isOfficialResponse: data.is_official_response as boolean,
      helpfulCount: data.helpful_count as number,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }
}

export const leaderResponseService = new LeaderResponseService();
