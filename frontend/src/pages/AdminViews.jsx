import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  UserPlus,
  RotateCcw,
  Sparkles,
  Scissors,
  Plus,
  Edit2,
  Trash2,
  Bell,
  Star,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Tag,
  CalendarOff,
  Percent,
  Check,
  X,
  FileText
} from 'lucide-react';
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
  if (typeof err.response?.data === 'string') return err.response.data;
  return err.message || 'An unexpected error occurred.';
};

// ==========================================
// 1. ADMIN DASHBOARD VIEW
// ==========================================
export function AdminDashboardView() {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/'),
      api.get('/appointments/'),
      api.get('/notifications/')
    ])
      .then(([dashRes, apptRes, notifRes]) => {
        setStats(dashRes.data);
        setAppointments(apptRes.data);
        setNotifications(notifRes.data);
      })
      .catch((err) => showToast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '4px' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time stats and salon performance overview.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/services" className="btn btn-small">
            <Plus size={14} /> Add Service
          </Link>
          <Link to="/admin/beauticians" className="btn btn-secondary btn-small">
            <UserPlus size={14} /> Add Beautician
          </Link>
        </div>
      </div>

      {/* 8 Required Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Today's Bookings</span>
            <div className="stat-icon"><Calendar size={20} /></div>
          </div>
          <div className="stat-value">{stats?.today_bookings ?? 0}</div>
          <span className="stat-subtitle">Scheduled for today</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Revenue</span>
            <div className="stat-icon"><DollarSign size={20} /></div>
          </div>
          <div className="stat-value" style={{ color: 'var(--deep-plum)' }}>
            Rs. {stats?.completed_revenue ?? '0'}
          </div>
          <span className="stat-subtitle">Completed revenue</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Pending</span>
            <div className="stat-icon" style={{ color: '#856404', background: '#FFF3CD' }}><Clock size={20} /></div>
          </div>
          <div className="stat-value">{pendingCount}</div>
          <span className="stat-subtitle">Requires approval</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Confirmed</span>
            <div className="stat-icon" style={{ color: '#0F5132', background: '#D1E7DD' }}><CheckCircle2 size={20} /></div>
          </div>
          <div className="stat-value">{confirmedCount}</div>
          <span className="stat-subtitle">Ready for service</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Cancelled</span>
            <div className="stat-icon" style={{ color: '#842029', background: '#F8D7DA' }}><XCircle size={20} /></div>
          </div>
          <div className="stat-value">{cancelledCount}</div>
          <span className="stat-subtitle">Cancelled visits</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Completed</span>
            <div className="stat-icon" style={{ color: '#055160', background: '#CFF4FC' }}><Sparkles size={20} /></div>
          </div>
          <div className="stat-value">{completedCount}</div>
          <span className="stat-subtitle">Fulfilled appointments</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">New Customers</span>
            <div className="stat-icon"><UserPlus size={20} /></div>
          </div>
          <div className="stat-value">{stats?.new_customers ?? 0}</div>
          <span className="stat-subtitle">First-time visitors</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Repeat Clients</span>
            <div className="stat-icon"><RotateCcw size={20} /></div>
          </div>
          <div className="stat-value">{stats?.repeat_customers ?? 0}</div>
          <span className="stat-subtitle">Loyal returning clients</span>
        </div>
      </div>

      {/* Most Booked Service Banner */}
      <div className="card" style={{ marginBottom: '32px', background: 'var(--surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="stat-icon" style={{ width: '48px', height: '48px', background: 'var(--btn-gradient)', color: '#FFF' }}>
            <Scissors size={24} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>MOST BOOKED SERVICE</span>
            <h3 style={{ fontSize: '20px', margin: '2px 0' }}>{stats?.most_booked_service?.service__name || 'Signature Hair & Facial Treatment'}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Top performing luxury treatment in your parlour.</p>
          </div>
        </div>
        <Link to="/admin/services" className="btn btn-secondary btn-small">
          Manage Services <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Recent Bookings & Quick Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '20px' }}>Recent Bookings</h3>
            <Link to="/admin/appointments" style={{ fontSize: '13px', color: 'var(--rose-pink)', fontWeight: 600 }}>View All</Link>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 6).map((appt) => (
                  <tr key={appt.id}>
                    <td style={{ fontWeight: 600 }}>{appt.customer_name || 'Client'}</td>
                    <td>{appt.service_name}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{appt.date}</td>
                    <td>
                      <span className={`badge ${appt.status === 'CONFIRMED' ? 'badge-success' : appt.status === 'COMPLETED' ? 'badge-gold' : appt.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No bookings recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/admin/appointments" className="btn btn-secondary btn-small" style={{ justifyContent: 'flex-start' }}>
                <Calendar size={16} /> Manage Appointments
              </Link>
              <Link to="/admin/pricing" className="btn btn-secondary btn-small" style={{ justifyContent: 'flex-start' }}>
                <DollarSign size={16} /> Update Service Pricing
              </Link>
              <Link to="/admin/beauticians" className="btn btn-secondary btn-small" style={{ justifyContent: 'flex-start' }}>
                <Users size={16} /> Manage Beauticians
              </Link>
              <Link to="/admin/offers" className="btn btn-secondary btn-small" style={{ justifyContent: 'flex-start' }}>
                <Tag size={16} /> Create Special Offer
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '14px' }}>Recent Notifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.slice(0, 4).map((notif) => (
                <div key={notif.id} style={{ fontSize: '13px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: 600, display: 'block' }}>{notif.title}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{notif.message}</span>
                </div>
              ))}
              {notifications.length === 0 && (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No notifications recorded.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. OVERVIEW VIEW
// ==========================================
export function AdminOverviewView() {
  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Executive Overview</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Strategic analytical indicators and growth metrics.</p>

      <div className="card" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
        <TrendingUp size={48} color="var(--rose-pink)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Salon Performance Insights</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 24px' }}>
          Analyze booking trends, capacity utilization, repeat client ratios, and monthly revenue performance.
        </p>
        <Link to="/admin/reports" className="btn">View Detailed Financial Reports</Link>
      </div>
    </div>
  );
}

// ==========================================
// 3. MANAGE CATEGORIES VIEW
// ==========================================
export function AdminCategoriesView() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);

  const load = () => api.get('/categories/').then(({ data }) => setCategories(data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api.patch(`/categories/${editingId}/`, form);
      else await api.post('/categories/', form);
      showToast('Category saved successfully!', 'success');
      setForm({ name: '' });
      setEditingId(null);
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await api.delete(`/categories/${id}/`);
      showToast('Category deleted', 'info');
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Manage Categories</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Group your salon treatments into intuitive service categories.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <form onSubmit={handleSubmit} className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingId ? 'Edit Category' : 'Add Category'}</h3>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Category Name</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Hair Styling, Facial Spa"
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
            />
          </div>
          <button className="btn btn-full">{editingId ? 'Update Category' : 'Save Category'}</button>
          {editingId && (
            <button type="button" className="btn btn-secondary btn-full" style={{ marginTop: '8px' }} onClick={() => { setEditingId(null); setForm({ name: '' }); }}>
              Cancel Edit
            </button>
          )}
        </form>

        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Categories ({categories.length})</h3>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category Name</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>#{cat.id}</td>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => { setEditingId(cat.id); setForm({ name: cat.name }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose-pink)', marginRight: '12px' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC3545' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. MANAGE SERVICES VIEW
// ==========================================
export function AdminServicesView() {
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    duration_minutes: '',
    image: '',
    active: true
  });

  const load = () => {
    api.get('/services/').then(({ data }) => setServices(data));
    api.get('/categories/').then(({ data }) => setCategories(data));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        duration_minutes: Number(form.duration_minutes),
        category: Number(form.category)
      };
      if (editingId) await api.patch(`/services/${editingId}/`, payload);
      else await api.post('/services/', payload);
      showToast('Service saved successfully!', 'success');
      setForm({ name: '', category: '', description: '', price: '', duration_minutes: '', image: '', active: true });
      setEditingId(null);
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete service?')) return;
    try {
      await api.delete(`/services/${id}/`);
      showToast('Service removed', 'info');
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Manage Services</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add, edit descriptions, adjust prices, upload photos, and set availability.</p>

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingId ? 'Edit Service' : 'Add New Service'}</h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Service Name</label>
            <input required type="text" className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select required className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Price (Rs.)</label>
            <input required type="number" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Duration (Minutes)</label>
            <input required type="number" className="form-control" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
          </div>

          <div className="form-group full">
            <label>Image URL</label>
            <input type="url" className="form-control" placeholder="https://..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>

          <div className="form-group full">
            <label>Description</label>
            <textarea rows={2} className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="form-group full" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="activeToggle" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} style={{ accentColor: 'var(--rose-pink)' }} />
            <label htmlFor="activeToggle">Service Active & Bookable</label>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <button className="btn">{editingId ? 'Update Service' : 'Add Service'}</button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm({ name: '', category: '', description: '', price: '', duration_minutes: '', image: '', active: true }); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="card">
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Services Catalogue ({services.length})</h3>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv) => (
                <tr key={srv.id}>
                  <td style={{ fontWeight: 600 }}>{srv.name}</td>
                  <td>{srv.category_name || srv.category}</td>
                  <td style={{ color: 'var(--deep-plum)', fontWeight: 700 }}>Rs. {srv.price}</td>
                  <td>{srv.duration_minutes} mins</td>
                  <td>
                    <span className={`badge ${srv.active ? 'badge-success' : 'badge-danger'}`}>
                      {srv.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => { setEditingId(srv.id); setForm(srv); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose-pink)', marginRight: '12px' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(srv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC3545' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. MANAGE PRICING VIEW
// ==========================================
export function AdminPricingView() {
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  const load = () => api.get('/services/').then(({ data }) => setServices(data));
  useEffect(() => { load(); }, []);

  const handlePriceUpdate = async (id) => {
    try {
      await api.patch(`/services/${id}/`, { price: Number(newPrice) });
      showToast('Service price updated!', 'success');
      setEditingId(null);
      setNewPrice('');
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Manage Service Pricing</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Quickly review and update service fees across all categories.</p>

      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>Current Price</th>
                <th style={{ textAlign: 'right' }}>Quick Price Adjustment</th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv) => (
                <tr key={srv.id}>
                  <td style={{ fontWeight: 600 }}>{srv.name}</td>
                  <td>{srv.category_name || srv.category}</td>
                  <td style={{ color: 'var(--deep-plum)', fontWeight: 700, fontSize: '16px' }}>Rs. {srv.price}</td>
                  <td style={{ textAlign: 'right' }}>
                    {editingId === srv.id ? (
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="number"
                          className="form-control"
                          style={{ width: '120px', padding: '6px 10px' }}
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                        />
                        <button className="btn btn-small" onClick={() => handlePriceUpdate(srv.id)}>Save</button>
                        <button className="btn btn-secondary btn-small" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn btn-secondary btn-small" onClick={() => { setEditingId(srv.id); setNewPrice(srv.price); }}>
                        <Edit2 size={14} /> Update Price
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. MANAGE BEAUTICIANS VIEW
// ==========================================
export function AdminBeauticiansView() {
  const { showToast } = useToast();
  const [beauticians, setBeauticians] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    specialization: '',
    experience_years: '',
    image: '',
    is_available: true,
    on_leave: false
  });

  const load = () => api.get('/beauticians/').then(({ data }) => setBeauticians(data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, experience_years: Number(form.experience_years) };
      if (editingId) await api.patch(`/beauticians/${editingId}/`, payload);
      else await api.post('/beauticians/', payload);
      showToast('Beautician saved successfully!', 'success');
      setForm({ name: '', specialization: '', experience_years: '', image: '', is_available: true, on_leave: false });
      setEditingId(null);
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete beautician?')) return;
    try {
      await api.delete(`/beauticians/${id}/`);
      showToast('Beautician removed', 'info');
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Manage Beauticians</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add specialists, assign experience, update leave status, and manage availability.</p>

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingId ? 'Edit Beautician' : 'Add Beautician'}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            <input required type="text" className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Specialization</label>
            <input required type="text" className="form-control" placeholder="e.g. Master Stylist" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Experience (Years)</label>
            <input required type="number" className="form-control" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Photo URL</label>
            <input type="url" className="form-control" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>
          <div className="form-group full" style={{ flexDirection: 'row', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} style={{ accentColor: 'var(--rose-pink)' }} />
              Is Available
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={form.on_leave} onChange={(e) => setForm({ ...form, on_leave: e.target.checked })} style={{ accentColor: 'var(--rose-pink)' }} />
              On Leave
            </label>
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <button className="btn">{editingId ? 'Update Beautician' : 'Add Beautician'}</button>
        </div>
      </form>

      <div className="card">
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Beautician Roster ({beauticians.length})</h3>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Availability</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {beauticians.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.name}</td>
                  <td>{b.specialization}</td>
                  <td>{b.experience_years} years</td>
                  <td>
                    <span className={`badge ${b.on_leave ? 'badge-danger' : b.is_available ? 'badge-success' : 'badge-warning'}`}>
                      {b.on_leave ? 'On Leave' : b.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => { setEditingId(b.id); setForm(b); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose-pink)', marginRight: '12px' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC3545' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. MANAGE SLOTS VIEW
// ==========================================
export function AdminSlotsView() {
  const { showToast } = useToast();
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState('');

  const load = () => api.get('/slots/').then(({ data }) => setSlots(data));
  useEffect(() => { load(); }, []);

  const addSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post('/slots/', { start_time: time, active: true });
      showToast('Time slot added!', 'success');
      setTime('');
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  const removeSlot = async (id) => {
    try {
      await api.delete(`/slots/${id}/`);
      showToast('Slot removed', 'info');
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Manage Slots</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Configure daily operational booking time slots for your parlour.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <form onSubmit={addSlot} className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Add Time Slot</h3>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Start Time (HH:MM)</label>
            <input type="time" required className="form-control" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <button className="btn btn-full">Add Slot</button>
        </form>

        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Active Time Slots ({slots.length})</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {slots.map((s) => (
              <div key={s.id} className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface-subtle)' }}>
                <Clock size={16} color="var(--rose-pink)" />
                <span style={{ fontWeight: 600, fontSize: '16px' }}>{s.start_time?.slice(0, 5)}</span>
                <button onClick={() => removeSlot(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC3545' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. MANAGE APPOINTMENTS VIEW
// ==========================================
export function AdminAppointmentsView() {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => api.get('/appointments/').then(({ data }) => setAppointments(data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.post(`/appointments/${id}/status/`, { status: newStatus });
      showToast(`Appointment status updated to ${newStatus}`, 'success');
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  const filtered = filterStatus ? appointments.filter((a) => a.status === filterStatus) : appointments;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '4px' }}>Manage Appointments</h1>
          <p style={{ color: 'var(--text-muted)' }}>Approve, reject, reschedule, assign beauticians, or mark completed.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select className="form-control" style={{ width: '180px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Date</th>
                <th>Beautician</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((appt) => (
                <tr key={appt.id}>
                  <td>
                    <span style={{ fontWeight: 600, display: 'block' }}>{appt.customer_name || 'Client'}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{appt.customer_email || ''}</span>
                  </td>
                  <td>{appt.service_name}</td>
                  <td>{appt.date}</td>
                  <td>{appt.beautician_name || 'Auto-Assigned'}</td>
                  <td>
                    <span className={`badge ${appt.status === 'CONFIRMED' ? 'badge-success' : appt.status === 'COMPLETED' ? 'badge-gold' : appt.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <select
                      className="form-control"
                      style={{ width: '150px', padding: '6px 10px', fontSize: '12px' }}
                      value=""
                      onChange={(e) => e.target.value && updateStatus(appt.id, e.target.value)}
                    >
                      <option value="">Update Status</option>
                      <option value="CONFIRMED">Approve (Confirm)</option>
                      <option value="COMPLETED">Complete</option>
                      <option value="CANCELLED">Reject / Cancel</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No appointments match the filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. MANAGE OFFERS VIEW
// ==========================================
export function AdminOffersView() {
  const { showToast } = useToast();
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    discount_percentage: '',
    valid_from: '',
    valid_to: '',
    image: '',
    active: true
  });

  const load = () => api.get('/offers/').then(({ data }) => setOffers(data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/offers/', { ...form, discount_percentage: Number(form.discount_percentage) });
      showToast('Offer created!', 'success');
      setForm({ title: '', description: '', discount_percentage: '', valid_from: '', valid_to: '', image: '', active: true });
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/offers/${id}/`);
      showToast('Offer deleted', 'info');
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Manage Offers & Promotions</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Create promotional discounts and seasonal campaigns.</p>

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Create New Offer</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Offer Title</label>
            <input required type="text" className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Discount Percentage (%)</label>
            <input required type="number" min="1" max="100" className="form-control" value={form.discount_percentage} onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Valid From</label>
            <input required type="date" className="form-control" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Valid To</label>
            <input required type="date" className="form-control" value={form.valid_to} onChange={(e) => setForm({ ...form, valid_to: e.target.value })} />
          </div>
          <div className="form-group full">
            <label>Description</label>
            <textarea rows={2} className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <button className="btn" style={{ marginTop: '16px' }}>Save Offer</button>
      </form>

      <div className="card">
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Active Promotional Offers</h3>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Discount</th>
                <th>Valid Period</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((off) => (
                <tr key={off.id}>
                  <td style={{ fontWeight: 600 }}>{off.title}</td>
                  <td style={{ color: 'var(--rose-pink)', fontWeight: 700 }}>{off.discount_percentage}% OFF</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{off.valid_from} to {off.valid_to}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDelete(off.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC3545' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. MANAGE HOLIDAYS VIEW
// ==========================================
export function AdminHolidaysView() {
  const { showToast } = useToast();
  const [holidays, setHolidays] = useState([]);
  const [form, setForm] = useState({ date: '', reason: '' });

  const load = () => api.get('/holidays/').then(({ data }) => setHolidays(data));
  useEffect(() => { load(); }, []);

  const addHoliday = async (e) => {
    e.preventDefault();
    try {
      await api.post('/holidays/', form);
      showToast('Holiday added!', 'success');
      setForm({ date: '', reason: '' });
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  const removeHoliday = async (id) => {
    try {
      await api.delete(`/holidays/${id}/`);
      showToast('Holiday removed', 'info');
      load();
    } catch (err) { showToast(errorMessage(err), 'error'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Manage Holidays & Closures</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Set dates when your salon will be closed for booking.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <form onSubmit={addHoliday} className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Add Holiday Date</h3>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>Date</label>
            <input type="date" required className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Reason / Holiday Name</label>
            <input type="text" required className="form-control" placeholder="e.g. Annual Maintenance, National Holiday" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <button className="btn btn-full">Save Holiday</button>
        </form>

        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Scheduled Closures ({holidays.length})</h3>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reason</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h) => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 600 }}>{h.date}</td>
                    <td>{h.reason}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => removeHoliday(h.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC3545' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 11. CUSTOMER HISTORY VIEW
// ==========================================
export function AdminCustomersView() {
  const [report, setReport] = useState(null);
  useEffect(() => { api.get('/reports/').then(({ data }) => setReport(data)); }, []);

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Customer History</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Track client booking frequency, visit history, and contact info.</p>

      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Total Visits</th>
              </tr>
            </thead>
            <tbody>
              {report?.customers?.map((cust, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{cust.customer__first_name || 'Client'}</td>
                  <td>{cust.customer__email}</td>
                  <td><span className="badge badge-pink">{cust.visits} visits</span></td>
                </tr>
              ))}
              {(!report?.customers || report.customers.length === 0) && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No customer history available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 12. REPORTS VIEW
// ==========================================
export function AdminReportsView() {
  const [report, setReport] = useState(null);
  useEffect(() => { api.get('/reports/').then(({ data }) => setReport(data)); }, []);

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Intelligence & Reports</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Comprehensive revenue breakdowns and treatment performance analytics.</p>

      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-title">Total Bookings</div>
          <div className="stat-value">{report?.total_bookings ?? 0}</div>
          <span className="stat-subtitle">All-time bookings</span>
        </div>

        <div className="stat-card">
          <div className="stat-title">Completed Visits</div>
          <div className="stat-value">{report?.completed_bookings ?? 0}</div>
          <span className="stat-subtitle">Successful appointments</span>
        </div>

        <div className="stat-card">
          <div className="stat-title">Cancelled</div>
          <div className="stat-value">{report?.cancelled_bookings ?? 0}</div>
          <span className="stat-subtitle">Cancelled bookings</span>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value" style={{ color: 'var(--deep-plum)' }}>
            Rs. {report?.revenue ?? '0'}
          </div>
          <span className="stat-subtitle">Completed revenue</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Most Booked Treatments</h3>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Total Bookings Count</th>
              </tr>
            </thead>
            <tbody>
              {report?.services?.map((srv, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{srv.service__name}</td>
                  <td>{srv.bookings} bookings</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 13. NOTIFICATIONS VIEW
// ==========================================
export function AdminNotificationsView() {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => { api.get('/notifications/').then(({ data }) => setNotifications(data)); }, []);

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Notifications Feed</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>System alerts, booking updates, and client activity logs.</p>

      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.map((n) => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px' }}>
              <div className="stat-icon"><Bell size={18} /></div>
              <div>
                <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>{n.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{n.message}</p>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>{new Date(n.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No notifications to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 14. REVIEWS VIEW
// ==========================================
export function AdminReviewsView() {
  const [reviews, setReviews] = useState([]);
  useEffect(() => { api.get('/reviews/').then(({ data }) => setReviews(data)); }, []);

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Customer Reviews & Ratings</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Client ratings and written feedback regarding your salon services.</p>

      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Rating</th>
                <th>Client Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev.id}>
                  <td style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                    <Star size={14} fill="currentColor" inline /> {rev.rating} / 5 Stars
                  </td>
                  <td>{rev.comment}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(rev.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No customer reviews recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
