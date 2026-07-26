import React, { useState, useEffect } from 'react';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  Mail,
  Search,
  Star,
  Scissors,
  Building2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Filter,
  Info
} from 'lucide-react';
import { useToast } from '../components/ToastContext';
import api from '../api';

const defaultImages = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80'
];

function formatTime(timeStr) {
  if (!timeStr) return '09:00 AM';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

function calculateLiveStatus(openingTimeStr = '09:00', closingTimeStr = '20:00') {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = (openingTimeStr || '09:00').split(':').map(Number);
  const [closeH, closeM] = (closingTimeStr || '20:00').split(':').map(Number);

  const openMinutes = openH * 60 + (openM || 0);
  const closeMinutes = closeH * 60 + (closeM || 0);

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return {
      status: 'OPEN',
      label: 'Open Now',
      badgeClass: 'badge-success',
      color: '#28a745',
      bg: 'rgba(40, 167, 69, 0.15)',
      border: '#28a745'
    };
  } else if (currentMinutes >= openMinutes - 60 && currentMinutes < openMinutes) {
    return {
      status: 'SOON',
      label: 'Opening Soon',
      badgeClass: 'badge-warning',
      color: '#d4af37',
      bg: 'rgba(212, 175, 55, 0.15)',
      border: '#d4af37'
    };
  } else {
    return {
      status: 'CLOSED',
      label: 'Closed',
      badgeClass: 'badge-danger',
      color: '#e63946',
      bg: 'rgba(230, 57, 70, 0.15)',
      border: '#e63946'
    };
  }
}

export default function LiveServicesView() {
  const { showToast } = useToast();
  const [parlours, setParlours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedParlour, setSelectedParlour] = useState(null);

  useEffect(() => {
    api.get('/parlours/')
      .then(({ data }) => setParlours(data))
      .catch((err) => showToast(err.response?.data?.detail || 'Failed to load live parlours', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filteredParlours = parlours.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.services && p.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())));

    const liveStatus = calculateLiveStatus(p.opening_time, p.closing_time).status;
    const matchesStatus = statusFilter === 'ALL' || liveStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span className="badge badge-pink" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#28a745',
                boxShadow: '0 0 8px #28a745',
                animation: 'pulse 1.5s infinite'
              }}
            />
            REAL-TIME STATUS
          </span>
        </div>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Live Services & Parlors</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          View currently operating beauty parlors, business hours, real-time availability, services offered, and contact details.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          marginBottom: '32px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Search input */}
        <div
          style={{
            flex: '1',
            minWidth: '260px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--surface-subtle)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--surface-border)'
          }}
        >
          <Search size={18} color="var(--rose-pink)" />
          <input
            type="text"
            className="form-control"
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
            placeholder="Search parlor name, city, location, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <XCircle size={16} />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-small ${statusFilter === 'ALL' ? '' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Parlors ({parlours.length})
          </button>
          <button
            className={`btn btn-small ${statusFilter === 'OPEN' ? '' : 'btn-secondary'}`}
            style={
              statusFilter === 'OPEN'
                ? { background: '#28a745', borderColor: '#28a745' }
                : { color: '#28a745', borderColor: 'rgba(40, 167, 69, 0.4)' }
            }
            onClick={() => setStatusFilter('OPEN')}
          >
            Open Now ({parlours.filter((p) => calculateLiveStatus(p.opening_time, p.closing_time).status === 'OPEN').length})
          </button>
          <button
            className={`btn btn-small ${statusFilter === 'SOON' ? '' : 'btn-secondary'}`}
            style={
              statusFilter === 'SOON'
                ? { background: '#d4af37', borderColor: '#d4af37' }
                : { color: '#d4af37', borderColor: 'rgba(212, 175, 55, 0.4)' }
            }
            onClick={() => setStatusFilter('SOON')}
          >
            Opening Soon ({parlours.filter((p) => calculateLiveStatus(p.opening_time, p.closing_time).status === 'SOON').length})
          </button>
          <button
            className={`btn btn-small ${statusFilter === 'CLOSED' ? '' : 'btn-secondary'}`}
            style={
              statusFilter === 'CLOSED'
                ? { background: '#e63946', borderColor: '#e63946' }
                : { color: '#e63946', borderColor: 'rgba(230, 57, 70, 0.4)' }
            }
            onClick={() => setStatusFilter('CLOSED')}
          >
            Closed ({parlours.filter((p) => calculateLiveStatus(p.opening_time, p.closing_time).status === 'CLOSED').length})
          </button>
        </div>
      </div>

      {/* Parlours Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="card" style={{ height: '420px', borderRadius: 'var(--radius-lg)' }}>
              <div className="skeleton" style={{ height: '200px', marginBottom: '16px', borderRadius: 'var(--radius-md)' }} />
              <div className="skeleton" style={{ height: '24px', width: '60%', marginBottom: '12px' }} />
              <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '16px', width: '50%' }} />
            </div>
          ))}
        </div>
      ) : filteredParlours.length === 0 ? (
        <div className="empty-state card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div className="empty-icon" style={{ margin: '0 auto 16px', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={32} color="var(--rose-pink)" />
          </div>
          <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>No beauty parlors found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto' }}>
            No parlors match your current filter or search criteria. Try selecting "All Parlors" or clearing the search query.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredParlours.map((parlour, index) => {
            const liveInfo = calculateLiveStatus(parlour.opening_time, parlour.closing_time);
            const imageSrc = parlour.image || defaultImages[index % defaultImages.length];
            const rating = parlour.average_rating ? Number(parlour.average_rating).toFixed(1) : '4.8';

            return (
              <div
                key={parlour.id}
                className="card card-lift"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                {/* Parlour Image & Live Badge */}
                <div style={{ position: 'relative', height: '210px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={imageSrc}
                    alt={parlour.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Rating Tag */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                      background: 'rgba(0, 0, 0, 0.65)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Star size={13} fill="#D4AF37" color="#D4AF37" /> {rating}
                  </div>

                  {/* Live Status Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      background: liveInfo.bg,
                      backdropFilter: 'blur(10px)',
                      border: `1.5px solid ${liveInfo.border}`,
                      color: liveInfo.color,
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-pill)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: liveInfo.color,
                        boxShadow: liveInfo.status === 'OPEN' ? `0 0 8px ${liveInfo.color}` : 'none'
                      }}
                    />
                    {liveInfo.label}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                    {parlour.name}
                  </h2>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '14px' }}>
                    <MapPin size={15} color="var(--rose-pink)" />
                    <span>{parlour.location || 'Central City'}</span>
                  </div>

                  {parlour.description && (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {parlour.description}
                    </p>
                  )}

                  {/* Info Grid: Timings & Contact */}
                  <div
                    style={{
                      background: 'var(--surface-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      marginBottom: '16px',
                      border: '1px solid var(--surface-border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <Clock size={15} color="var(--accent-gold)" />
                      <span>
                        Hours: <b>{formatTime(parlour.opening_time)} — {formatTime(parlour.closing_time)}</b>
                      </span>
                    </div>

                    {parlour.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <Phone size={15} color="var(--rose-pink)" />
                        <span>Phone: <a href={`tel:${parlour.phone}`} style={{ color: 'var(--rose-pink)', fontWeight: 500 }}>{parlour.phone}</a></span>
                      </div>
                    )}

                    {parlour.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <Mail size={15} color="var(--rose-pink)" />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Email: <a href={`mailto:${parlour.email}`} style={{ color: 'var(--text-main)', fontWeight: 500 }}>{parlour.email}</a>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Services Tags */}
                  {parlour.services && parlour.services.length > 0 && (
                    <div style={{ marginTop: 'auto' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                        Services Offered:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {parlour.services.slice(0, 4).map((srv, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '11px',
                              padding: '3px 9px',
                              borderRadius: 'var(--radius-pill)',
                              background: 'var(--surface-subtle)',
                              border: '1px solid var(--surface-border)',
                              color: 'var(--text-main)'
                            }}
                          >
                            {srv}
                          </span>
                        ))}
                        {parlour.services.length > 4 && (
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '3px 9px',
                              borderRadius: 'var(--radius-pill)',
                              background: 'var(--surface-subtle)',
                              color: 'var(--rose-pink)',
                              fontWeight: 600
                            }}
                          >
                            +{parlour.services.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Information Note (No Booking) */}
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <Info size={14} color="var(--accent-gold)" />
                    <span>View-only status. Visit in-person or call directly for walk-in availability.</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
