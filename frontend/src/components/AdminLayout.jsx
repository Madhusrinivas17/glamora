import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  FolderTree,
  Scissors,
  DollarSign,
  UserCheck,
  Clock,
  CalendarCheck,
  Tag,
  CalendarOff,
  Users,
  FileText,
  Bell,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
};

const menuItems = [
  { label: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
  { label: 'Overview', path: '/admin/overview', icon: BarChart3 },
  { label: 'Manage Categories', path: '/admin/categories', icon: FolderTree },
  { label: 'Manage Services', path: '/admin/services', icon: Scissors },
  { label: 'Manage Pricing', path: '/admin/pricing', icon: DollarSign },
  { label: 'Manage Beauticians', path: '/admin/beauticians', icon: UserCheck },
  { label: 'Manage Slots', path: '/admin/slots', icon: Clock },
  { label: 'Manage Appointments', path: '/admin/appointments', icon: CalendarCheck },
  { label: 'Manage Offers', path: '/admin/offers', icon: Tag },
  { label: 'Manage Holidays', path: '/admin/holidays', icon: CalendarOff },
  { label: 'Customer History', path: '/admin/customers', icon: Users },
  { label: 'Reports', path: '/admin/reports', icon: FileText },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  { label: 'Reviews', path: '/admin/reviews', icon: Star },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children, title = 'Admin Portal' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const NavContent = () => (
    <>
      <div className="sidebar-header">
        <Link to="/admin-dashboard" className="logo" style={{ fontSize: '24px' }}>
          glamora<span>*</span>
        </Link>
        <span className="sidebar-badge">ADMIN</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setDrawerOpen(false)}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ color: '#E63946', marginTop: '12px' }}
        >
          <LogOut color="#E63946" />
          <span>Logout</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-mini-card">
          <div className="user-avatar">{user.name ? user.name[0].toUpperCase() : 'A'}</div>
          <div className="user-info">
            <span className="user-name">{user.name || 'Salon Admin'}</span>
            <span className="user-role">{user.parlour_name || 'Owner'}</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      {/* Permanent Desktop Sidebar */}
      <aside className="app-sidebar">
        <NavContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      <div className={`mobile-drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}>
        <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px' }}>
            <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
              <X size={20} />
            </button>
          </div>
          <NavContent />
        </div>
      </div>

      {/* Main Content View */}
      <div className="app-main">
        {/* Sticky Topbar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <button className="mobile-drawer-toggle" onClick={() => setDrawerOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="topbar-title">
              <h2>{title}</h2>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className="theme-toggle-btn"
              onClick={() => setDark(!dark)}
              title="Toggle theme"
            >
              {dark ? <Sun size={18} color="#D4AF37" /> : <Moon size={18} color="#5B3A55" />}
            </button>

            <Link to="/admin/notifications" className="theme-toggle-btn" style={{ position: 'relative' }}>
              <Bell size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#E9A3B2'
                }}
              />
            </Link>

            <Link to="/admin/settings" className="btn btn-secondary btn-small">
              <Settings size={14} /> Settings
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}
