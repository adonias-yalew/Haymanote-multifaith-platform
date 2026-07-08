import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  FileText,
  Filter,
  Flag,
  Globe2,
  Landmark,
  Layers3,
  Search,
  Settings,
  Shield,
  Store,
  Trash2,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { adminApi } from '../services/api';
import type { AxiosError } from 'axios';

type AdminSection = 'dashboard' | 'users' | 'leaders' | 'vendors' | 'religions' | 'posts' | 'teachings' | 'marketplace' | 'reports' | 'verifications' | 'analytics' | 'settings';
type AnyRecord = Record<string, any>;

interface AdminStats {
  totalUsers: number;
  totalLeaders: number;
  totalVendors: number;
  verifiedLeaders: number;
  verifiedVendors: number;
  totalCommunityPosts: number;
  totalTeachings: number;
  totalMarketplaceListings: number;
  pendingVerificationRequests: number;
  reportedContent: number;
  activeUsers: number;
}

interface AdminOverview {
  users: AnyRecord[];
  leaders: AnyRecord[];
  vendors: AnyRecord[];
  religions: AnyRecord[];
  products: AnyRecord[];
  posts: AnyRecord[];
  sermons: AnyRecord[];
  reports: AnyRecord[];
  verificationRequests: AnyRecord[];
  analytics: Record<string, Record<string, number>>;
  settings: Record<string, string[]>;
}

const emptyOverview: AdminOverview = {
  users: [], leaders: [], vendors: [], religions: [],
  products: [], posts: [], sermons: [], reports: [],
  verificationRequests: [], analytics: {}, settings: {},
};

const sections: { id: AdminSection; label: string; icon: LucideIcon; group: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: CircleGauge, group: 'Command' },
  { id: 'users', label: 'Users Management', icon: Users, group: 'Role Management' },
  { id: 'leaders', label: 'Leaders Management', icon: UserCheck, group: 'Role Management' },
  { id: 'vendors', label: 'Vendors Management', icon: Store, group: 'Role Management' },
  { id: 'religions', label: 'Religion Management', icon: Landmark, group: 'Platform' },
  { id: 'posts', label: 'Community Posts', icon: FileText, group: 'Platform' },
  { id: 'teachings', label: 'Teachings & Content', icon: BookOpen, group: 'Platform' },
  { id: 'marketplace', label: 'Marketplace', icon: Boxes, group: 'Platform' },
  { id: 'reports', label: 'Reports & Moderation', icon: Flag, group: 'Governance' },
  { id: 'verifications', label: 'Verification Requests', icon: Shield, group: 'Governance' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, group: 'Intelligence' },
  { id: 'settings', label: 'System Settings', icon: Settings, group: 'System' },
];

const statCards: { key: keyof AdminStats; label: string; icon: LucideIcon; tone: string; desc: string }[] = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, tone: 'from-cyan-500 to-blue-600', desc: 'Registered accounts' },
  { key: 'activeUsers', label: 'Active Users', icon: Activity, tone: 'from-emerald-500 to-teal-600', desc: 'Currently active' },
  { key: 'totalLeaders', label: 'Leaders', icon: UserCheck, tone: 'from-violet-500 to-fuchsia-600', desc: 'Spiritual leaders' },
  { key: 'totalVendors', label: 'Vendors', icon: Store, tone: 'from-teal-500 to-emerald-600', desc: 'Faith marketplace' },
  { key: 'totalCommunityPosts', label: 'Community Posts', icon: FileText, tone: 'from-amber-500 to-orange-600', desc: 'Discussion threads' },
  { key: 'totalTeachings', label: 'Teachings', icon: BookOpen, tone: 'from-indigo-500 to-blue-600', desc: 'Sermons & content' },
  { key: 'totalMarketplaceListings', label: 'Marketplace', icon: Boxes, tone: 'from-rose-500 to-pink-600', desc: 'Product listings' },
  { key: 'pendingVerificationRequests', label: 'Pending Verifications', icon: Shield, tone: 'from-yellow-500 to-amber-600', desc: 'Awaiting review' },
  { key: 'reportedContent', label: 'Reported Content', icon: AlertTriangle, tone: 'from-red-500 to-rose-600', desc: 'Needs moderation' },
];

const RELIGION_COLORS: Record<string, string> = {
  orthodox: '#F59E0B',
  muslim: '#10B981',
  protestant: '#3B82F6',
};

const ROLE_COLORS: Record<string, string> = {
  user: '#6366F1',
  leader: '#8B5CF6',
  vendor: '#14B8A6',
  admin: '#EF4444',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  RESOLVED: '#10B981',
  DISMISSED: '#6B7280',
};

const getUserEmail = (row: AnyRecord) => row.email || row.user?.email || row.author?.email || row.vendor?.email || row.reporter?.email || 'Unknown';
const getDate = (row: AnyRecord) => row.created_at || row.createdAt || row.updated_at || '';
const getReligion = (row: AnyRecord) => row.religion || row.user?.religion || row.author?.religion || row.vendor?.religion || 'unknown';
const getStatus = (row: AnyRecord) => row.account_status || row.status || row.verification_status || (row.published ? 'PUBLISHED' : 'DRAFT');
const formatNumber = (value?: number) => new Intl.NumberFormat().format(value || 0);

const statusVariant = (status?: string) => {
  const normalized = String(status || '').toUpperCase();
  if (['ACTIVE', 'APPROVED', 'VERIFIED', 'RESOLVED', 'PUBLISHED', 'DELIVERED'].includes(normalized)) return 'success';
  if (['PENDING', 'UNDER_REVIEW', 'DRAFT'].includes(normalized)) return 'warning';
  if (['SUSPENDED', 'DELETED', 'REJECTED', 'HIDDEN', 'DISMISSED', 'CANCELLED'].includes(normalized)) return 'danger';
  return 'default';
};

const sectionAliases: Record<string, AdminSection> = {
  dashboard: 'dashboard', users: 'users', leaders: 'leaders', vendors: 'vendors',
  religions: 'religions', community: 'posts', posts: 'posts', teachings: 'teachings',
  marketplace: 'marketplace', moderation: 'reports', reports: 'reports',
  verification: 'verifications', verifications: 'verifications', analytics: 'analytics', settings: 'settings',
};

const resolveSection = (value?: string): AdminSection => sectionAliases[value || ''] || 'dashboard';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-elevated">
      {label && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>{entry.name}: {formatNumber(entry.value)}</p>
      ))}
    </div>
  );
};

const AdminDashboardPage = () => {
  const { section } = useParams();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<AdminSection>(() => resolveSection(section || location.hash.replace('#', '')));
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [overview, setOverview] = useState<AdminOverview>(emptyOverview);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchAdminData(); }, []);

  useEffect(() => {
    setActiveSection(resolveSection(section || location.hash.replace('#', '')));
  }, [location.hash, section]);

  useEffect(() => { setPage(1); setSelected([]); }, [activeSection, query, filter]);

  const fetchAdminData = async () => {
    setIsLoading(true); setError('');
    const [statsRes, overviewRes, religionsRes, settingsRes] = await Promise.allSettled([
      adminApi.getStats(), adminApi.getOverview(), adminApi.getReligions(), adminApi.getSettings(),
    ]);
    if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
    if (overviewRes.status === 'fulfilled') setOverview({ ...emptyOverview, ...overviewRes.value.data.data });
    if (religionsRes.status === 'fulfilled') setOverview((c) => ({ ...c, religions: religionsRes.value.data.data || [] }));
    if (settingsRes.status === 'fulfilled') setOverview((c) => ({ ...c, settings: settingsRes.value.data.data || c.settings }));
    const failures = [statsRes, overviewRes, religionsRes, settingsRes].filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
    if (failures.length > 0) {
      const first = failures[0].reason as AxiosError<{ error?: string; message?: string }>;
      setError(`Unable to load some admin data: ${first.response?.data?.error || first.response?.data?.message || first.message}`);
      console.error('Failed to load admin dashboard:', failures.map((f) => f.reason));
    }
    setIsLoading(false);
  };

  const sectionRows = useMemo(() => {
    switch (activeSection) {
      case 'users': return overview.users;
      case 'leaders': return overview.leaders;
      case 'vendors': return overview.vendors;
      case 'posts': return overview.posts;
      case 'teachings': return overview.sermons;
      case 'marketplace': return overview.products;
      case 'reports': return overview.reports;
      case 'verifications':
        return [
          ...overview.verificationRequests.map((r) => ({ ...r, request_kind: 'document' })),
          ...overview.leaders.filter((r) => r.status === 'PENDING').map((r) => ({ ...r, request_kind: 'leader' })),
          ...overview.vendors.filter((r) => r.status === 'PENDING').map((r) => ({ ...r, request_kind: 'vendor' })),
        ];
      case 'religions': return overview.religions;
      case 'settings': return Array.isArray(overview.settings) ? overview.settings : [];
      default: return [];
    }
  }, [activeSection, overview]);

  const filteredRows = useMemo(() => {
    const nq = query.trim().toLowerCase();
    return sectionRows.filter((row) => {
      const haystack = JSON.stringify(row).toLowerCase();
      const rf = `${getReligion(row)} ${getStatus(row)} ${row.role || row.user?.role || ''}`.toLowerCase();
      return (!nq || haystack.includes(nq)) && (filter === 'all' || rf.includes(filter.toLowerCase()));
    });
  }, [filter, query, sectionRows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / 8));
  const paginatedRows = filteredRows.slice((page - 1) * 8, page * 8);
  const activeMeta = sections.find((s) => s.id === activeSection) || sections[0];

  const confirmAndRun = async (message: string, action: () => Promise<void>) => {
    if (!window.confirm(message)) return;
    await action(); await fetchAdminData();
  };

  const bulkUserStatus = async (status: 'ACTIVE' | 'SUSPENDED') => {
    await confirmAndRun(`Apply ${status.toLowerCase()} to ${selected.length} selected accounts?`, async () => {
      await Promise.all(selected.map((id) => adminApi.updateUserStatus(id, status)));
    });
  };

  // Derive chart data from analytics
  const religionPieData = useMemo(() => {
    const rub = overview.analytics?.usersByReligion || {};
    return Object.entries(rub).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: RELIGION_COLORS[name] || '#6B7280' }));
  }, [overview.analytics]);

  const rolePieData = useMemo(() => {
    const urb = overview.analytics?.usersByRole || {};
    return Object.entries(urb).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: ROLE_COLORS[name] || '#6B7280' }));
  }, [overview.analytics]);

  const contentByReligionData = useMemo(() => {
    const rels = ['orthodox', 'muslim', 'protestant'];
    const posts = overview.analytics?.postsByReligion || {};
    const sermons = overview.analytics?.sermonsByReligion || {};
    const products = overview.analytics?.productsByReligion || {};
    return rels.map((r) => ({
      name: r.charAt(0).toUpperCase() + r.slice(1),
      Posts: posts[r] || 0,
      Teachings: sermons[r] || 0,
      Products: products[r] || 0,
    }));
  }, [overview.analytics]);

  const contentOverviewData = useMemo(() => [
    { name: 'Posts', value: stats?.totalCommunityPosts || 0, color: '#F59E0B' },
    { name: 'Comments', value: stats && 'totalComments' in stats ? (stats as any).totalComments || 0 : 0, color: '#6366F1' },
    { name: 'Teachings', value: stats?.totalTeachings || 0, color: '#8B5CF6' },
    { name: 'Marketplace', value: stats?.totalMarketplaceListings || 0, color: '#14B8A6' },
  ], [stats]);

  const reportsStatusData = useMemo(() => {
    const rsb = overview.analytics?.reportsByStatus || {};
    return Object.entries(rsb).map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || '#6B7280' }));
  }, [overview.analytics]);

  const renderRowActions = (row: AnyRecord) => {
    if (activeSection === 'users') {
      return (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Activate this account?', () => adminApi.updateUserStatus(row.id, 'ACTIVE').then())}>Activate</Button>
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Suspend this account?', () => adminApi.updateUserStatus(row.id, 'SUSPENDED').then())}>Suspend</Button>
          <Button size="sm" variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => confirmAndRun('Delete this account?', () => adminApi.deleteUser(row.id).then())}>Delete</Button>
        </div>
      );
    }
    if (activeSection === 'vendors') {
      return (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Verify this vendor?', () => adminApi.updateVendor(row.id, { status: 'VERIFIED' }).then())}>Verify</Button>
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Suspend this vendor account?', () => adminApi.updateUserStatus(row.user_id, 'SUSPENDED').then())}>Suspend</Button>
          <Button size="sm" variant="danger" onClick={() => confirmAndRun('Reject this vendor?', () => adminApi.updateVendor(row.id, { status: 'REJECTED' }).then())}>Reject</Button>
        </div>
      );
    }
    if (activeSection === 'leaders') {
      return (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Verify this leader?', () => adminApi.updateLeader(row.id, { status: 'VERIFIED' }).then())}>Verify</Button>
          <Button size="sm" variant="danger" onClick={() => confirmAndRun('Reject this leader?', () => adminApi.updateLeader(row.id, { status: 'REJECTED' }).then())}>Reject</Button>
        </div>
      );
    }
    if (activeSection === 'posts') {
      return (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Publish this post?', () => adminApi.moderatePost(row.id, { status: 'PUBLISHED' }).then())}>Publish</Button>
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Hide this post?', () => adminApi.moderatePost(row.id, { status: 'HIDDEN', reason: 'Hidden by admin' }).then())}>Hide</Button>
          <Button size="sm" variant="danger" onClick={() => confirmAndRun('Delete this post permanently?', () => adminApi.deletePost(row.id).then())}>Delete</Button>
        </div>
      );
    }
    if (activeSection === 'teachings') {
      return (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Publish this teaching?', () => adminApi.updateTeaching(row.id, { published: true }).then())}>Publish</Button>
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Unpublish this teaching?', () => adminApi.updateTeaching(row.id, { published: false }).then())}>Unpublish</Button>
          <Button size="sm" variant="danger" onClick={() => confirmAndRun('Delete this teaching permanently?', () => adminApi.deleteTeaching(row.id).then())}>Delete</Button>
        </div>
      );
    }
    if (activeSection === 'marketplace') {
      return (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Mark this listing out of stock?', () => adminApi.updateProduct(row.id, { stock: 0 }).then())}>Out of stock</Button>
          <Button size="sm" variant="danger" onClick={() => confirmAndRun('Delete this listing permanently?', () => adminApi.deleteProduct(row.id).then())}>Delete</Button>
        </div>
      );
    }
    if (activeSection === 'reports') {
      return (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Resolve this report?', () => adminApi.reviewReport(row.id, { status: 'RESOLVED', actionTaken: 'Resolved by admin' }).then())}>Resolve</Button>
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Dismiss this report?', () => adminApi.reviewReport(row.id, { status: 'DISMISSED', actionTaken: 'Dismissed by admin' }).then())}>Dismiss</Button>
        </div>
      );
    }
    if (activeSection === 'verifications') {
      if (row.request_kind === 'leader') {
        return (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Approve this leader?', () => adminApi.updateLeader(row.id, { status: 'VERIFIED' }).then())}>Approve</Button>
            <Button size="sm" variant="danger" onClick={() => confirmAndRun('Reject this leader?', () => adminApi.updateLeader(row.id, { status: 'REJECTED' }).then())}>Reject</Button>
          </div>
        );
      }
      if (row.request_kind === 'vendor') {
        return (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Approve this vendor?', () => adminApi.updateVendor(row.id, { status: 'VERIFIED' }).then())}>Approve</Button>
            <Button size="sm" variant="danger" onClick={() => confirmAndRun('Reject this vendor?', () => adminApi.updateVendor(row.id, { status: 'REJECTED' }).then())}>Reject</Button>
          </div>
        );
      }
      return (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Approve this verification request?', () => adminApi.reviewVerificationRequest(row.id, { status: 'APPROVED' }).then())}>Approve</Button>
          <Button size="sm" variant="danger" onClick={() => confirmAndRun('Reject this verification request?', () => adminApi.reviewVerificationRequest(row.id, { status: 'REJECTED', rejectionReason: 'Rejected by admin' }).then())}>Reject</Button>
        </div>
      );
    }
    if (activeSection === 'religions') {
      return (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Activate this religion category?', () => adminApi.updateReligion(row.id, { isActive: true }).then())}>Activate</Button>
          <Button size="sm" variant="secondary" onClick={() => confirmAndRun('Deactivate this religion category?', () => adminApi.updateReligion(row.id, { isActive: false }).then())}>Deactivate</Button>
          <Button size="sm" variant="danger" onClick={() => confirmAndRun('Delete this religion category?', () => adminApi.deleteReligion(row.id).then())}>Delete</Button>
        </div>
      );
    }
    return null;
  };

  const renderManagementTable = () => (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{activeMeta.label}</h2>
          <p className="text-sm text-slate-500">{formatNumber(filteredRows.length)} live backend records</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 sm:w-64" placeholder="Search records" />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100">
              <option value="all">All filters</option>
              <option value="orthodox">Orthodox</option>
              <option value="muslim">Muslim</option>
              <option value="protestant">Protestant</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>
      {selected.length > 0 && activeSection === 'users' && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-100 bg-cyan-50 px-4 py-3 text-sm">
          <span className="font-medium text-cyan-900">{selected.length} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => bulkUserStatus('ACTIVE')}>Bulk Activate</Button>
            <Button size="sm" variant="secondary" onClick={() => bulkUserStatus('SUSPENDED')}>Bulk Suspend</Button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="w-12 px-4 py-3">
                {activeSection === 'users' && <input type="checkbox" checked={paginatedRows.length > 0 && paginatedRows.every((r) => selected.includes(r.id))} onChange={(e) => setSelected(e.target.checked ? paginatedRows.map((r) => r.id) : [])} />}
              </th>
              <th className="px-4 py-3 font-semibold">Primary</th>
              <th className="px-4 py-3 font-semibold">Owner</th>
              <th className="px-4 py-3 font-semibold">Religion</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRows.map((rawRow) => {
              const row = rawRow as AnyRecord;
              return (
              <tr key={row.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-4">
                  {activeSection === 'users' && <input type="checkbox" checked={selected.includes(row.id)} onChange={(e) => setSelected((c) => e.target.checked ? [...c, row.id] : c.filter((id) => id !== row.id))} />}
                </td>
                <td className="max-w-xs px-4 py-4">
                  <p className="truncate font-semibold text-slate-950">{row.title || row.email || row.name || row.specialization || row.reason || row.religion || row.id}</p>
                  <p className="line-clamp-1 text-xs text-slate-500">{row.content || row.description || row.bio || row.category || row.target_type || row.document_name || row.role || row.id}</p>
                </td>
                <td className="px-4 py-4 text-slate-600">{getUserEmail(row)}</td>
                <td className="px-4 py-4 capitalize text-slate-600">{getReligion(row)}</td>
                <td className="px-4 py-4"><Badge variant={statusVariant(getStatus(row))} size="sm">{getStatus(row)}</Badge></td>
                <td className="px-4 py-4 text-slate-500">{getDate(row) ? new Date(getDate(row)).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-4">{renderRowActions(row)}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {paginatedRows.length === 0 && (
        <div className="py-12 text-center text-slate-500">
          <Layers3 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          No records found.
        </div>
      )}
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" leftIcon={<ChevronLeft className="h-4 w-4" />} disabled={page === 1} onClick={() => setPage((v) => Math.max(1, v - 1))}>Prev</Button>
          <Button size="sm" variant="secondary" rightIcon={<ChevronRight className="h-4 w-4" />} disabled={page === totalPages} onClick={() => setPage((v) => Math.min(totalPages, v + 1))}>Next</Button>
        </div>
      </div>
    </div>
  );

  const renderDashboardCharts = () => (
    <>
      {/* Stat cards row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <div key={stat.key} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
            <div className={`absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-gradient-to-br ${stat.tone} opacity-10 blur-xl transition-all duration-300 group-hover:opacity-20 group-hover:scale-110`} />
            <div className="relative">
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${stat.tone} text-white shadow-lg`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-slate-950">{isLoading ? '-' : formatNumber(stats?.[stat.key])}</p>
              <p className="mt-0.5 text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-0.5 text-xs text-slate-400">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1: Donut charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users by Religion */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="mb-1 text-base font-semibold text-slate-950">Users by Religion</h3>
          <p className="mb-4 text-sm text-slate-500">Faith distribution across all registered accounts</p>
          {religionPieData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={religionPieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" animationBegin={0} animationDuration={1200}>
                  {religionPieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke={entry.color} strokeWidth={1} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value: string) => <span className="text-sm font-medium text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">No data available</div>
          )}
        </div>

        {/* Users by Role */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="mb-1 text-base font-semibold text-slate-950">Users by Role</h3>
          <p className="mb-4 text-sm text-slate-500">Platform role distribution (members, leaders, vendors)</p>
          {rolePieData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={rolePieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" animationBegin={200} animationDuration={1200}>
                  {rolePieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke={entry.color} strokeWidth={1} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value: string) => <span className="text-sm font-medium text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">No data available</div>
          )}
        </div>
      </div>

      {/* Charts row 2: Bar charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Content by Religion */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="mb-1 text-base font-semibold text-slate-950">Content by Religion</h3>
          <p className="mb-4 text-sm text-slate-500">Posts, teachings, and products per faith group</p>
          {contentByReligionData.some((d) => d.Posts + d.Teachings + d.Products > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contentByReligionData} barGap={4} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#E2E8F0' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="rect"
                  formatter={(value: string) => <span className="text-sm font-medium text-slate-600">{value}</span>}
                />
                <Bar dataKey="Posts" fill="#F59E0B" radius={[4, 4, 0, 0]} animationBegin={0} animationDuration={800} />
                <Bar dataKey="Teachings" fill="#8B5CF6" radius={[4, 4, 0, 0]} animationBegin={200} animationDuration={800} />
                <Bar dataKey="Products" fill="#14B8A6" radius={[4, 4, 0, 0]} animationBegin={400} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">No data available</div>
          )}
        </div>

        {/* Content Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="mb-1 text-base font-semibold text-slate-950">Content Overview</h3>
          <p className="mb-4 text-sm text-slate-500">Total content volume across platform features</p>
          {contentOverviewData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contentOverviewData} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: '#E2E8F0' }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} animationBegin={0} animationDuration={1000}>
                  {contentOverviewData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">No data available</div>
          )}
        </div>
      </div>

      {/* Charts row 3: Area / Reports */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reports Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="mb-1 text-base font-semibold text-slate-950">Report Status Breakdown</h3>
          <p className="mb-4 text-sm text-slate-500">Current moderation workload</p>
          {reportsStatusData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={reportsStatusData} cx="50%" cy="50%" outerRadius={100} paddingAngle={4} dataKey="value" animationBegin={0} animationDuration={1000}>
                  {reportsStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value: string) => <span className="text-sm font-medium text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">No reports data</div>
          )}
        </div>

        {/* Quick metrics */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="mb-1 text-base font-semibold text-slate-950">Platform Health</h3>
          <p className="mb-4 text-sm text-slate-500">Key operational metrics at a glance</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Verified Leaders', value: stats?.verifiedLeaders, total: stats?.totalLeaders, color: 'from-violet-500 to-fuchsia-600', icon: UserCheck },
              { label: 'Verified Vendors', value: stats?.verifiedVendors, total: stats?.totalVendors, color: 'from-teal-500 to-emerald-600', icon: Store },
              { label: 'Pending Reports', value: stats?.reportedContent, color: 'from-red-500 to-rose-600', icon: Flag },
              { label: 'Pending Verifications', value: stats?.pendingVerificationRequests, color: 'from-yellow-500 to-amber-600', icon: Shield },
            ].map((metric) => (
              <div key={metric.label} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50">
                <div className="mb-2 flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br ${metric.color} text-white shadow`}>
                    <metric.icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-950">{formatNumber(metric.value)}</p>
                <p className="text-xs text-slate-500">{metric.label}</p>
                {metric.total !== undefined && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                    <div className="h-1.5 rounded-full bg-gradient-to-r" style={{ width: `${metric.total > 0 ? ((metric.value || 0) / metric.total) * 100 : 0}%`, background: 'linear-gradient(to right, #8B5CF6, #EC4899)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics section */}
      {Object.entries(overview.analytics || {}).length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Object.entries(overview.analytics).filter(([k]) => !['usersByReligion', 'postsByReligion', 'sermonsByReligion', 'productsByReligion', 'usersByRole', 'reportsByStatus'].includes(k)).map(([name, values]) => (
            <div key={name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{name.replace(/([A-Z])/g, ' $1')}</h3>
              <div className="space-y-3">
                {Object.entries(values || {}).map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="capitalize text-slate-600">{label}</span>
                      <span className="font-semibold text-slate-950">{formatNumber(value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${Math.min(100, (value / Math.max(1, Math.max(...Object.values(values)))) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderAnalyticsCharts = () => (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="mb-1 text-base font-semibold text-slate-950">Users by Religion</h3>
          <p className="mb-4 text-sm text-slate-500">Faith distribution across platform</p>
          {religionPieData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={religionPieData} cx="50%" cy="50%" outerRadius={110} paddingAngle={2} dataKey="value" animationBegin={0} animationDuration={1200}>
                  {religionPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">No data</div>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="mb-1 text-base font-semibold text-slate-950">Content by Religion</h3>
          <p className="mb-4 text-sm text-slate-500">Cross-religion content distribution</p>
          {contentByReligionData.some((d) => d.Posts + d.Teachings + d.Products > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contentByReligionData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Posts" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Teachings" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Products" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">No data</div>}
        </div>
      </div>
      {Object.entries(overview.analytics || {}).map(([name, values]) => (
        <div key={name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{name.replace(/([A-Z])/g, ' $1')}</h3>
          <div className="space-y-3">
            {Object.entries(values || {}).map(([label, value]) => (
              <div key={label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-950">{formatNumber(value)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${Math.min(100, (value / Math.max(1, Math.max(...Object.values(values)))) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-100">
      <main className="space-y-6">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
          <div className="bg-slate-950 px-6 py-7 text-white">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-cyan-200">
                  <Globe2 className="h-4 w-4" />
                  Unrestricted cross-religion administration
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">Premium Admin Dashboard</h2>
                <p className="mt-1 text-sm text-slate-300">Live platform operations, moderation, verification, analytics, and marketplace control.</p>
              </div>
              <Button variant="secondary" leftIcon={<Activity className="h-4 w-4" />} onClick={fetchAdminData}>Refresh Data</Button>
            </div>
          </div>
          {error && <div className="border-t border-red-200 bg-red-50 px-6 py-3 text-sm font-medium text-red-700">{error}</div>}
        </section>

        {activeSection === 'dashboard' && renderDashboardCharts()}
        {activeSection === 'analytics' && renderAnalyticsCharts()}

        {!['dashboard', 'analytics'].includes(activeSection) && activeSection !== 'settings' && renderManagementTable()}

        {activeSection === 'settings' && !Array.isArray(overview.settings) && (
          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(overview.settings || {}).map(([name, values]) => (
              <div key={name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
                <h3 className="mb-3 text-lg font-semibold text-slate-950">{name.replace(/([A-Z])/g, ' $1')}</h3>
                <div className="flex flex-wrap gap-2">
                  {(values || []).map((value) => <Badge key={value} variant="default" size="md">{value}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'settings' && Array.isArray(overview.settings) && renderManagementTable()}

        {isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-card">
            Loading live admin data...
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
