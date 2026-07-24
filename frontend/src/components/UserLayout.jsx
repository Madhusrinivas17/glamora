import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  CalendarPlus,
  Calendar,
  Bell,
  Heart,
  Star,
  User,
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

const userMenuItems = [
  { label: 'Dashboard', path: '/user-dashboard', icon: LayoutDashboard },
  { label: 'Browse Services', path: '/services', icon: Search },
  { label: 'Book Appointment', path: '/book/1', icon: CalendarPlus },
  { label: 'My Appointments', path: '/appointments', icon: Calendar },
  { label: 'Notifications', path: '/user/notifications', icon: Bell },
  { label: 'Favourite Services', path: '/user/favourites', icon: Heart },
  { label: 'Reviews', path: '/my-reviews', icon: Star },
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Settings', path: '/user/settings', icon: Settings },
];

export default function UserLayout({ children, title = 'User Dashboard' }) {
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
        <Link to="/user-dashboard" className="logo" style={{ fontSize: '24px' }}>
          glamora<span>*</span>
        </Link>
        <span className="sidebar-badge" style={{ borderColor: 'var(--accent-gold)' }}>
          CLIENT
        </span>
      </div>

      <nav className="sidebar-nav">
        {userMenuItems.map((item) => {
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
          <div className="user-avatar">{user.name ? user.name[0].toUpperCase() : 'U'}</div>
          <div className="user-info">
            <span className="user-name">{user.name || 'Valued Client'}</span>
            <span className="user-role">{user.email || 'Member'}</span>
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

      {/* Main Content Area */}
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

            <Link to="/book/1" className="btn btn-small">
              <Sparkles size={14} /> Book Now
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
