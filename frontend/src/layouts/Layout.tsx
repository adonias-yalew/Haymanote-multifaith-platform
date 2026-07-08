import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AIChatWidget from '../components/AIChatWidget';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const hasDashboardHero =
    location.pathname === '/dashboard/member' ||
    location.pathname === '/dashboard/leader';

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div 
        className={`flex-1 transition-[margin] duration-300 ease-out ${
          isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-20' : 'ml-64'
        } relative min-w-0 overflow-x-hidden`}
      >
        <Topbar onMenuClick={toggleSidebar} />
        <main className={`min-h-screen ${hasDashboardHero ? 'p-0' : 'px-4 py-5 sm:px-6 lg:px-8 lg:py-8'}`}>
          <Outlet />
        </main>
        <AIChatWidget />
      </div>
    </div>
  );
};

export default Layout;
