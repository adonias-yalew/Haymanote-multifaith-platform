import { getSupabase } from '../../db/supabaseClient.js';
import { Sermon, CreateSermonInput, UpdateSermonInput } from './types.js';

export class SermonService {
  async getAllPublished(religion?: string): Promise<Sermon[]> {
    const supabase = getSupabase();
    let query = supabase
      .from('sermons')
      .select('*')
      .eq('published', true);

    if (religion) {
      query = query.eq('religion', religion);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapSermon);
  }
  
  async getSermonById(id: string, religion?: string): Promise<Sermon | null> {
    const supabase = getSupabase();
    let query = supabase
      .from('sermons')
      .select('*, author:users!author_id(email, role)')
      .eq('id', id);

    if (religion) {
      query = query.eq('religion', religion);
    }

    const { data, error } = await query.single();
    
    if (error || !data) return null;
    return this.mapSermon(data);
  }
  
  async getSermonsByAuthor(authorId: string): Promise<Sermon[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapSermon);
  }
  
  async createSermon(authorId: string, religion: string, input: CreateSermonInput): Promise<Sermon> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('sermons')
      .insert({
        author_id: authorId,
        religion: religion,
        title: input.title,
        content: input.content,
        excerpt: input.excerpt,
        cover_image: input.coverImage,
        tags: input.tags || [],
        published: input.published || false,
        view_count: 0,
      })
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to create sermon');
    return this.mapSermon(data);
  }
  
  async updateSermon(id: string, input: UpdateSermonInput): Promise<Sermon> {
    const supabase = getSupabase();
    
    const updates: Record<string, unknown> = {};
    if (input.title) updates.title = input.title;
    if (input.content) updates.content = input.content;
    if (input.excerpt !== undefined) updates.excerpt = input.excerpt;
    if (input.coverImage !== undefined) updates.cover_image = input.coverImage;
    if (input.tags) updates.tags = input.tags;
    if (input.published !== undefined) updates.published = input.published;
    
    const { data, error } = await supabase
      .from('sermons')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to update sermon');
    return this.mapSermon(data);
  }
  
  async deleteSermon(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('sermons').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  
  async incrementViewCount(id: string): Promise<void> {
    const supabase = getSupabase();
    // Directly increment using Supabase update since it is simpler and doesn't require a custom RPC
    const { data: current } = await supabase.from('sermons').select('view_count').eq('id', id).single();
    if (current) {
      const currentVal = (current.view_count as number) || 0;
      await supabase.from('sermons').update({ view_count: currentVal + 1 }).eq('id', id);
    }
  }
  
  private mapSermon(data: Record<string, unknown>): Sermon {
    const author = data.author as Record<string, unknown> | undefined;
    return {
      id: data.id as string,
      authorId: data.author_id as string,
      title: data.title as string,
      content: data.content as string,
      excerpt: data.excerpt as string | undefined,
      coverImage: data.cover_image as string | undefined,
      tags: data.tags as string[] || [],
      published: data.published as boolean,
      viewCount: data.view_count as number,
      likesCount: data.likes_count as number || 0,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
      religion: data.religion as string || 'orthodox',
      author: author ? { email: author.email as string, role: (author.role as string) || 'user' } : undefined,
    };
  }
}

export const sermonService = new SermonService();
