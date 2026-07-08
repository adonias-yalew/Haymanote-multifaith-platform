import { getSupabase } from '../../db/supabaseClient.js';
import { Post, CreatePostInput, UpdatePostInput } from './types.js';
import { PostStatus } from '../../types/index.js';

export class PostService {
  async getAllPosts(religion: string): Promise<Post[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', PostStatus.PUBLISHED)
      .eq('religion', religion)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return (data || []).map(this.mapPost);
  }
  
  async getPostById(id: string, religion?: string): Promise<Post | null> {
    const supabase = getSupabase();
    let query = supabase.from('posts').select('*').eq('id', id);
    if (religion) {
      query = query.eq('religion', religion);
    }
    const { data, error } = await query.single();
    
    if (error || !data) return null;
    
    // Increment view count when fetching details
    await this.incrementViewCount(id);
    data.view_count = (data.view_count as number || 0) + 1;
    
    return this.mapPost(data);
  }
  
  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapPost);
  }
  
  async createPost(authorId: string, religion: string, input: CreatePostInput): Promise<Post> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: authorId,
        religion: religion,
        title: input.title || '',
        content: input.content || '',
        is_anonymous: input.isAnonymous || false,
        status: PostStatus.PUBLISHED,
        tags: input.tags || [],
        image_url: input.imageUrl,
      })
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to create post');
    return this.mapPost(data);
  }
  
  async updatePost(id: string, input: UpdatePostInput): Promise<Post> {
    const supabase = getSupabase();
    
    const updates: Record<string, unknown> = {};
    if (input.title !== undefined) updates.title = input.title;
    if (input.content) updates.content = input.content;
    if (input.status) updates.status = input.status;
    if (input.tags) updates.tags = input.tags;
    if (input.imageUrl !== undefined) updates.image_url = input.imageUrl;
    
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to update post');
    return this.mapPost(data);
  }
  
  async deletePost(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
  
  async incrementViewCount(id: string): Promise<void> {
    const supabase = getSupabase();
    const { data: current } = await supabase.from('posts').select('view_count').eq('id', id).single();
    if (current) {
      const val = (current.view_count as number) || 0;
      await supabase.from('posts').update({ view_count: val + 1 }).eq('id', id);
    }
  }

  async likePost(userId: string, postId: string, religion: string): Promise<boolean> {
    const canAccessPost = await this.postExistsForReligion(postId, religion);
    if (!canAccessPost) {
      return false;
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('post_likes')
      .insert({ user_id: userId, post_id: postId });
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return false;
      }
      throw new Error(error.message);
    }
    return true;
  }

  async unlikePost(userId: string, postId: string, religion: string): Promise<boolean> {
    const canAccessPost = await this.postExistsForReligion(postId, religion);
    if (!canAccessPost) {
      return false;
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('post_likes')
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('post_id', postId);
    
    if (error) throw new Error(error.message);
    return true;
  }

  async hasLikedPost(userId: string, postId: string, religion: string): Promise<boolean> {
    const canAccessPost = await this.postExistsForReligion(postId, religion);
    if (!canAccessPost) {
      return false;
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
    
    if (error) return false;
    return !!data;
  }

  private async postExistsForReligion(postId: string, religion: string): Promise<boolean> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .eq('religion', religion)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return !!data;
  }
  
  private mapPost(data: Record<string, unknown>): Post {
    return {
      id: data.id as string,
      authorId: data.author_id as string,
      title: data.title as string,
      content: data.content as string,
      isAnonymous: data.is_anonymous as boolean,
      status: data.status as PostStatus,
      tags: data.tags as string[] || [],
      viewCount: data.view_count as number || 0,
      likesCount: data.likes_count as number || 0,
      commentsCount: data.comments_count as number || 0,
      leaderResponsesCount: data.leader_responses_count as number || 0,
      moderationReason: data.moderation_reason as string | undefined,
      imageUrl: data.image_url as string | undefined,
      religion: data.religion as string || 'orthodox',
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }
}

export const postService = new PostService();
