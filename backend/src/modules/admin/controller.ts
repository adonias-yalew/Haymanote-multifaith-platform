import { Request, Response } from 'express';
import { getSupabase } from '../../db/supabaseClient.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { AuthRequest } from '../../middleware/auth.js';

const RELIGIONS = ['orthodox', 'muslim', 'protestant'];
const USER_ROLES = ['user', 'leader', 'vendor', 'admin'];
const ACCOUNT_STATUSES = ['ACTIVE', 'SUSPENDED'];
const LEADER_STATUSES = ['PENDING', 'VERIFIED', 'REJECTED'];
const REPORT_STATUSES = ['PENDING', 'RESOLVED', 'DISMISSED'];
const ORDER_STATUSES = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const isSchemaError = (error: unknown) => {
  const message = error instanceof Error ? error.message : (error as any)?.message || String(error);
  return [
    'does not exist',
    'Could not find the table',
    'Could not find a relationship',
    'more than one relationship',
    'schema cache',
    'column',
  ].some((fragment) => message.includes(fragment));
};

const countRows = async (table: string, apply?: (query: any) => any): Promise<number> => {
  const supabase = getSupabase();
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (apply) query = apply(query);
  const { count, error } = await query;
  if (error) {
    if (isSchemaError(error)) return 0;
    throw new Error(error.message);
  }
  return count || 0;
};

const getRows = async (table: string, select = '*', orderColumn = 'created_at') => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .order(orderColumn, { ascending: false });

  if (error) {
    if (isSchemaError(error)) return [];
    throw new Error(error.message);
  }
  return data || [];
};

const getRowsWithFallback = async (table: string, select: string, fallbackSelect: string, orderColumn = 'created_at') => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .order(orderColumn, { ascending: false });

  if (!error) return data || [];
  if (isSchemaError(error)) return getRows(table, fallbackSelect, orderColumn);
  throw new Error(error.message);
};

const toReligionCounts = async (table: string) => {
  const rows = await getRows(table, 'religion');
  return RELIGIONS.reduce<Record<string, number>>((acc, religion) => {
    acc[religion] = rows.filter((row: any) => row.religion === religion).length;
    return acc;
  }, {});
};

export class AdminController {
  getStats = asyncHandler(async (_req: Request, res: Response) => {
    const [
      totalUsers,
      totalLeaders,
      totalVendors,
      verifiedLeaders,
      verifiedVendors,
      totalPosts,
      totalComments,
      totalSermons,
      totalProducts,
      pendingVerificationRequests,
      pendingLeaderRequests,
      pendingReports,
    ] = await Promise.all([
      countRows('users'),
      countRows('users', (q) => q.eq('role', 'leader')),
      countRows('users', (q) => q.eq('role', 'vendor')),
      countRows('leader_profiles', (q) => q.eq('status', 'VERIFIED')),
      countRows('vendor_profiles', (q) => q.eq('status', 'VERIFIED')),
      countRows('posts'),
      countRows('comments'),
      countRows('sermons'),
      countRows('products'),
      countRows('verification_requests', (q) => q.eq('status', 'PENDING')),
      countRows('leader_profiles', (q) => q.eq('status', 'PENDING')),
      countRows('reports', (q) => q.eq('status', 'PENDING')),
    ]);

    const users = await this.fetchUsers();
    const activeUsers = users.filter((user: any) => (user.account_status || 'ACTIVE') === 'ACTIVE').length;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalLeaders,
        totalVendors,
        verifiedLeaders,
        verifiedVendors,
        totalCommunityPosts: totalPosts,
        totalPosts,
        totalComments,
        totalTeachings: totalSermons,
        totalSermons,
        totalMarketplaceListings: totalProducts,
        totalProducts,
        pendingVerificationRequests: pendingVerificationRequests + pendingLeaderRequests,
        reportedContent: pendingReports,
        pendingReports,
        activeUsers,
      },
    });
  });

  getOverview = asyncHandler(async (_req: Request, res: Response) => {
    const [users, leaders, vendorProfiles, products, posts, sermons, reports, verificationRequests] = await Promise.all([
      this.fetchUsers(),
      getRowsWithFallback('leader_profiles', '*, user:users(email, role, religion)', '*'),
      getRowsWithFallback('vendor_profiles', '*, user:users(email, role, religion, organization_name)', '*'),
      getRowsWithFallback('products', '*, vendor:users(email, role, religion)', '*'),
      getRowsWithFallback('posts', '*, author:users(email, role, religion)', '*'),
      getRowsWithFallback('sermons', '*, author:users(email, role, religion)', '*'),
      getRowsWithFallback('reports', '*, reporter:users(email, role, religion)', '*'),
      getRowsWithFallback('verification_requests', '*, user:users(email, role, religion)', '*'),
    ]);

    const [usersByReligion, postsByReligion, sermonsByReligion, productsByReligion] = await Promise.all([
      toReligionCounts('users'),
      toReligionCounts('posts'),
      toReligionCounts('sermons'),
      toReligionCounts('products'),
    ]);

    res.json({
      success: true,
      data: {
        users,
        leaders,
        vendors: vendorProfiles,
        products,
        posts,
        sermons,
        reports,
        verificationRequests,
        analytics: {
          usersByReligion,
          postsByReligion,
          sermonsByReligion,
          productsByReligion,
          usersByRole: USER_ROLES.reduce<Record<string, number>>((acc, role) => {
            acc[role] = users.filter((user: any) => user.role === role).length;
            return acc;
          }, {}),
          reportsByStatus: REPORT_STATUSES.reduce<Record<string, number>>((acc, status) => {
            acc[status] = reports.filter((report: any) => report.status === status).length;
            return acc;
          }, {}),
        },
        settings: {
          religions: RELIGIONS,
          userRoles: USER_ROLES,
          accountStatuses: ACCOUNT_STATUSES,
          leaderStatuses: LEADER_STATUSES,
          reportStatuses: REPORT_STATUSES,
          orderStatuses: ORDER_STATUSES,
        },
      },
    });
  });

  getUsers = asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await this.fetchUsers() });
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role, religion, displayName, bio, accountStatus, verificationStatus } = req.body;
    const updates: Record<string, unknown> = {};

    if (role !== undefined) updates.role = role;
    if (religion !== undefined) updates.religion = religion;
    if (displayName !== undefined) updates.display_name = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (accountStatus !== undefined) updates.account_status = accountStatus;
    if (verificationStatus !== undefined) updates.verification_status = verificationStatus;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, data, message: 'User updated successfully' });
  });

  updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, data, message: `User role updated to ${role}` });
  });

  updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { status } = req.body;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .update({ account_status: status })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, data, message: `User ${String(status).toLowerCase()}` });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const supabase = getSupabase();
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, message: 'User deleted' });
  });

  getLeaders = asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await getRowsWithFallback('leader_profiles', '*, user:users(email, role, religion)', '*') });
  });

  updateLeader = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { leaderId } = req.params;
    const { status, bio, specialization, credentials, yearsOfExperience, rejectionReason } = req.body;
    const updates: Record<string, unknown> = {};

    if (status !== undefined) updates.status = status;
    if (bio !== undefined) updates.bio = bio;
    if (specialization !== undefined) updates.specialization = specialization;
    if (credentials !== undefined) updates.credentials = credentials;
    if (yearsOfExperience !== undefined) updates.years_of_experience = yearsOfExperience;
    if (rejectionReason !== undefined) updates.rejection_reason = rejectionReason;
    if (status === 'VERIFIED') {
      updates.verified_at = new Date().toISOString();
      updates.verified_by = req.user?.userId;
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('leader_profiles')
      .update(updates)
      .eq('id', leaderId)
      .select('*')
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    if (status === 'VERIFIED') {
      await supabase.from('users').update({ role: 'leader' }).eq('id', data.user_id);
    }

    res.json({ success: true, data, message: 'Leader profile updated' });
  });

  getProducts = asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await getRowsWithFallback('products', '*, vendor:users(email, role, religion)', '*') });
  });

  getVendors = asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await getRowsWithFallback('vendor_profiles', '*, user:users(email, role, religion, organization_name)', '*') });
  });

  updateVendor = asyncHandler(async (req: Request, res: Response) => {
    const { vendorId } = req.params;
    const { status, organizationName, verificationDocumentUrl } = req.body;
    const updates: Record<string, unknown> = {};

    if (status !== undefined) updates.status = status;
    if (organizationName !== undefined) updates.organization_name = organizationName;
    if (verificationDocumentUrl !== undefined) updates.verification_document_url = verificationDocumentUrl;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('vendor_profiles')
      .update(updates)
      .eq('id', vendorId)
      .select('*, user:users(email, role, religion, organization_name)')
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    if (status === 'VERIFIED') {
      await supabase.from('users').update({ role: 'vendor' }).eq('id', data.user_id);
    }

    res.json({ success: true, data, message: 'Vendor profile updated' });
  });

  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { title, description, price, category, stock, religion, imageUrl } = req.body;
    const updates: Record<string, unknown> = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (stock !== undefined) updates.stock = stock;
    if (religion !== undefined) updates.religion = religion;
    if (imageUrl !== undefined) updates.image_url = imageUrl;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select('*')
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, data, message: 'Product updated' });
  });

  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const supabase = getSupabase();
    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, message: 'Product deleted' });
  });

  getPostsForModeration = asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await getRowsWithFallback('posts', '*, author:users(email, role, religion)', '*') });
  });

  moderatePost = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { status, reason, title, content } = req.body;
    const updates: Record<string, unknown> = {};

    if (status !== undefined) updates.status = status;
    if (reason !== undefined) updates.moderation_reason = reason;
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .select('*')
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, data, message: `Post ${status ? String(status).toLowerCase() : 'updated'}` });
  });

  deletePost = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const supabase = getSupabase();
    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, message: 'Post deleted' });
  });

  getSermons = asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await getRowsWithFallback('sermons', '*, author:users(email, role, religion)', '*') });
  });

  updateSermon = asyncHandler(async (req: Request, res: Response) => {
    const { sermonId } = req.params;
    const { title, content, excerpt, published, religion } = req.body;
    const updates: Record<string, unknown> = {};

    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (published !== undefined) updates.published = published;
    if (religion !== undefined) updates.religion = religion;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('sermons')
      .update(updates)
      .eq('id', sermonId)
      .select('*')
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, data, message: 'Teaching updated' });
  });

  deleteSermon = asyncHandler(async (req: Request, res: Response) => {
    const { sermonId } = req.params;
    const supabase = getSupabase();
    const { error } = await supabase.from('sermons').delete().eq('id', sermonId);

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, message: 'Teaching deleted' });
  });

  getReports = asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await getRowsWithFallback('reports', '*, reporter:users(email, role, religion)', '*') });
  });

  reviewReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reportId } = req.params;
    const { status, actionTaken } = req.body;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('reports')
      .update({
        status,
        action_taken: actionTaken,
        reviewed_by: req.user?.userId,
      })
      .eq('id', reportId)
      .select('*')
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, data, message: 'Report reviewed' });
  });

  getVerificationRequests = asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await getRowsWithFallback('verification_requests', '*, user:users(email, role, religion)', '*') });
  });

  reviewVerificationRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { requestId } = req.params;
    const { status, rejectionReason } = req.body;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('verification_requests')
      .update({
        status,
        rejection_reason: rejectionReason,
        reviewed_by: req.user?.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select('*')
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    await supabase
      .from('users')
      .update({
        verification_status: status,
        verification_rejected_reason: rejectionReason,
      })
      .eq('id', data.user_id);

    res.json({ success: true, data, message: 'Verification request reviewed' });
  });

  getReligionCategories = asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await getRows('religion_categories', '*', 'name') });
  });

  createReligionCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name, slug, description, isActive } = req.body;
    const { data, error } = await getSupabase()
      .from('religion_categories')
      .insert({ name, slug, description, is_active: isActive })
      .select('*')
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.status(201).json({ success: true, data, message: 'Religion category created' });
  });

  updateReligionCategory = asyncHandler(async (req: Request, res: Response) => {
    const { religionId } = req.params;
    const { name, description, isActive } = req.body;
    const updates: Record<string, unknown> = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data, error } = await getSupabase()
      .from('religion_categories')
      .update(updates)
      .eq('id', religionId)
      .select('*')
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, data, message: 'Religion category updated' });
  });

  deleteReligionCategory = asyncHandler(async (req: Request, res: Response) => {
    const { religionId } = req.params;
    const { error } = await getSupabase().from('religion_categories').delete().eq('id', religionId);

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, message: 'Religion category deleted' });
  });

  getSystemSettings = asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: await getRows('system_settings', '*', 'key') });
  });

  upsertSystemSetting = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { key } = req.params;
    const { value, description } = req.body;
    const { data, error } = await getSupabase()
      .from('system_settings')
      .upsert({ key, value, description, updated_by: req.user?.userId })
      .select('*')
      .single();

    if (error) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    res.json({ success: true, data, message: 'System setting saved' });
  });

  private fetchUsers = async () => {
    return getRowsWithFallback(
      'users',
      'id, email, role, religion, is_anonymous, display_name, bio, avatar_url, reputation_score, helpfulness_badge, email_verified, verification_status, account_status, created_at, updated_at',
      'id, email, role, religion, is_anonymous, display_name, bio, avatar_url, reputation_score, helpfulness_badge, email_verified, verification_status, created_at, updated_at',
    );
  };
}

export const adminController = new AdminController();
