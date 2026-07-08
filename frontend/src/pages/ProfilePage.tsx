import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Shield, 
  Award,
  Edit3,
  Camera,
  Heart,
  MessageCircle,
  BookOpen,
  Eye,
  Users,
  Calendar,
  CheckCircle,
  Globe,
  Star,
  ChevronRight,
  Settings,
  Flag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth, useIsLeader, useIsAdmin } from '../hooks/useAuth.tsx';
import Button from '../components/Button';
import Input from '../components/Input';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLeader = useIsLeader();
  const isAdmin = useIsAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Upload file to server
    }
  };
  const [formData, setFormData] = useState({
    displayName: user?.email?.split('@')[0] || '',
    bio: '',
    email: user?.email || '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
    }, 1000);
  };

  const initial = (user?.email?.split('@')[0] || 'U')[0].toUpperCase();
  const roleColors: Record<string, string> = {
    admin: 'from-indigo-500 to-purple-600',
    leader: 'from-emerald-500 to-teal-600',
    vendor: 'from-amber-500 to-orange-600',
    user: 'from-sky-500 to-blue-600',
  };
  const avatarGradient = roleColors[user?.role?.toLowerCase() || 'user'] || roleColors.user;

  const statCards = isLeader
    ? [
        { icon: BookOpen, label: 'Sermons', value: '12', gradient: 'from-indigo-500/10 to-indigo-600/5', iconColor: 'text-indigo-600' },
        { icon: Users, label: 'Followers', value: '245', gradient: 'from-sky-500/10 to-sky-600/5', iconColor: 'text-sky-600' },
        { icon: MessageCircle, label: 'Responses', value: '38', gradient: 'from-emerald-500/10 to-emerald-600/5', iconColor: 'text-emerald-600' },
        { icon: Eye, label: 'Total Reach', value: '1.2K', gradient: 'from-purple-500/10 to-purple-600/5', iconColor: 'text-purple-600' },
      ]
    : isAdmin
    ? [
        { icon: Shield, label: 'Users Managed', value: '--', gradient: 'from-indigo-500/10 to-indigo-600/5', iconColor: 'text-indigo-600' },
        { icon: Flag, label: 'Reports', value: '--', gradient: 'from-rose-500/10 to-rose-600/5', iconColor: 'text-rose-600' },
        { icon: CheckCircle, label: 'Actions', value: '--', gradient: 'from-emerald-500/10 to-emerald-600/5', iconColor: 'text-emerald-600' },
        { icon: Star, label: 'System Health', value: '--', gradient: 'from-amber-500/10 to-amber-600/5', iconColor: 'text-amber-600' },
      ]
    : [
        { icon: BookOpen, label: 'Posts', value: '0', gradient: 'from-emerald-500/10 to-emerald-600/5', iconColor: 'text-emerald-600' },
        { icon: Heart, label: 'Likes', value: '0', gradient: 'from-rose-500/10 to-rose-600/5', iconColor: 'text-rose-600' },
        { icon: MessageCircle, label: 'Comments', value: '0', gradient: 'from-sky-500/10 to-sky-600/5', iconColor: 'text-sky-600' },
        { icon: Eye, label: 'Views', value: '0', gradient: 'from-purple-500/10 to-purple-600/5', iconColor: 'text-purple-600' },
      ];

  const quickLinks = isAdmin
    ? [
        { to: '/dashboard/admin', icon: Shield, label: 'Admin Dashboard' },
        { to: '/dashboard/admin/users', icon: Users, label: 'User Management' },
        { to: '/dashboard/admin/moderation', icon: Flag, label: 'Reports & Moderation' },
        { to: '/dashboard/admin/settings', icon: Settings, label: 'System Settings' },
      ]
    : isLeader
    ? [
        { to: '/leader/my-teachings', icon: BookOpen, label: 'My Teachings' },
        { to: '/sermons', icon: MessageCircle, label: 'Sermons & Teachings' },
        { to: '/dashboard/leader', icon: Users, label: 'Leader Dashboard' },
        { to: '/settings', icon: Shield, label: 'Settings' },
      ]
    : [
        { to: '/my-posts', icon: BookOpen, label: 'My Posts' },
        { to: '/saved', icon: Heart, label: 'Saved Posts' },
        { to: '/settings', icon: Shield, label: 'Settings' },
      ];

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Profile Card */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Avatar Section */}
          <div className="px-6 pt-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="relative z-10">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-lg ring-4 ring-white`}>
                  <span className="text-3xl font-bold text-white">{initial}</span>
                </div>
                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-slate-800 transition-all hover:scale-105"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              <div className="flex-1 min-w-0 pt-0 sm:pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 truncate">
                      {user?.email?.split('@')[0] || 'User'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all shrink-0 ${
                      isEditing
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : isAdmin
                        ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    user?.isAnonymous
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {user?.isAnonymous ? (
                      <Shield className="w-3 h-3" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    {user?.isAnonymous ? 'Anonymous Mode' : 'Public Profile'}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    isAdmin
                      ? 'bg-indigo-50 text-indigo-700'
                      : isLeader
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    <Award className="w-3 h-3" />
                    {user?.role || 'USER'}
                  </span>
                  {!isAdmin && user?.religion && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize bg-sky-50 text-sky-700">
                      <Globe className="w-3 h-3" />
                      {user.religion}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600">
                    <Calendar className="w-3 h-3" />
                    Joined 2025
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSave} className="px-6 pb-6 border-t border-slate-100 pt-6 space-y-4 animate-slideDown">
              <Input
                label="Display Name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="How you want to be called"
              />
              {!isAdmin && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Religion</label>
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 capitalize cursor-not-allowed">
                    {user?.religion || 'Orthodox'}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Please contact support to update your religion</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us a little about yourself..."
                  rows={3}
                  className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                    isAdmin
                      ? 'focus:ring-indigo-500/20 focus:border-indigo-500'
                      : 'focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 sm:px-6 mb-6">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className={`relative group bg-white rounded-xl p-5 shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative z-10">
              <div className={`w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-3 ${stat.iconColor}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="px-4 sm:px-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className={`w-1 h-5 rounded-full ${isAdmin ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
            Quick Links
          </h3>
          <div className="space-y-1">
            {quickLinks.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isAdmin ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                } group-hover:scale-105 transition-transform`}>
                  <link.icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-slate-700">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
};

export default ProfilePage;
