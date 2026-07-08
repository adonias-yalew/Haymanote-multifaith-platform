import { getSupabase } from '../../db/supabaseClient.js';
import { generateToken } from '../../utils/jwt.js';
import { UserRole } from '../../types/index.js';
import { AuthUser, LoginInput, RegisterInput, AuthResponse } from './types.js';
import { emailVerificationService } from './emailService.js';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const AUTH_USER_SELECT = 'id, email, role, religion, email_verified, created_at';
const AUTH_USER_SELECT_WITH_STATUS = `${AUTH_USER_SELECT}, account_status`;

const createAuthError = (message: string, statusCode = 400): Error & { statusCode?: number } => {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = statusCode;
  return error;
};

const selectAuthUser = async (supabase: ReturnType<typeof getSupabase>, column: 'email' | 'id', value: string) => {
  let result = await supabase
    .from('users')
    .select(AUTH_USER_SELECT_WITH_STATUS)
    .eq(column, value)
    .single();

  if (result.error && String(result.error.message).includes('account_status')) {
    result = await supabase
      .from('users')
      .select(AUTH_USER_SELECT)
      .eq(column, value)
      .single();
  }

  return result;
};

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { email, password, role = UserRole.USER, isAnonymous = false, religion, organizationName, documentPath } = input;
    
    const supabase = getSupabase();
    
    // Check if user exists in public.users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Supabase check error:', checkError);
      throw new Error(checkError?.message || 'Database error checking user');
    }
    
    if (existingUser) {
      throw createAuthError('User already exists. Please log in or resend your verification code.', 409);
    }
    
    // Create user in Supabase Auth (auth.users)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        religion,
        organizationName
      }
    });

    if (authError || !authData.user) {
      console.error('Supabase Auth insert error:', authError);
      const message = authError?.message || 'Failed to create user in Auth';
      const isDuplicate = message.toLowerCase().includes('already') || message.toLowerCase().includes('registered');
      throw createAuthError(
        isDuplicate ? 'User already exists. Please log in or resend your verification code.' : message,
        isDuplicate ? 409 : 400,
      );
    }
    
    // Build the insert payload conditionally to avoid schema errors if columns don't exist for normal users
    const insertPayload: any = {
      id: authData.user.id,
      email,
      role: role,
      religion: religion,
      organization_name: organizationName,
      email_verified: true,
      account_status: 'ACTIVE',
    };

    // Create user in public.users as active and verified.
    let insertResult = await supabase
      .from('users')
      .insert(insertPayload)
      .select(AUTH_USER_SELECT_WITH_STATUS)
      .single();

    if (insertResult.error && String(insertResult.error.message).includes('account_status')) {
      delete insertPayload.account_status;
      insertResult = await supabase
        .from('users')
        .insert(insertPayload)
        .select(AUTH_USER_SELECT)
        .single();
    }

    const { data: user, error } = insertResult;
    
    if (error || !user) {
      console.error('Supabase insert error:', error);
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw createAuthError(error?.message || error?.details || 'Failed to create user profile', 400);
    }

    await this.createApprovedRoleProfile({
      userId: user.id,
      email,
      role: role as UserRole,
      organizationName,
      documentPath,
    });
    
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      religion: user.religion,
      isAnonymous: isAnonymous,
      emailVerified: true,
      createdAt: user.created_at,
      updatedAt: user.created_at,
    };
    
    const token = generateToken(authUser.id, authUser.email, authUser.role, authUser.religion as any, authUser.isAnonymous);
    return { user: authUser, token };
  }
  
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;
    
    // Use anon key for sign in
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Verify password using Supabase Auth
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      throw new Error('Invalid credentials');
    }
    
    const supabase = getSupabase();
    
    // Get user from public.users
    const { data: user, error } = await selectAuthUser(supabase, 'email', email);
    
    if (error || !user) {
      throw new Error('User profile not found. Please register.');
    }

    if (user.account_status === 'SUSPENDED') {
      throw new Error('Account is suspended. Please contact support.');
    }
    
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      religion: user.religion,
      isAnonymous: false,
      emailVerified: true,
      createdAt: user.created_at,
      updatedAt: user.created_at,
    };
    
    const token = generateToken(authUser.id, authUser.email, authUser.role, authUser.religion as any, authUser.isAnonymous);
    
    return { user: authUser, token };
  }
  
  async getUserById(userId: string): Promise<AuthUser | null> {
    const supabase = getSupabase();
    
    const { data: user, error } = await selectAuthUser(supabase, 'id', userId);
    
    if (error || !user) return null;
    
    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      religion: user.religion,
      isAnonymous: false,
      emailVerified: true,
      createdAt: user.created_at,
      updatedAt: user.created_at,
    };
  }

  /**
   * Verify user's email with a six-digit code and issue an auth session.
   */
  async verifyEmail(token: string, email: string): Promise<AuthResponse | null> {
    const isVerified = await emailVerificationService.verifyToken(token, email);
    if (!isVerified) return null;

    const user = await this.getUserByEmail(email);
    if (!user) return null;

    return {
      user: {
        ...user,
        emailVerified: true,
      },
      token: generateToken(user.id, user.email, user.role, user.religion as any, user.isAnonymous),
    };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    await emailVerificationService.resendVerificationEmail(email);
  }

  /**
   * Check verification status
   */
  async checkVerificationStatus(email: string): Promise<boolean> {
    return emailVerificationService.isEmailVerified(email);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<AuthUser | null> {
    const supabase = getSupabase();
    
    const { data: user, error } = await selectAuthUser(supabase, 'email', email);
    
    if (error || !user) return null;
    
    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      religion: user.religion,
      isAnonymous: false,
      emailVerified: true,
      createdAt: user.created_at,
      updatedAt: user.created_at,
    };
  }

  /**
   * Generate JWT token from user
   */
  generateJWT(user: AuthUser): string {
    return generateToken(user.id, user.email, user.role, user.religion as any, user.isAnonymous);
  }

  private async createApprovedRoleProfile(input: {
    userId: string;
    email: string;
    role: UserRole;
    organizationName?: string;
    documentPath?: string;
  }): Promise<void> {
    const supabase = getSupabase();

    if (input.role === UserRole.LEADER) {
      const profile = {
        user_id: input.userId,
        bio: null,
        status: 'VERIFIED',
        verification_document_url: input.documentPath,
      };

      const { error } = await supabase
        .from('leader_profiles')
        .upsert(profile, { onConflict: 'user_id' });

      if (error) {
        console.error('Failed to create verified leader profile:', error);
      }
    }

    if (input.role === UserRole.VENDOR) {
      const profile = {
        user_id: input.userId,
        organization_name: input.organizationName || input.email.split('@')[0],
        verification_document_url: input.documentPath,
        status: 'VERIFIED',
      };

      const { error } = await supabase
        .from('vendor_profiles')
        .upsert(profile, { onConflict: 'user_id' });

      if (error) {
        console.error('Failed to create verified vendor profile:', error);
      }
    }
  }
}

export const authService = new AuthService();
