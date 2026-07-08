import { Bell, User, LogOut, Menu, MessageSquare, ShoppingBag, ShoppingCart } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuth, useIsAdmin } from "../hooks/useAuth.tsx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { notificationsApi } from "../services/api";
import { useCart } from "../context/CartContext";
import type { Notification } from "../types";

interface TopbarProps {
  onMenuClick?: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const { itemCount } = useCart();

  const isDashboard =
    location.pathname === "/dashboard/member" ||
    location.pathname === "/dashboard/leader";

  const handleLogout = () => {
    logout();
    navigate("/welcome");
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifs = async () => {
      try {
        const res = await notificationsApi.getNotifications();
        setNotifications(res.data.data?.notifications || []);
        setUnreadCount(res.data.data?.unreadCount || 0);
      } catch { /* ignore */ }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const markRead = async (notifId: string) => {
    try {
      await notificationsApi.markAsRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifs]);

  const getNotifIcon = (type: string) => {
    if (type.includes('message')) return <MessageSquare className="h-4 w-4" />;
    if (type.includes('order') || type.includes('shipping')) return <ShoppingBag className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  return (
    <header
      className={`h-[72px] flex items-center justify-between px-4 sm:px-6 top-0 z-40 transition-colors duration-300 ${
        isDashboard
          ? "absolute w-full bg-transparent border-transparent"
          : "sticky bg-white/82 backdrop-blur-xl border-b border-slate-200/80"
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-2 rounded-lg transition-all ${
            isDashboard
              ? "text-white hover:bg-white/10"
              : "text-slate-500 hover:text-slate-950 hover:bg-slate-100"
          }`}
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {isAuthenticated ? (
          <>
            {/* Cart */}
            <Link
              to="/cart"
              className={`relative p-2 rounded-lg transition-all ${
                isDashboard
                  ? "text-white hover:bg-white/10"
                  : "text-slate-500 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white px-1">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className={`relative p-2 rounded-lg transition-all ${
                  isDashboard
                    ? "text-white hover:bg-white/10"
                    : "text-slate-500 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-elevated overflow-hidden animate-fade-in">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-950">Notifications</p>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-8">No notifications yet</p>
                    ) : notifications.slice(0, 20).map(notif => {
                      const handleNotifClick = () => {
                        markRead(notif.id);
                        if (notif.type === 'new_message' || notif.type === 'vendor_reply') {
                          if (user?.role === 'vendor') navigate('/vendor/messages');
                          else navigate('/my-messages');
                        } else if (notif.type === 'new_order') {
                          navigate('/vendor/orders');
                        } else if (notif.type === 'order_update' || notif.type === 'shipping_update') {
                          navigate('/my-orders');
                        } else if (notif.type === 'new_review') {
                          navigate('/vendor/products');
                        }
                      };
                      return (
                      <button
                        key={notif.id}
                        onClick={handleNotifClick}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                          !notif.isRead ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <div className={`mt-0.5 p-1.5 rounded-lg ${!notif.isRead ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                          {notif.body && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.body}</p>}
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                        </div>
                        {!notif.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />}
                      </button>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`flex items-center gap-3 rounded-lg border py-1.5 pl-1.5 pr-2 transition-all ${
                  isDashboard
                    ? "border-transparent hover:bg-white/10"
                    : "border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span
                  className={`hidden sm:block max-w-32 truncate text-sm font-medium ${
                    isDashboard ? "text-white" : "text-slate-800"
                  }`}
                >
                  {user?.isAnonymous ? "Anonymous" : user?.email?.split("@")[0]}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-elevated py-2 animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-950 truncate">
                      {user?.isAnonymous ? "Anonymous User" : user?.email}
                    </p>
                    <p className="text-xs font-medium text-slate-500 capitalize flex gap-2">
                      <span>{user?.role.toLowerCase()}</span>
                      {!isAdmin && (
                        <>
                          <span>•</span>
                          <span>Religion: {user?.religion || "Orthodox"}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-all"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-all"
                    onClick={() => setShowDropdown(false)}
                  >
                    <ShoppingBag className="w-4 h-4" /> My Orders
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950 transition-all">Sign In</Link>
            <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
