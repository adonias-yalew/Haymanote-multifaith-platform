import { getSupabase } from '../../db/supabaseClient.js';
import { User, UserProfile, UpdateUserInput } from './types.js';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, is_anonymous, created_at, updated_at');
    
    if (error) throw new Error(error.message);
    
    return (data || []).map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      isAnonymous: user.is_anonymous,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));
  }
  
  async getUserById(id: string): Promise<{ user: User; profile: UserProfile | null } | null> {
    const supabase = getSupabase();
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, role, is_anonymous, created_at, updated_at')
      .eq('id', id)
      .single();
    
    if (userError || !user) return null;
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isAnonymous: user.is_anonymous,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      profile: profile ? {
        id: profile.id,
        userId: profile.user_id,
        displayName: profile.display_name,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      } : null,
    };
  }
  
  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const supabase = getSupabase();
    
    const updates: Record<string, unknown> = {};
    if (input.email) updates.email = input.email;
    
    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, email, role, is_anonymous, created_at, updated_at')
      .single();
    
    if (error || !user) throw new Error(error?.message || 'Failed to update user');
    
    // Update profile if provided
    if (input.displayName || input.bio) {
      const profileUpdates: Record<string, unknown> = {};
      if (input.displayName) profileUpdates.display_name = input.displayName;
      if (input.bio) profileUpdates.bio = input.bio;
      
      await supabase
        .from('user_profiles')
        .upsert({ user_id: id, ...profileUpdates }, { onConflict: 'user_id' });
    }
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isAnonymous: user.is_anonymous,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
  
  async deleteUser(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}

export const userService = new UserService();
