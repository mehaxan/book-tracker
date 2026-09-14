import React from 'react';
import { 
  X, 
  Star, 
  BookOpen, 
  Clock, 
  Quote, 
  Calendar, 
  Tag, 
  DollarSign, 
  Edit3, 
  Trash2,
  CheckCircle2,
  ShoppingBag,
  Heart
} from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { SHELVES } from '../data/initialBooks';

export function BookDetailModal({ book, isOpen, onClose, onEdit, onOpenProgress }) {
  const { moveShelf, deleteBook } = useBooks();

  if (!isOpen || !book) return null;

  const pct = Math.min(100, Math.round(((book.currentPage || 0) / (book.totalPages || 1)) * 100));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="book-genre-pill">{book.genre}</span>
            {book.format && <span className="book-genre-pill">{book.format}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn-card-icon" 
              onClick={() => { onClose(); onEdit(book); }}
              title="Edit Book Details"
            >
              <Edit3 size={16} />
            </button>
            <button 
              className="btn-card-icon delete" 
              onClick={() => {
                if (window.confirm(`Delete "${book.title}"?`)) {
                  deleteBook(book.id);
                  onClose();
                }
              }}
              title="Delete Book"
            >
              <Trash2 size={16} />
            </button>
            <button className="btn-card-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ gap: '22px' }}>
          {/* Top Hero: Cover + Meta */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: '130px', height: '185px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, boxShadow: 'var(--shadow-md)' }}>
              {book.cover ? (
                <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="book-fallback-cover" style={{ background: book.gradient }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{book.title}</span>
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.25 }}>{book.title}</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>by {book.author}</p>

              {/* Rating */}
              {book.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={18}
                      fill={star <= book.rating ? 'var(--amber)' : 'none'}
                      stroke="var(--amber)"
                    />
                  ))}
                  <span style={{ fontWeight: 700, marginLeft: '6px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {book.rating} / 5
                  </span>
                </div>
              )}

              {/* Status and shelf selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Shelf:</span>
                <select 
                  className="select-styled"
                  style={{ height: '32px', fontSize: '0.8rem' }}
                  value={book.status}
                  onChange={(e) => moveShelf(book.id, e.target.value)}
                >
                  <option value={SHELVES.WISHLIST}>Wishlist (Want to Read)</option>
                  <option value={SHELVES.BOUGHT}>Bought / Owned (Unread TBR)</option>
                  <option value={SHELVES.READING}>Currently Reading</option>
                  <option value={SHELVES.FINISHED}>Finished</option>
                  <option value={SHELVES.DNF}>Did Not Finish (DNF)</option>
                </select>
              </div>

              {/* Dates & Investment */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {book.price > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>৳</span>
                    ৳{Number(book.price).toLocaleString()}
                  </span>
                )}
                {book.startDate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    Started: {book.startDate}
                  </span>
                )}
                {book.finishDate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} color="var(--emerald)" />
                    Finished: {book.finishDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Reading Progress Block */}
          {book.status === SHELVES.READING && (
            <div className="card-progress-section" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Reading Progress</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {pct}% (p. {book.currentPage} / {book.totalPages})
                </span>
              </div>
              <div className="progress-bar-container" style={{ height: '10px' }}>
                <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button 
                  className="btn-primary" 
                  style={{ height: '34px', fontSize: '0.8rem' }}
                  onClick={() => { onClose(); onOpenProgress(book); }}
                >
                  <Clock size={14} />
                  <span>Update Pages &amp; Log Session</span>
                </button>
              </div>
            </div>
          )}

          {/* Favorite Quote */}
          {book.favoriteQuote && (
            <div style={{
              background: 'var(--bg-elevated)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--primary)',
              display: 'flex',
              gap: '12px'
            }}>
              <Quote size={24} color="var(--primary)" style={{ flexShrink: 0, opacity: 0.8 }} />
              <div>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  "{book.favoriteQuote}"
                </p>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Favorite Excerpt
                </span>
              </div>
            </div>
          )}

          {/* Review / Reflections */}
          {book.review && (
            <div className="form-group">
              <label>Review &amp; Reflections</label>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                {book.review}
              </p>
            </div>
          )}

          {/* General Notes */}
          {book.notes && (
            <div className="form-group">
              <label>Personal Notes &amp; Ideas</label>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                {book.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {book.status === SHELVES.READING && (
            <button 
              className="btn-primary" 
              onClick={() => { onClose(); onOpenProgress(book); }}
            >
              <TrendingUp size={16} />
              <span>Log Progress</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
