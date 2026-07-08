import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Calendar,
  Home,
  Users,
  Sparkles,
  FileText,
  BookOpen,
  MessageSquare,
  NotebookText,
  User,
  Settings,
  Shield,
  Heart,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Store,
  Cross,
  ShoppingBag,
  HandHeart,
  ShoppingCart,
  MoreHorizontal,
  type LucideIcon,
  Folder,
  Briefcase,
  LayoutDashboard,
  UserCog,
  Landmark,
  Flag,
  Library,
  PackageSearch,
  BadgeCheck,
  BarChart3,
} from "lucide-react";
import {
  getRoleDashboardPath,
  useAuth,
  useIsAdmin,
  useIsLeader,
  useIsVendor,
} from "../hooks/useAuth.tsx";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  to?: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  subItems?: { to: string; label: string; icon?: LucideIcon }[];
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = useIsAdmin();
  const isLeader = useIsLeader();
  const isVendor = useIsVendor();
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  const getSidebarActiveStyles = () => {
    switch (user?.religion?.toLowerCase()) {
      case "orthodox":
        return {
          bg: "bg-amber-50 text-amber-700 font-semibold",
          shadow:
            "bg-amber-50 text-amber-700 font-semibold shadow-[inset_0_0_0_1px_rgba(217,119,6,0.10)]",
        };
      case "muslim":
        return {
          bg: "bg-emerald-50 text-emerald-700 font-semibold",
          shadow:
            "bg-emerald-50 text-emerald-700 font-semibold shadow-[inset_0_0_0_1px_rgba(16,185,129,0.10)]",
        };
      case "protestant":
        return {
          bg: "bg-blue-50 text-blue-700 font-semibold",
          shadow:
            "bg-blue-50 text-blue-700 font-semibold shadow-[inset_0_0_0_1px_rgba(59,130,246,0.10)]",
        };
      default:
        return {
          bg: "bg-indigo-50 text-indigo-700 font-semibold",
          shadow:
            "bg-indigo-50 text-indigo-700 font-semibold shadow-[inset_0_0_0_1px_rgba(79,70,229,0.10)]",
        };
    }
  };

  const activeStyles = getSidebarActiveStyles();
  const adminActiveStyles = {
    bg: "bg-indigo-50 text-indigo-700 font-semibold",
    shadow: "bg-indigo-50 text-indigo-700 font-semibold shadow-[inset_0_0_0_1px_rgba(79,70,229,0.10)]",
  };
  const isDashboard = false;
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {},
  );
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = isDashboard && collapsed && !scrolled;

  const toggleMenu = (label: string) => {
    if (collapsed) {
      onToggle();
      setExpandedMenus((prev) => ({ ...prev, [label]: true }));
    } else {
      setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const homePath = getRoleDashboardPath(user?.role);
  const inLeaderWorkspace =
    location.pathname.startsWith("/dashboard/leader") ||
    location.pathname.startsWith("/leader");
  const vendorSharedPath = ["/marketplace", "/contact"].includes(
    location.pathname,
  );
  const inVendorWorkspace =
    location.pathname.startsWith("/dashboard/vendor") ||
    location.pathname.startsWith("/vendor") ||
    (isVendor && vendorSharedPath);
  const inAdminWorkspace =
    location.pathname.startsWith("/dashboard/admin") ||
    location.pathname.startsWith("/admin") ||
    (isAdmin && ["/profile", "/settings"].includes(location.pathname));

  const navActiveStyles = inAdminWorkspace ? adminActiveStyles : activeStyles;

  const leaderNavItems: NavItem[] = [
    { to: homePath, icon: Home, label: "Home", end: true },
    {
      label: "Community",
      icon: Users,
      to: "/community",
      subItems: [
        { to: "/community", label: "Q&A" },
        { to: "/my-posts", label: "My Questions" },
      ],
    },
    { to: "/copilot", icon: Sparkles, label: "Ask AI" },
    { to: "/sermons", icon: BookOpen, label: "Sermons & Teachings" },
    { to: "/marketplace", icon: Store, label: "Marketplace" },
    {
      label: "Tools",
      icon: Briefcase,
      subItems: [
        { to: "/tracker", label: "Prayer Tracker" },
        { to: "/events", label: "Events" },
        { to: "/donate", label: "Donate" },
        { to: "/contact", label: "Help & Contact" },
      ],
    },
    {
      label: "Leader",
      icon: HandHeart,
      subItems: [
        { to: "/leader/my-teachings", label: "My Teachings" },
      ],
    },
  ];

  const vendorNavItems: NavItem[] = [
    { to: homePath, icon: Home, label: "Home", end: true },
    { to: "/marketplace", icon: Store, label: "Marketplace" },
    { to: "/vendor/products", icon: ShoppingBag, label: "My Products" },
    { to: "/vendor/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/vendor/messages", icon: MessageSquare, label: "Messages" },
    { to: "/contact", icon: HelpCircle, label: "Help & Contact" },
  ];

  const adminNavItems: NavItem[] = [
    { to: "/dashboard/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    {
      label: "Role Management",
      icon: UserCog,
      subItems: [
        { to: "/dashboard/admin/users", label: "Users Management", icon: Users },
        { to: "/dashboard/admin/leaders", label: "Leaders Management", icon: HandHeart },
        { to: "/dashboard/admin/vendors", label: "Vendors Management", icon: Store },
      ],
    },
    { to: "/dashboard/admin/religions", icon: Landmark, label: "Religion Management" },
    { to: "/dashboard/admin/community", icon: MessageSquare, label: "Community Posts" },
    { to: "/dashboard/admin/teachings", icon: Library, label: "Teachings & Content" },
    { to: "/dashboard/admin/marketplace", icon: PackageSearch, label: "Marketplace" },
    { to: "/dashboard/admin/moderation", icon: Flag, label: "Reports & Moderation" },
    { to: "/dashboard/admin/verification", icon: BadgeCheck, label: "Verification Requests" },
    { to: "/dashboard/admin/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/dashboard/admin/settings", icon: Settings, label: "System Settings" },
  ];

  const platformNavItems: NavItem[] = [
    { to: homePath, icon: Home, label: "Home" },
    {
      label: "Community",
      icon: Users,
      to: "/community",
      subItems: [
        { to: "/community", label: "Q&A" },
        ...(isAuthenticated
          ? [{ to: "/my-posts", label: "My Questions" }]
          : []),
      ],
    },
    { to: "/copilot", icon: Sparkles, label: "Ask AI" },
    { to: "/sermons", icon: BookOpen, label: "Sermons & Teachings" },
    { to: "/marketplace", icon: Store, label: "Marketplace" },

    {
      label: "Tools",
      icon: Briefcase,
      subItems: [
        { to: "/tracker", label: "Prayer Tracker" },
        { to: "/events", label: "Events" },
        { to: "/donate", label: "Donate" },
        { to: "/contact", label: "Help & Contact" },
      ],
    },
    ...(isLeader
      ? [
          {
            label: "Leader",
            icon: HandHeart,
            subItems: [
              { to: "/dashboard/leader", label: "Dashboard" },
              { to: "/leader/my-teachings", label: "My Teachings" },
            ],
          },
        ]
      : []),
  ];

  const navItems = inAdminWorkspace
    ? adminNavItems
    : inLeaderWorkspace
      ? leaderNavItems
      : inVendorWorkspace
        ? vendorNavItems
        : platformNavItems;

  const roleItems =
    inLeaderWorkspace || inVendorWorkspace || inAdminWorkspace
      ? inLeaderWorkspace
        ? []
        : inAdminWorkspace
          ? []
          : [{ to: homePath, icon: Home, label: "Role Home" }]
      : [
          ...(isVendor
            ? [
                {
                  to: "/dashboard/vendor",
                  icon: Store,
                  label: "Vendor Dashboard",
                },
              ]
            : []),
          ...(isAdmin
            ? [{ to: "/dashboard/admin", icon: Shield, label: "Admin Panel" }]
            : []),
        ];

  const platformBottomItems = [
    ...(isAuthenticated
      ? [
          { to: "/profile", icon: User, label: "Profile" },
          { to: "/settings", icon: Settings, label: "Settings" },
        ]
      : []),
  ];

  const bottomItems = platformBottomItems;

  // Close sidebar on mobile when clicking outside
  const handleOverlayClick = () => {
    if (isMobile && !collapsed) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      <aside
        className={`h-screen fixed left-0 top-0 flex flex-col z-50 transition-all duration-300 ease-out ${
          isTransparent
            ? "bg-transparent border-transparent text-white"
            : "bg-white/92 backdrop-blur-xl border-r border-slate-200/80 text-slate-950 shadow-[18px_0_60px_-46px_rgba(15,23,42,0.7)]"
        } ${collapsed ? "w-20" : "w-64"} ${
          isMobile && collapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div
          className={`h-[72px] px-4 flex items-center justify-between ${
            isTransparent
              ? "border-transparent"
              : "border-b border-slate-200/80"
          }`}
        >
          <NavLink
            to="/"
            className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-lg ring-1 ring-white/40"
            />
            {!collapsed && (
              <div className="overflow-hidden">
                <h1
                  className={`font-semibold text-[15px] tracking-tight whitespace-nowrap ${isTransparent ? "text-white" : "text-slate-950"}`}
                >
                  {inAdminWorkspace ? "Admin Ops" : "Haymanote"}
                </h1>
                <p
                  className={`text-[11px] font-medium whitespace-nowrap ${isTransparent ? "text-white/50" : "text-slate-500"}`}
                >
                  {inAdminWorkspace ? "Management Console" : "Spiritual Community"}
                </p>
              </div>
            )}
          </NavLink>

          {!isMobile && (
              <button
                onClick={onToggle}
                className={`p-1.5 rounded-lg transition-colors ${
                  isTransparent
                  ? "text-white/60 hover:text-white hover:bg-white/10"
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                }`}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.label} className="space-y-1">
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      isTransparent
                      ? "text-white/80 hover:bg-white/10 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    } ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <span className="whitespace-nowrap overflow-hidden">
                          {item.label}
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <ChevronRight
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedMenus[item.label] ? "rotate-90" : ""
                        }`}
                      />
                    )}
                  </button>
                  {expandedMenus[item.label] && !collapsed && (
                    <div className="pl-11 pr-3 py-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.to}
                          to={subItem.to}
                            className={({ isActive }) =>
                              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isActive
                                  ? isTransparent
                                    ? "bg-white/20 text-white font-semibold"
                                    : navActiveStyles.bg
                                  : isTransparent
                                    ? "text-white/70 hover:text-white hover:bg-white/10"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                              }`
                            }
                        >
                          {subItem.icon && <subItem.icon className="w-4 h-4" />}
                          <span className="whitespace-nowrap overflow-hidden">
                            {subItem.label}
                          </span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.to!}
                  end={item.end}
                   className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? isTransparent
                          ? "bg-white/20 text-white font-semibold shadow-sm"
                          : navActiveStyles.shadow
                        : isTransparent
                          ? "text-white/80 hover:bg-white/10 hover:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    } ${collapsed ? "justify-center" : ""}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="whitespace-nowrap overflow-hidden">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              )}
            </div>
          ))}

          {/* Role-based sections */}
          {roleItems.length > 0 && (
            <>
              <div
                className={`pt-4 mt-4 ${
                  isTransparent
                    ? "border-t border-white/20"
                    : "border-t border-slate-200/80"
                } ${collapsed ? "px-2" : "px-1"}`}
              >
                {!collapsed && (
                  <p
                    className={`px-3 text-[11px] font-semibold uppercase tracking-wider mb-2 ${
                      isTransparent
                        ? "text-white/50"
                        : "text-slate-400"
                    }`}
                  >
                    Workspace
                  </p>
                )}
                {roleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        isActive
                          ? isTransparent
                            ? "bg-white/20 text-white font-semibold"
                            : navActiveStyles.shadow
                          : isTransparent
                            ? "text-white/80 hover:bg-white/10 hover:text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      } ${collapsed ? "justify-center" : ""}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </nav>

        {bottomItems.length > 0 && (
          <div
            className={`p-3 space-y-1.5 ${
              isTransparent
                ? "border-t border-white/20"
                : "border-t border-slate-200/80"
            }`}
          >
            {bottomItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? isTransparent
                        ? "bg-white/20 text-white font-semibold"
                        : navActiveStyles.shadow
                      : isTransparent
                        ? "text-white/80 hover:bg-white/10 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  } ${collapsed ? "justify-center" : ""}`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
