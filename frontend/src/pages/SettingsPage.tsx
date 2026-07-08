import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Bell, 
  Moon,
  Globe,
  Lock,
  Mail,
  Trash2,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';
import Button from '../components/Button';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    anonymousMode: user?.isAnonymous || false,
    emailNotifications: true,
    darkMode: false,
    language: 'English',
    privateProfile: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure? This will permanently delete your account and all data.')) {
      // TODO: Call delete account API
      logout();
      navigate('/welcome');
    }
  };

  const Toggle = ({ 
    checked, 
    onChange 
  }: { 
    checked: boolean; 
    onChange: () => void 
  }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-emerald-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
          checked ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-600">
            Manage your preferences and account
          </p>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Privacy</h2>
            <p className="text-sm text-slate-500">Control your visibility</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {settings.anonymousMode ? (
                <EyeOff className="w-5 h-5 text-slate-400" />
              ) : (
                <Eye className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <p className="font-medium text-slate-700">Anonymous Mode</p>
                <p className="text-xs text-slate-500">Hide your identity on posts</p>
              </div>
            </div>
            <Toggle 
              checked={settings.anonymousMode} 
              onChange={() => handleToggle('anonymousMode')} 
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-700">Private Profile</p>
                <p className="text-xs text-slate-500">Only you can see your profile</p>
              </div>
            </div>
            <Toggle 
              checked={settings.privateProfile} 
              onChange={() => handleToggle('privateProfile')} 
            />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Notifications</h2>
            <p className="text-sm text-slate-500">Choose what you get notified about</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <p className="font-medium text-slate-700">Email Notifications</p>
              <p className="text-xs text-slate-500">Get updates via email</p>
            </div>
          </div>
          <Toggle 
            checked={settings.emailNotifications} 
            onChange={() => handleToggle('emailNotifications')} 
          />
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Moon className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Appearance</h2>
            <p className="text-sm text-slate-500">Customize your experience</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-slate-400" />
            <div>
              <p className="font-medium text-slate-700">Dark Mode</p>
              <p className="text-xs text-slate-500">Easier on the eyes</p>
            </div>
          </div>
          <Toggle 
            checked={settings.darkMode} 
            onChange={() => handleToggle('darkMode')} 
          />
        </div>

        <Link 
          to="/language" 
          className="flex items-center justify-between py-3"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-slate-400" />
            <div>
              <p className="font-medium text-slate-700">Language</p>
              <p className="text-xs text-slate-500">{settings.language}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Danger Zone</h2>
            <p className="text-sm text-slate-500">Irreversible actions</p>
          </div>
        </div>

        <Button 
          variant="danger" 
          onClick={handleDeleteAccount}
          leftIcon={<Trash2 className="w-4 h-4" />}
          className="w-full"
        >
          Delete My Account
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-400">
        Haymanote v1.0.0 &copy; Made with care for the community
      </p>
    </div>
  );
};

export default SettingsPage;
