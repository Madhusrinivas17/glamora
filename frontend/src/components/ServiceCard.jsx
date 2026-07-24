import React, { useState } from 'react';
import { Heart, Star, Clock, Sparkles, X, Calendar, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultImages = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
];

export default function ServiceCard({ service, index = 0, onLikeToggle, isLiked: initialLiked = false }) {
  const [liked, setLiked] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('glamora_likes') || '[]');
      return saved.includes(service.id);
    } catch {
      return initialLiked;
    }
  });
  const [showDetails, setShowDetails] = useState(false);

  const toggleLike = (e) => {
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    try {
      const saved = JSON.parse(localStorage.getItem('glamora_likes') || '[]');
      let updated;
      if (next) {
        updated = [...new Set([...saved, service.id])];
      } else {
        updated = saved.filter(id => id !== service.id);
      }
      localStorage.setItem('glamora_likes', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    if (onLikeToggle) onLikeToggle(service.id, next);
  };

  const imgUrl = service.image || defaultImages[index % defaultImages.length];
  const isAvailable = service.active !== false;

  return (
    <>
      <div className="service-card">
        <div className="service-image-wrapper">
          <img src={imgUrl} alt={service.name} className="service-image" />
          <span className="service-category-tag">
            {service.category_name || service.category || 'Beauty Care'}
          </span>
          <button
            className={`service-like-btn ${liked ? 'liked' : ''}`}
            onClick={toggleLike}
            aria-label="Add to favourites"
          >
            <Heart size={18} fill={liked ? '#E63946' : 'none'} />
          </button>
        </div>

        <div className="service-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <h3 className="service-title">{service.name}</h3>
            <span className="service-rating">
              <Star size={14} fill="currentColor" /> {service.rating || '4.9'}
            </span>
          </div>

          {service.parlour_name && (
            <p style={{ fontSize: '12px', color: 'var(--rose-pink)', fontWeight: 600, marginBottom: '8px' }}>
              {service.parlour_name} {service.parlour_location ? `• ${service.parlour_location}` : ''}
            </p>
          )}

          <p className="service-desc">{service.description || 'Tailored luxury experience designed to make you glow.'}</p>

          <div className="service-meta">
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Price</span>
              <span className="service-price">Rs. {service.price}</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Duration</span>
              <span className="service-duration">
                <Clock size={13} /> {service.duration_minutes || 45} mins
              </span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Status</span>
              <span className={`badge ${isAvailable ? 'badge-success' : 'badge-danger'}`}>
                {isAvailable ? 'Available' : 'Booked'}
              </span>
            </div>
          </div>

          <div className="service-actions">
            <button
              className="btn btn-secondary btn-small"
              style={{ flex: 1 }}
              onClick={() => setShowDetails(true)}
            >
              View Details
            </button>
            <Link
              to={`/book/${service.parlour || 1}`}
              className="btn btn-small"
              style={{ flex: 1 }}
            >
              Book Now <Sparkles size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Service Details Modal */}
      {showDetails && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowDetails(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              animation: 'slideInUp 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDetails(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--surface-subtle)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
            >
              <X size={16} />
            </button>

            <img
              src={imgUrl}
              alt={service.name}
              style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}
            />

            <span className="badge badge-pink" style={{ marginBottom: '8px' }}>
              {service.category_name || service.category || 'Beauty Care'}
            </span>

            <h2 style={{ fontSize: '26px', margin: '8px 0' }}>{service.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
              {service.description || 'Experience ultimate luxury with our signature treatment. Designed using organic products to restore balance and beauty.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Price Tag</span>
                <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--deep-plum)', fontFamily: 'Playfair Display' }}>Rs. {service.price}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Duration</span>
                <p style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <Clock size={16} color="var(--rose-pink)" /> {service.duration_minutes || 45} minutes
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={toggleLike}>
                <Heart size={16} fill={liked ? '#E63946' : 'none'} color={liked ? '#E63946' : 'currentColor'} />
                {liked ? 'Liked' : 'Favourite'}
              </button>
              <Link to={`/book/${service.parlour || 1}`} className="btn" style={{ flex: 1 }}>
                <Calendar size={16} /> Book Appointment
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
