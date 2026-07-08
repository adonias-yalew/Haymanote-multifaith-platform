import { getSupabase } from '../../db/supabaseClient.js';
import { Prayer, CreatePrayerInput, UpdatePrayerInput } from './types.js';

export class PrayerService {
  async getMyPrayers(userId: string): Promise<Prayer[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('prayers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapPrayer);
  }
  
  async getPublicPrayers(religion?: string): Promise<Prayer[]> {
    const supabase = getSupabase();
    let query = supabase
      .from('prayers')
      .select('*, user:user_id(email)')
      .eq('is_public', true);
    if (religion) {
      query = query.eq('religion', religion);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapPrayer);
  }
  
  async getPrayerById(id: string): Promise<Prayer | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('prayers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return this.mapPrayer(data);
  }
  
  async createPrayer(userId: string, religion: string, input: CreatePrayerInput): Promise<Prayer> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('prayers')
      .insert({
        user_id: userId,
        religion: religion,
        title: input.title,
        description: input.description,
        is_public: input.isPublic || false,
        is_answered: false,
        prayed_count: 0,
      })
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to create prayer request');
    return this.mapPrayer(data);
  }
  
  async updatePrayer(id: string, userId: string, input: UpdatePrayerInput): Promise<Prayer> {
    const supabase = getSupabase();
    
    // Check ownership
    const { data: existing } = await supabase.from('prayers').select('user_id').eq('id', id).single();
    if (!existing || existing.user_id !== userId) {
      throw new Error('Access denied or prayer not found');
    }
    
    const updates: Record<string, unknown> = {};
    if (input.title) updates.title = input.title;
    if (input.description !== undefined) updates.description = input.description;
    if (input.isPublic !== undefined) updates.is_public = input.isPublic;
    if (input.isAnswered !== undefined) updates.is_answered = input.isAnswered;
    if (input.prayedCount !== undefined) updates.prayed_count = input.prayedCount;
    
    const { data, error } = await supabase
      .from('prayers')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to update prayer request');
    return this.mapPrayer(data);
  }
  
  async deletePrayer(id: string, userId: string): Promise<void> {
    const supabase = getSupabase();
    const { data: existing } = await supabase.from('prayers').select('user_id').eq('id', id).single();
    if (!existing || existing.user_id !== userId) {
      throw new Error('Access denied or prayer not found');
    }
    const { error } = await supabase.from('prayers').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  
  async incrementPrayedCount(id: string): Promise<void> {
    const supabase = getSupabase();
    const { data: current } = await supabase.from('prayers').select('prayed_count').eq('id', id).single();
    if (current) {
      const val = (current.prayed_count as number) || 0;
      await supabase.from('prayers').update({ prayed_count: val + 1 }).eq('id', id);
    }
  }
  
  private mapPrayer(data: Record<string, unknown>): Prayer {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      title: data.title as string,
      description: data.description as string | undefined,
      isPublic: data.is_public as boolean,
      isAnswered: data.is_answered as boolean,
      prayedCount: data.prayed_count as number || 0,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }
}

export const prayerService = new PrayerService();
