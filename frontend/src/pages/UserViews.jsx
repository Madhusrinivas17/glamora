import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  Search,
  Heart,
  Star,
  Bell,
  Clock,
  ArrowRight,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  Filter
} from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import { useToast } from '../components/ToastContext';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const errorMessage = (err) => {
  if (err.response?.data?.detail) return err.response.data.detail;
  return err.message || 'Unable to connect to server.';
};

// ==========================================
// 1. USER DASHBOARD
// ==========================================
export function UserDashboardView() {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    Promise.all([
      api.get('/appointments/'),
      api.get('/notifications/')
    ])
      .then(([apptRes, notifRes]) => {
        setAppointments(apptRes.data);
        setNotifications(notifRes.data);
      })
      .catch((err) => showToast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.find((a) => a.status === 'CONFIRMED' || a.status === 'PENDING');

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '6px' }}>
          Welcome back, {user.name || 'Beautiful'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your luxury salon visits, explore treatments, and pamper yourself.
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Visits</span>
            <div className="stat-icon"><Calendar size={20} /></div>
          </div>
          <div className="stat-value">{appointments.length}</div>
          <span className="stat-subtitle">Appointments booked</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Upcoming</span>
            <div className="stat-icon" style={{ color: '#0F5132', background: '#D1E7DD' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value">{appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length}</div>
          <span className="stat-subtitle">Active bookings</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Notifications</span>
            <div className="stat-icon"><Bell size={20} /></div>
          </div>
          <div className="stat-value">{notifications.length}</div>
          <span className="stat-subtitle">Recent alerts</span>
        </div>
      </div>

      {/* Upcoming Appointment Highlight Banner */}
      {upcoming && (
        <div className="card card-lift" style={{ marginBottom: '32px', background: 'var(--surface-subtle)', border: '1.5px solid var(--rose-pink)' }}>
          <span className="badge badge-pink" style={{ marginBottom: '12px' }}>UPCOMING APPOINTMENT</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '24px', margin: '4px 0' }}>{upcoming.service_name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Date: <b>{upcoming.date}</b> • Salon: {upcoming.parlour_name || 'Glamora Salon'}
              </p>
            </div>
            <Link to="/appointments" className="btn btn-small">
              View Booking Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Action Banner */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--btn-gradient)', color: '#FFF', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ color: '#FFF', fontSize: '26px', marginBottom: '6px' }}>Ready for your next salon experience?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>Browse our curated treatments and select your preferred beautician.</p>
        </div>
        <Link to="/services" className="btn btn-gold">
          Browse Services <Sparkles size={16} />
        </Link>
      </div>
    </div>
  );
}

// ==========================================
// 2. BROWSE SERVICES VIEW
// ==========================================
export function BrowseServicesView() {
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/public-services/', { params: { search: query, category } })
      .then(({ data }) => setServices(data))
      .catch((err) => showToast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/categories/').then(({ data }) => setCategories(data)).catch(() => {});
    load();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '6px' }}>Browse Luxury Services</h1>
        <p style={{ color: 'var(--text-muted)' }}>Explore our signature salon treatments, hair styling, skin therapies, and spa sessions.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-subtle)', padding: '4px 14px', borderRadius: 'var(--radius-md)' }}>
          <Search size={18} color="var(--rose-pink)" />
          <input
            type="text"
            className="form-control"
            style={{ border: 'none', background: 'transparent' }}
            placeholder="Search service name, treatment, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '200px' }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <button className="btn btn-small" onClick={load}>
          Search
        </button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="service-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card" style={{ height: '350px' }}>
              <div className="skeleton" style={{ height: '180px', marginBottom: '16px' }} />
              <div className="skeleton" style={{ height: '24px', width: '70%', marginBottom: '10px' }} />
              <div className="skeleton" style={{ height: '16px', width: '90%' }} />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon"><Search size={32} /></div>
          <h3>No matching services found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search criteria or clearing filters.</p>
        </div>
      ) : (
        <div className="service-grid">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. MY APPOINTMENTS VIEW
// ==========================================
export function MyAppointmentsView() {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/appointments/')
      .then(({ data }) => setAppointments(data))
      .catch((err) => showToast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}/`);
      showToast('Appointment cancelled successfully.', 'info');
      load();
    } catch (err) {
      showToast(errorMessage(err), 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '6px' }}>My Appointments</h1>
        <p style={{ color: 'var(--text-muted)' }}>View your active, completed, and past booking history.</p>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ padding: '24px', color: 'var(--text-muted)' }}>Loading your appointments...</p>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Calendar size={32} /></div>
            <h3>No appointments scheduled</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Book your first salon experience today!</p>
            <Link to="/services" className="btn">Browse Services</Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Treatment / Service</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.service_name}</td>
                    <td>{item.date}</td>
                    <td>
                      <span className={`badge ${item.status === 'CONFIRMED' ? 'badge-success' : item.status === 'COMPLETED' ? 'badge-gold' : item.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {(item.status === 'PENDING' || item.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleCancel(item.id)}
                          className="btn btn-secondary btn-small"
                          style={{ borderColor: '#DC3545', color: '#DC3545' }}
                        >
                          Cancel
                        </button>
                      )}
                      {item.status === 'COMPLETED' && (
                        <Link to={`/review/${item.parlour || 1}`} className="btn btn-small">
                          Leave Review
                        </Link>
                      )}
                    </td>
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

// ==========================================
// 4. FAVOURITES VIEW
// ==========================================
export function FavouriteServicesView() {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('glamora_likes') || '[]');
      api.get('/public-services/')
        .then(({ data }) => {
          setFavourites(data.filter((s) => savedIds.includes(s.id)));
        })
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '6px' }}>Favourite Treatments</h1>
        <p style={{ color: 'var(--text-muted)' }}>Your bookmarked salon services for quick rebooking.</p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading saved favourites...</p>
      ) : favourites.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon"><Heart size={32} /></div>
          <h3>No favourite services yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Click the heart icon on any service card to add it to your favourites list.</p>
          <Link to="/services" className="btn">Explore Services</Link>
        </div>
      ) : (
        <div className="service-grid">
          {favourites.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
