import glamoraImage from './images/GLAMORA.jpg';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import api, { clearSession } from './api';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Menu,
  Moon,
  Scissors,
  Star,
  Sun,
  X,
  Sparkles,
  Heart,
  CheckCircle2,
  Clock,
  User,
  Bell,
  Mail,
  Lock,
  Phone,
  Building,
  Eye,
  EyeOff,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import './style.css';
import './booking.css';
import { ToastProvider, useToast } from './components/ToastContext';
import AdminLayout from './components/AdminLayout';
import UserLayout from './components/UserLayout';
import ServiceCard from './components/ServiceCard';
import SettingsView from './components/SettingsView';
import {
  AdminDashboardView,
  AdminOverviewView,
  AdminCategoriesView,
  AdminServicesView,
  AdminPricingView,
  AdminBeauticiansView,
  AdminAppointmentsView,
  AdminSlotsView,
  AdminOffersView,
  AdminHolidaysView,
  AdminCustomersView,
  AdminReportsView,
  AdminNotificationsView,
  AdminReviewsView
} from './pages/AdminViews';
import {
  UserDashboardView,
  BrowseServicesView,
  MyAppointmentsView,
  FavouriteServicesView
} from './pages/UserViews';
import LiveServicesView from './pages/LiveServicesView';

const images = [
  'glamoraImage',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80'
];

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
};

const tokenIsUsable = () => {
  try {
    const token = localStorage.getItem('token');
    const refresh = localStorage.getItem('refresh');
    if (!token) return false;
    const parsePayload = (t) => JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const accessPayload = parsePayload(token);
    if (accessPayload.exp && accessPayload.exp * 1000 > Date.now()) return true;
    if (refresh) {
      const refreshPayload = parsePayload(refresh);
      if (refreshPayload.exp && refreshPayload.exp * 1000 > Date.now()) return true;
    }
    return false;
  } catch { return false; }
};

const isAuthenticated = () => Boolean(tokenIsUsable() && getUser());

const errorMessage = (error) => {
  if (!error.response) return error.message || 'Unable to connect to server.';
  const status = error.response.status;
  const data = error.response.data;
  if (status === 404) return 'API endpoint not found.';
  if (status === 500) return 'Server error (500). Please check backend logs.';
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    if (typeof data.detail === 'string') return data.detail;
    const msgs = [];
    Object.entries(data).forEach(([key, val]) => {
      if (Array.isArray(val)) msgs.push(...val.map(v => typeof v === 'string' ? v : JSON.stringify(v)));
      else if (typeof val === 'string') msgs.push(val);
      else if (val && typeof val === 'object') msgs.push(JSON.stringify(val));
    });
    if (msgs.length > 0) return msgs.join(' ');
  }
  return `Request failed with status ${status}.`;
};

// Public Header Navigation
function PublicNav() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const user = getUser();

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const logout = () => {
    clearSession();
    window.location.assign('/');
  };

  return (
    <header className="public-header">
      <div className="public-header-container">
        <Link className="logo" to="/">
          glamora<span>*</span>
        </Link>

        <button className="mobile-drawer-toggle" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>

        <nav className={`public-nav ${open ? 'mobile-open' : ''}`}>
          <Link to="/services">Services</Link>
          <Link to="/offers">Offers</Link>
          <Link to="/about">About</Link>
          
          <button className="theme-toggle-btn" onClick={() => setDark(!dark)} title="Toggle theme">
            {dark ? <Sun size={18} color="#D4AF37" /> : <Moon size={18} color="#5B3A55" />}
          </button>

          {isAuthenticated() ? (
            <>
              <Link to={user.role === 'ADMIN' ? '/admin-dashboard' : '/user-dashboard'} className="btn btn-secondary btn-small">
                Dashboard
              </Link>
              <button className="btn btn-small" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-small">
                Sign in
              </Link>
              <Link className="btn btn-small" to="/register">
                Join Glamora <Sparkles size={14} />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

// Public Home Landing Page
function Home() {
  return (
    <div className="home-page-container">
      <section className="hero">
        <div>
          <p className="eyebrow"><Sparkles size={14} color="var(--rose-pink)" /> YOUR BEAUTY, EFFORTLESSLY BOOKED</p>
          <h1>Feel beautiful.<br /><i>On your schedule.</i></h1>
          <p className="lead">Discover exceptional luxury salons, trusted beauty specialists, and a little time set aside just for you.</p>
          <div className="actions">
            <Link className="btn" to="/services">Find a salon <ArrowRight size={17} /></Link>
            <Link className="textlink" to="/about">Explore Glamora</Link>
          </div>
        </div>
        <div className="heroimage">
          <img src={glamoraImage} alt="Salon styling" />
          <div className="rating">
            <Star fill="#D4AF37" color="#D4AF37" size={10} /> <b>4.9</b><span> Loved by 10,000+ clients</span>
          </div>
        </div>
      </section>

      <section className="intro">
        <p className="eyebrow">THE GLAMORA EDIT</p>
        <h2>Beauty appointments,<br />made <i>beautifully simple.</i></h2>
        <p>Find the right professional, choose your preferred time, and enjoy a premium salon experience.</p>
      </section>

      <section className="features">
        <div>
          <Calendar />
          <h3>Book in moments</h3>
          <p>Choose a salon, service, professional and time slot that fits seamlessly into your week.</p>
        </div>
        <div>
          <Scissors />
          <h3>Curated expertise</h3>
          <p>Find vetted hair masters, nail artists, and aesthetic specialists near you.</p>
        </div>
        <div>
          <Star />
          <h3>Feel the difference</h3>
          <p>Real verified reviews, transparent pricing, and effortless self-care rituals.</p>
        </div>
      </section>
    </div>
  );
}

// Perfectly Centered Luxury Login & Register Component
function Auth({ register = false }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    identifier: '',
    email: '',
    phone: '',
    location: '',
    parlour_name: '',
    password: '',
    confirm: ''
  });

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  // Registration Submit: Validate -> Send Email OTP -> Navigate to /verify-otp
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.first_name.trim()) return setError('Full name is required.');
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return setError('A valid email address is required.');
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 7) return setError('A valid phone number (at least 7 digits) is required.');
    if (!form.location.trim()) return setError('Location is required.');
    if (role === 'ADMIN' && !form.parlour_name.trim()) return setError('Parlour name is required for Salon Owner.');
    if (!form.password) return setError('Password is required.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters long.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const response = await api.post('/auth/send-otp/', {
        first_name: form.first_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        parlour_name: form.parlour_name.trim(),
        password: form.password,
        confirm: form.confirm,
        confirm_password: form.confirm,
        role,
        method: 'email'
      });

      const token = response.data.registration_token;
      const expiryTimestamp = Date.now() + 300 * 1000; // 5 minutes

      // Store pending registration session in sessionStorage for persistence across refresh
      sessionStorage.setItem('glamora_pending_otp', JSON.stringify({
        registration_token: token,
        email: response.data.email,
        phone: response.data.phone,
        method: 'email',
        expiryTimestamp
      }));

      showToast(response.data.detail || 'Registration submitted! OTP code sent to your email address.', 'success');
      navigate('/verify-otp');
    } catch (err) {
      const msg = errorMessage(err);
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login/', {
        identifier: form.identifier.trim(),
        password: form.password,
        role
      });

      if (!response.data.access || !response.data.refresh || !response.data.user?.role) {
        throw new Error('The server returned an incomplete login response.');
      }
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      showToast(`Welcome back, ${response.data.user.name || 'Beautiful'}!`, 'success');
      navigate(response.data.user.role === 'ADMIN' ? '/admin-dashboard' : '/user-dashboard');
    } catch (err) {
      const msg = err.message === 'The server returned an incomplete login response.' ? err.message : errorMessage(err);
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-bg-blob-1" />
      <div className="auth-bg-blob-2" />

      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand">
          <Link className="logo" to="/">
            glamora<span>*</span>
          </Link>
          <h2 style={{ fontSize: '26px', marginTop: '6px', fontWeight: 600 }}>
            {register ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="auth-subtitle">
            {register ? 'Join Glamora as a client or salon owner.' : 'Sign in to access your bookings & dashboard.'}
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="auth-role-selector">
          <button
            type="button"
            className={`auth-role-btn ${role === 'USER' ? 'active' : ''}`}
            onClick={() => setRole('USER')}
          >
            <UserCheck size={16} /> Client / User
          </button>
          <button
            type="button"
            className={`auth-role-btn ${role === 'ADMIN' ? 'active' : ''}`}
            onClick={() => setRole('ADMIN')}
          >
            <ShieldCheck size={16} /> Admin / Salon Owner
          </button>
        </div>

        {/* REGISTER FORM */}
        {register ? (
          <form onSubmit={handleRegisterSubmit}>
            <div className="auth-field">
              <label><User size={14} /> Full Name</label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" size={18} />
                <input
                  required
                  type="text"
                  name="first_name"
                  placeholder="Jane Doe"
                  className="auth-input"
                  value={form.first_name}
                  onChange={change}
                />
              </div>
            </div>

            <div className="auth-field">
              <label><Mail size={14} /> Email Address</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" size={18} />
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="jane@example.com"
                  className="auth-input"
                  value={form.email}
                  onChange={change}
                />
              </div>
            </div>

            <div className="auth-field">
              <label><Phone size={14} /> Phone Number</label>
              <div className="auth-input-wrapper">
                <Phone className="auth-input-icon" size={18} />
                <input
                  required
                  type="text"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  className="auth-input"
                  value={form.phone}
                  onChange={change}
                />
              </div>
            </div>

            <div className="auth-field">
              <label><MapPin size={14} /> Location</label>
              <div className="auth-input-wrapper">
                <MapPin className="auth-input-icon" size={18} />
                <input
                  required
                  type="text"
                  name="location"
                  placeholder="Beverly Hills, CA"
                  className="auth-input"
                  value={form.location}
                  onChange={change}
                />
              </div>
            </div>

            {role === 'ADMIN' && (
              <div className="auth-field">
                <label><Building size={14} /> Parlour Name</label>
                <div className="auth-input-wrapper">
                  <Building className="auth-input-icon" size={18} />
                  <input
                    required
                    type="text"
                    name="parlour_name"
                    placeholder="Glamora Spa"
                    className="auth-input"
                    value={form.parlour_name}
                    onChange={change}
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label><Lock size={14} /> Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  required
                  minLength="8"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  className="auth-input"
                  value={form.password}
                  onChange={change}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label><Lock size={14} /> Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  name="confirm"
                  placeholder="••••••••"
                  className="auth-input"
                  value={form.confirm}
                  onChange={change}
                />
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#F8D7DA', color: '#721C24', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button disabled={loading} className="btn btn-full" style={{ marginTop: '16px' }}>
              {loading ? 'Submitting Details...' : 'Register & Send Email OTP'} <Sparkles size={16} />
            </button>
          </form>
        ) : (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit}>
            <div className="auth-field">
              <label><Mail size={14} /> Email or Phone Number</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" size={18} />
                <input
                  required
                  type="text"
                  name="identifier"
                  placeholder="Enter email or phone"
                  className="auth-input"
                  value={form.identifier}
                  onChange={change}
                />
              </div>
            </div>

            <div className="auth-field">
              <label><Lock size={14} /> Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  required
                  minLength="8"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  className="auth-input"
                  value={form.password}
                  onChange={change}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#F8D7DA', color: '#721C24', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button disabled={loading} className="btn btn-full" style={{ marginTop: '12px' }}>
              {loading ? 'Signing In...' : 'Sign In'} <Sparkles size={16} />
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          {register ? 'Already have an account? ' : 'New to Glamora? '}
          <Link to={register ? '/login' : '/register'} style={{ color: 'var(--rose-pink)', fontWeight: 600 }}>
            {register ? 'Sign in' : 'Create account'}
          </Link>
        </p>
      </div>
    </div>
  );
}

// Dedicated Persistent OTP Verification Page Component
function VerifyOTPPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [session, setSession] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Read pending OTP session from sessionStorage on mount & state check
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('glamora_pending_otp');
      if (!raw) {
        showToast('No active verification session found. Please register first.', 'error');
        navigate('/register', { replace: true });
        return;
      }

      const data = JSON.parse(raw);
      const now = Date.now();
      const secondsLeft = Math.floor((data.expiryTimestamp - now) / 1000);

      if (secondsLeft <= 0) {
        sessionStorage.removeItem('glamora_pending_otp');
        showToast('Verification code expired. Please register again.', 'error');
        navigate('/register', { replace: true });
        return;
      }

      setSession(data);
      setRemainingSeconds(secondsLeft);
    } catch {
      sessionStorage.removeItem('glamora_pending_otp');
      navigate('/register', { replace: true });
    }
  }, [navigate]);

  // Expiry Countdown Timer
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      const secondsLeft = Math.floor((session.expiryTimestamp - Date.now()) / 1000);
      if (secondsLeft <= 0) {
        setRemainingSeconds(0);
        clearInterval(interval);
      } else {
        setRemainingSeconds(secondsLeft);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  // Resend Cooldown Timer
  useEffect(() => {
    let cooldownId;
    if (resendCooldown > 0) {
      cooldownId = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(cooldownId);
  }, [resendCooldown]);

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      const nextInput = document.getElementById(`verify-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`verify-otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtpDigits(pastedData.split(''));
      const lastInput = document.getElementById('verify-otp-input-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!session || resendCooldown > 0 || loading) return;
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/send-otp/', {
        registration_token: session.registration_token,
        method: session.method
      });

      const newExpiryTimestamp = Date.now() + (response.data.expires_in || 300) * 1000;
      const updatedSession = { ...session, expiryTimestamp: newExpiryTimestamp };

      sessionStorage.setItem('glamora_pending_otp', JSON.stringify(updatedSession));
      setSession(updatedSession);
      setRemainingSeconds(response.data.expires_in || 300);
      setResendCooldown(30);
      setOtpDigits(['', '', '', '', '', '']);

      showToast(response.data.detail || 'New OTP verification code sent!', 'success');
    } catch (err) {
      const msg = errorMessage(err);
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    if (remainingSeconds <= 0) {
      setError('OTP has expired. Please click Resend Code or start registration again.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp/', {
        registration_token: session.registration_token,
        otp: otpCode
      });

      // Clear pending registration state from sessionStorage
      sessionStorage.removeItem('glamora_pending_otp');

      showToast(response.data.detail || 'Account created and verified successfully! Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      const msg = errorMessage(err);
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!session) return null;

  return (
    <div className="auth-page-wrapper">
      <div className="auth-bg-blob-1" />
      <div className="auth-bg-blob-2" />

      <div className="auth-card">
        <div className="auth-brand">
          <Link className="logo" to="/">
            glamora<span>*</span>
          </Link>
          <h2 style={{ fontSize: '24px', marginTop: '6px', fontWeight: 600 }}>
            Account Verification
          </h2>
          <p className="auth-subtitle">
            Enter the 6-digit code sent to your email address (<b>{session.email}</b>).
          </p>
        </div>

        <form onSubmit={handleVerifyOtpSubmit}>
          <div className="otp-timer-box">
            <span className="otp-timer-text">
              <Clock size={16} color="var(--rose-pink)" /> Code valid for:
            </span>
            <span
              style={{
                fontWeight: 700,
                color: remainingSeconds > 60 ? 'var(--deep-plum)' : '#D9534F',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            >
              {formatTimer(remainingSeconds)}
            </span>
          </div>

          <div className="otp-digit-container">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                id={`verify-otp-input-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-digit-input"
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#F8D7DA', color: '#721C24', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button disabled={loading} type="submit" className="btn btn-full" style={{ marginTop: '8px' }}>
            {loading ? 'Verifying & Creating Account...' : 'Verify & Create Account'} <CheckCircle2 size={16} />
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <button
              type="button"
              className="otp-resend-btn"
              disabled={resendCooldown > 0 || loading}
              onClick={handleResendOtp}
            >
              {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend OTP Code'}
            </button>

            <Link to="/register" className="textlink" style={{ fontSize: '13px' }}>
              Cancel Registration
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// Booking Form Page with Dynamic Parlour ID Fallback
function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [catalogue, setCatalogue] = useState(null);
  const [activeParlourId, setActiveParlourId] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ service: '', beautician: '', date: '', slot: '' });

  const loadCatalogue = async (parlourId, selectedDate, selectedBeautician) => {
    setActiveParlourId(parlourId);
    let url = `/catalogue/${parlourId}/`;
    const params = new URLSearchParams();
    if (selectedDate) params.append('date', selectedDate);
    if (selectedBeautician) params.append('beautician', selectedBeautician);
    if (params.toString()) url += `?${params.toString()}`;

    try {
      const { data } = await api.get(url);
      setCatalogue(data);
      if (form.slot && data.booked_slot_ids?.includes(Number(form.slot))) {
        setForm((prev) => ({ ...prev, slot: '' }));
      }
    } catch {
      setMessage('Unable to load booking options.');
    }
  };

  useEffect(() => {
    let parlourId = id;
    if (!parlourId) {
      api.get('/parlours/')
        .then(({ data }) => {
          if (data && data.length > 0) {
            loadCatalogue(data[0].id, form.date, form.beautician);
          } else {
            throw new Error('No active parlours available.');
          }
        })
        .catch(() => setMessage('Unable to load booking options.'));
    } else {
      loadCatalogue(parlourId, form.date, form.beautician);
    }
  }, [id, form.date, form.beautician]);

  async function submit(event) {
    event.preventDefault();
    if (!getUser()) {
      showToast('Please sign in to complete your booking.', 'info');
      return navigate('/login');
    }
    try {
      await api.post('/appointments/', {
        ...form,
        service: Number(form.service),
        slot: Number(form.slot),
        beautician: form.beautician ? Number(form.beautician) : null
      });
      showToast('Appointment requested successfully!', 'success');
      navigate('/appointments');
    } catch (err) {
      const msg = err.response?.data?.detail || 'This slot has just been booked by another user. Please select another available time.';
      setMessage(msg);
      showToast(msg, 'error');
      if (activeParlourId) {
        loadCatalogue(activeParlourId, form.date, form.beautician);
      }
    }
  }

  return (
    <div className="card" style={{ maxWidth: '650px', margin: '40px auto', padding: '32px' }}>
      <span className="badge badge-pink" style={{ marginBottom: '12px' }}>APPOINTMENT BOOKING</span>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Reserve Your Session</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Select your treatment, beautician, date, and preferred time slot.</p>

      {!catalogue ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading salon options...</p>
      ) : (
        <form onSubmit={submit} className="form-grid">
          <div className="form-group full">
            <label>Service Treatment</label>
            <select required className="form-control" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
              <option value="">Select a service</option>
              {catalogue.services.map((service) => (
                <option value={service.id} key={service.id}>
                  {service.name} — Rs. {service.price} ({service.duration_minutes} mins)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group full">
            <label>Beauty Professional</label>
            <select className="form-control" value={form.beautician} onChange={(e) => setForm({ ...form, beautician: e.target.value })}>
              <option value="">Auto-assign best available specialist</option>
              {catalogue.beauticians.map((b) => (
                <option value={b.id} key={b.id}>
                  {b.name} — {b.specialization} ({b.experience_years} yrs exp)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              className="form-control"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Time Slot</label>
            <select
              required
              className="form-control"
              value={form.slot}
              onChange={(e) => setForm({ ...form, slot: e.target.value })}
            >
              <option value="">Select time</option>
              {catalogue.slots?.map((slot) => {
                const isBooked = (catalogue.booked_slot_ids || []).includes(slot.id);
                return (
                  <option value={slot.id} key={slot.id} disabled={isBooked}>
                    {slot.start_time.slice(0, 5)} {isBooked ? '— Booked' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {message && (
            <div className="form-group full">
              <p style={{ color: '#DC3545', fontSize: '13px' }}>{message}</p>
            </div>
          )}

          <div className="form-group full" style={{ marginTop: '16px' }}>
            <button className="btn btn-full">
              Request Appointment <Sparkles size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// User Review Form Page
function ReviewForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ rating: 5, comment: '' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/${id}/`, form);
      showToast('Thank you for your feedback!', 'success');
      navigate('/my-reviews');
    } catch (err) {
      showToast(errorMessage(err), 'error');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '550px', margin: '40px auto', padding: '32px' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Share Your Experience</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Help others discover great beauty care at Glamora.</p>

      <form onSubmit={submit} className="form-grid">
        <div className="form-group full">
          <label>Rating (1 to 5 Stars)</label>
          <select className="form-control" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
          </select>
        </div>

        <div className="form-group full">
          <label>Review Comment</label>
          <textarea required rows={4} className="form-control" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
        </div>

        <div className="form-group full" style={{ marginTop: '12px' }}>
          <button className="btn btn-full">Submit Review</button>
        </div>
      </form>
    </div>
  );
}

// User Reviews List View
function MyReviewsView() {
  const [reviews, setReviews] = useState([]);
  useEffect(() => { api.get('/my-reviews/').then(({ data }) => setReviews(data)); }, []);

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>My Feedback & Reviews</h1>
      <div className="card">
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '16px' }}>You have not left a review yet. Open a completed appointment to share your experience.</p>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{r.rating} / 5 Stars</td>
                    <td>{r.comment}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Basic Page Placeholder
function Basic({ title }) {
  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px' }}>
      <p className="eyebrow">GLAMORA LUXURY</p>
      <h1 style={{ fontSize: '54px', margin: '12px 0' }}>{title}</h1>
      <p className="lead">We believe looking after yourself should feel unhurried, personal and entirely yours.</p>
    </div>
  );
}

// Role Authorization Wrapper
function RequireRole({ role, children }) {
  return isAuthenticated() && getUser()?.role === role ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Pages */}
          <Route path="/" element={<><PublicNav /><Home /></>} />
          <Route path="/services" element={<UserLayout title="Browse Services"><BrowseServicesView /></UserLayout>} />
          <Route path="/offers" element={<><PublicNav /><Basic title="A little more to love." /></>} />
          <Route path="/about" element={<><PublicNav /><Basic title="Beauty, with intention." /></>} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth register />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/book" element={<UserLayout title="Book Appointment"><Booking /></UserLayout>} />
          <Route path="/book/:id" element={<UserLayout title="Book Appointment"><Booking /></UserLayout>} />

          {/* Signed-in User Layout Routes */}
          <Route path="/user-dashboard" element={<RequireRole role="USER"><UserLayout title="Dashboard"><UserDashboardView /></UserLayout></RequireRole>} />
          <Route path="/appointments" element={<RequireRole role="USER"><UserLayout title="My Appointments"><MyAppointmentsView /></UserLayout></RequireRole>} />
          <Route path="/user/favourites" element={<RequireRole role="USER"><UserLayout title="Favourite Services"><FavouriteServicesView /></UserLayout></RequireRole>} />
          <Route path="/user/notifications" element={<RequireRole role="USER"><UserLayout title="Notifications"><UserDashboardView /></UserLayout></RequireRole>} />
          <Route path="/my-reviews" element={<RequireRole role="USER"><UserLayout title="My Reviews"><MyReviewsView /></UserLayout></RequireRole>} />
          <Route path="/review/:id" element={<RequireRole role="USER"><UserLayout title="Write Review"><ReviewForm /></UserLayout></RequireRole>} />
          <Route path="/profile" element={<Navigate to="/user/settings" replace />} />
          <Route path="/user/live-services" element={<RequireRole role="USER"><UserLayout title="Live Services"><LiveServicesView /></UserLayout></RequireRole>} />
          <Route path="/user/settings" element={<RequireRole role="USER"><UserLayout title="Settings"><SettingsView role="USER" /></UserLayout></RequireRole>} />

          {/* Signed-in Admin Layout Routes */}
          <Route path="/admin" element={<RequireRole role="ADMIN"><AdminLayout title="Admin Dashboard"><AdminDashboardView /></AdminLayout></RequireRole>} />
          <Route path="/admin-dashboard" element={<RequireRole role="ADMIN"><AdminLayout title="Admin Dashboard"><AdminDashboardView /></AdminLayout></RequireRole>} />
          <Route path="/admin/overview" element={<RequireRole role="ADMIN"><AdminLayout title="Executive Overview"><AdminOverviewView /></AdminLayout></RequireRole>} />
          <Route path="/admin/categories" element={<RequireRole role="ADMIN"><AdminLayout title="Manage Categories"><AdminCategoriesView /></AdminLayout></RequireRole>} />
          <Route path="/admin/services" element={<RequireRole role="ADMIN"><AdminLayout title="Manage Services"><AdminServicesView /></AdminLayout></RequireRole>} />
          <Route path="/admin/pricing" element={<RequireRole role="ADMIN"><AdminLayout title="Manage Pricing"><AdminPricingView /></AdminLayout></RequireRole>} />
          <Route path="/admin/beauticians" element={<RequireRole role="ADMIN"><AdminLayout title="Manage Beauticians"><AdminBeauticiansView /></AdminLayout></RequireRole>} />
          <Route path="/admin/slots" element={<RequireRole role="ADMIN"><AdminLayout title="Manage Slots"><AdminSlotsView /></AdminLayout></RequireRole>} />
          <Route path="/admin/appointments" element={<RequireRole role="ADMIN"><AdminLayout title="Manage Appointments"><AdminAppointmentsView /></AdminLayout></RequireRole>} />
          <Route path="/admin/offers" element={<RequireRole role="ADMIN"><AdminLayout title="Manage Offers"><AdminOffersView /></AdminLayout></RequireRole>} />
          <Route path="/admin/holidays" element={<RequireRole role="ADMIN"><AdminLayout title="Manage Holidays"><AdminHolidaysView /></AdminLayout></RequireRole>} />
          <Route path="/admin/customers" element={<RequireRole role="ADMIN"><AdminLayout title="Customer History"><AdminCustomersView /></AdminLayout></RequireRole>} />
          <Route path="/admin/reports" element={<RequireRole role="ADMIN"><AdminLayout title="Intelligence & Reports"><AdminReportsView /></AdminLayout></RequireRole>} />
          <Route path="/admin/notifications" element={<RequireRole role="ADMIN"><AdminLayout title="Notifications"><AdminNotificationsView /></AdminLayout></RequireRole>} />
          <Route path="/admin/reviews" element={<RequireRole role="ADMIN"><AdminLayout title="Reviews"><AdminReviewsView /></AdminLayout></RequireRole>} />
          <Route path="/admin/settings" element={<RequireRole role="ADMIN"><AdminLayout title="Admin Settings"><SettingsView role="ADMIN" /></AdminLayout></RequireRole>} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
