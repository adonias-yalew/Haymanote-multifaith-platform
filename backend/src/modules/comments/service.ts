import { getSupabase } from '../../db/supabaseClient.js';
import { Comment, CreateCommentInput, UpdateCommentInput } from './types.js';

export class CommentService {
  async getCommentsByPost(postId: string, religion: string): Promise<Comment[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users(email, role)
      `)
      .eq('post_id', postId)
      .eq('religion', religion)
      .order('created_at', { ascending: true });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapComment);
  }
  
  async getCommentById(id: string): Promise<Comment | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users(email, role)
      `)
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return this.mapComment(data);
  }
  
  async createComment(authorId: string, religion: string, input: CreateCommentInput, userRole?: string): Promise<Comment> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: input.postId,
        author_id: authorId,
        religion: religion,
        content: input.content,
        is_anonymous: input.isAnonymous || false,
        is_leader_response: !input.parentId && (userRole === 'leader' || userRole === 'admin'),
        parent_id: input.parentId || null,
      })
      .select(`
        *,
        author:users(email, role)
      `)
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to create comment');

    return this.mapComment(data);
  }
  
  async updateComment(id: string, input: UpdateCommentInput): Promise<Comment> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('comments')
      .update({ content: input.content })
      .eq('id', id)
      .select(`
        *,
        author:users(email, role)
      `)
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to update comment');
    return this.mapComment(data);
  }
  
  async deleteComment(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  
  async likeComment(id: string): Promise<void> {
    const supabase = getSupabase();
    const { data: current } = await supabase.from('comments').select('likes_count').eq('id', id).single();
    if (current) {
      const val = (current.likes_count as number) || 0;
      await supabase.from('comments').update({ likes_count: val + 1 }).eq('id', id);
    }
  }
  
  private mapComment(data: Record<string, unknown>): Comment {
    return {
      id: data.id as string,
      postId: data.post_id as string,
      authorId: data.author_id as string,
      content: data.content as string,
      isAnonymous: data.is_anonymous as boolean,
      isLeaderResponse: data.is_leader_response as boolean,
      parentId: data.parent_id as string | undefined,
      likesCount: data.likes_count as number || 0,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
      religion: data.religion as string || 'orthodox',
      author: data.author ? {
        email: (data.author as any).email,
        role: (data.author as any).role,
      } : undefined,
    };
  }
}

export const commentService = new CommentService();
