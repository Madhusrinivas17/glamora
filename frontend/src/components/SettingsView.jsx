import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Camera,
  Sun,
  Moon,
  Globe,
  Share2,
  Shield,
  Bell,
  Heart,
  Store,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useToast } from './ToastContext';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const avatarOptions = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
];

export default function SettingsView({ role = 'USER' }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);

  // Form States
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    avatar: avatarOptions[0]
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [parlour, setParlour] = useState({
    name: 'Glamora Luxury Spa',
    address: '108 Serenity Lane, Beverly Hills, CA',
    phone: '+1 (555) 234-5678',
    email: 'contact@glamorasalon.com',
    opening_hours: '09:00 AM - 08:00 PM',
    description: 'Premier destination for luxury hair, skin, and spa treatments.'
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState({
    email_booking: true,
    sms_reminder: true,
    promotions: false
  });
  const [privacy, setPrivacy] = useState({
    public_profile: true,
    allow_search: true
  });
  const [socials, setSocials] = useState({
    instagram: '@glamora_official',
    facebook: 'GlamoraSalon'
  });

  useEffect(() => {
    api.get('/auth/profile/')
      .then(({ data }) => {
        setProfile((prev) => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || ''
        }));
      })
      .catch(() => {});
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.patch('/auth/profile/', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location
      });
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data }));
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return showToast('New passwords do not match!', 'error');
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password/', passwordForm);
      showToast('Password changed successfully!', 'success');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    showToast(`Theme changed to ${newTheme} mode!`, 'info');
  };

  const tabs = [
    { id: 'account', label: 'Account Information', icon: User },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'photo', label: 'Profile Photo', icon: Camera },
    { id: 'theme', label: 'Theme & Appearance', icon: Sun },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'socials', label: 'Social Accounts', icon: Share2 },
    { id: 'privacy', label: 'Privacy Settings', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(role === 'USER' ? [{ id: 'favourites', label: 'Liked Services', icon: Heart }] : []),
    ...(role === 'ADMIN' ? [{ id: 'parlour', label: 'Parlour Information', icon: Store }] : [])
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '4px' }}>Settings & Preferences</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal profile, security options, and app preferences.</p>
      </div>

      <div className="settings-container">
        {/* Settings Navigation Tabs */}
        <div className="settings-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content Box */}
        <div className="settings-content">
          {/* Account Information */}
          {activeTab === 'account' && (
            <div>
              <h2 className="settings-section-title">Account Information</h2>
              <p className="settings-section-desc">Update your personal contact details and location.</p>

              <form onSubmit={handleProfileSave} className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Location / City</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  />
                </div>

                <div className="form-group full" style={{ marginTop: '12px' }}>
                  <button disabled={loading} className="btn">
                    {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Change Password */}
          {activeTab === 'password' && (
            <div>
              <h2 className="settings-section-title">Change Password</h2>
              <p className="settings-section-desc">Ensure your account is using a long, random password to stay secure.</p>

              <form onSubmit={handlePasswordSubmit} className="form-grid" style={{ maxWidth: '500px' }}>
                <div className="form-group full">
                  <label>Current Password</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  />
                </div>

                <div className="form-group full">
                  <label>New Password (min 8 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="form-control"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  />
                </div>

                <div className="form-group full">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  />
                </div>

                <div className="form-group full" style={{ marginTop: '12px' }}>
                  <button disabled={loading} className="btn">
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Profile Photo */}
          {activeTab === 'photo' && (
            <div>
              <h2 className="settings-section-title">Profile Photo</h2>
              <p className="settings-section-desc">Choose an avatar or provide a custom image URL.</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <img
                  src={profile.avatar}
                  alt="Avatar Preview"
                  style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--rose-pink)' }}
                />
                <div>
                  <h4 style={{ fontSize: '18px', marginBottom: '4px' }}>Avatar Preview</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>This photo will be displayed across your bookings & reviews.</p>
                </div>
              </div>

              <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '10px' }}>Select Avatar</label>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {avatarOptions.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Avatar option ${idx}`}
                    onClick={() => {
                      setProfile({ ...profile, avatar: url });
                      showToast('Avatar updated!', 'success');
                    }}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: profile.avatar === url ? '3px solid var(--rose-pink)' : '2px solid var(--surface-border)',
                      transform: profile.avatar === url ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                ))}
              </div>

              <div className="form-group full" style={{ maxWidth: '500px' }}>
                <label>Custom Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={profile.avatar}
                  onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Theme Settings */}
          {activeTab === 'theme' && (
            <div>
              <h2 className="settings-section-title">Theme Settings</h2>
              <p className="settings-section-desc">Customize your visual interface mode for day or evening browsing.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '500px' }}>
                <div
                  onClick={() => handleThemeChange('light')}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: theme === 'light' ? '2px solid var(--rose-pink)' : '1px solid var(--surface-border)',
                    background: '#FFF8FB',
                    color: '#332032',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: theme === 'light' ? 'var(--shadow-md)' : 'none'
                  }}
                >
                  <Sun size={28} color="#E9A3B2" style={{ marginBottom: '8px' }} />
                  <h4 style={{ fontSize: '16px' }}>Light Mode</h4>
                  <p style={{ fontSize: '12px', color: '#7E657A' }}>Blush pink & creamy aesthetics</p>
                </div>

                <div
                  onClick={() => handleThemeChange('dark')}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: theme === 'dark' ? '2px solid var(--rose-pink)' : '1px solid var(--surface-border)',
                    background: '#1E1622',
                    color: '#F8EDF4',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: theme === 'dark' ? 'var(--shadow-md)' : 'none'
                  }}
                >
                  <Moon size={28} color="#D4AF37" style={{ marginBottom: '8px' }} />
                  <h4 style={{ fontSize: '16px' }}>Dark Mode</h4>
                  <p style={{ fontSize: '12px', color: '#C9B2C4' }}>Deep plum & luxury gold glow</p>
                </div>
              </div>
            </div>
          )}

          {/* Language Settings */}
          {activeTab === 'language' && (
            <div>
              <h2 className="settings-section-title">Language & Region</h2>
              <p className="settings-section-desc">Select your preferred system display language.</p>

              <div className="form-group" style={{ maxWidth: '400px' }}>
                <label>System Language</label>
                <select
                  className="form-control"
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    showToast(`Language set to ${e.target.value}!`, 'success');
                  }}
                >
                  <option value="English">English (US & UK)</option>
                  <option value="French">Français (French)</option>
                  <option value="Spanish">Español (Spanish)</option>
                  <option value="German">Deutsch (German)</option>
                </select>
              </div>
            </div>
          )}

          {/* Social Accounts */}
          {activeTab === 'socials' && (
            <div>
              <h2 className="settings-section-title">Connected Social Accounts</h2>
              <p className="settings-section-desc">Link your social handles for easy login and salon updates.</p>

              <div className="form-grid" style={{ maxWidth: '500px' }}>
                <div className="form-group full">
                  <label>Instagram Handle</label>
                  <input
                    type="text"
                    className="form-control"
                    value={socials.instagram}
                    onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                  />
                </div>
                <div className="form-group full">
                  <label>Facebook Profile</label>
                  <input
                    type="text"
                    className="form-control"
                    value={socials.facebook}
                    onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                  />
                </div>
                <div className="form-group full">
                  <button className="btn" onClick={() => showToast('Social handles updated!', 'success')}>
                    Save Social Links
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div>
              <h2 className="settings-section-title">Privacy Settings</h2>
              <p className="settings-section-desc">Control visibility and search preferences.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <span>Make profile public to stylists</span>
                  <input
                    type="checkbox"
                    checked={privacy.public_profile}
                    onChange={(e) => setPrivacy({ ...privacy, public_profile: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--rose-pink)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <span>Allow search engines to index account</span>
                  <input
                    type="checkbox"
                    checked={privacy.allow_search}
                    onChange={(e) => setPrivacy({ ...privacy, allow_search: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--rose-pink)' }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="settings-section-title">Notification Preferences</h2>
              <p className="settings-section-desc">Choose how you want to be notified about bookings and special offers.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <span>Email booking updates & invoices</span>
                  <input
                    type="checkbox"
                    checked={notifications.email_booking}
                    onChange={(e) => setNotifications({ ...notifications, email_booking: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--rose-pink)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <span>SMS appointment reminders (1 hour prior)</span>
                  <input
                    type="checkbox"
                    checked={notifications.sms_reminder}
                    onChange={(e) => setNotifications({ ...notifications, sms_reminder: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--rose-pink)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <span>Promotional offers & seasonal updates</span>
                  <input
                    type="checkbox"
                    checked={notifications.promotions}
                    onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--rose-pink)' }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* User Liked Services Tab */}
          {activeTab === 'favourites' && (
            <div>
              <h2 className="settings-section-title">Favourite & Liked Services</h2>
              <p className="settings-section-desc">Quickly rebook or view services you have bookmarked.</p>
              <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <Heart size={36} color="var(--rose-pink)" style={{ marginBottom: '12px' }} />
                <h3>Your Favourites Collection</h3>
                <p style={{ color: 'var(--text-muted)', margin: '8px 0 16px' }}>View all your saved treatments directly in your User Dashboard menu.</p>
              </div>
            </div>
          )}

          {/* Admin Parlour Information Tab */}
          {activeTab === 'parlour' && (
            <div>
              <h2 className="settings-section-title">Parlour Information</h2>
              <p className="settings-section-desc">Update business information visible to clients during booking.</p>

              <form className="form-grid" onSubmit={(e) => { e.preventDefault(); showToast('Parlour details updated!', 'success'); }}>
                <div className="form-group full">
                  <label>Salon / Parlour Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={parlour.name}
                    onChange={(e) => setParlour({ ...parlour, name: e.target.value })}
                  />
                </div>

                <div className="form-group full">
                  <label>Physical Address</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={parlour.address}
                    onChange={(e) => setParlour({ ...parlour, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    value={parlour.email}
                    onChange={(e) => setParlour({ ...parlour, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={parlour.phone}
                    onChange={(e) => setParlour({ ...parlour, phone: e.target.value })}
                  />
                </div>

                <div className="form-group full">
                  <label>Opening Business Hours</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={parlour.opening_hours}
                    onChange={(e) => setParlour({ ...parlour, opening_hours: e.target.value })}
                  />
                </div>

                <div className="form-group full">
                  <label>Salon Description</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={parlour.description}
                    onChange={(e) => setParlour({ ...parlour, description: e.target.value })}
                  />
                </div>

                <div className="form-group full" style={{ marginTop: '12px' }}>
                  <button className="btn">Save Parlour Information</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
