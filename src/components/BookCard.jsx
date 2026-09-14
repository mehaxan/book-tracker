import React from 'react';
import { 
  Star, 
  BookOpen, 
  ShoppingBag, 
  Heart, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  ArrowRight,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { SHELVES } from '../data/initialBooks';

export function BookCard({ book, onEdit, onSelect, onQuickProgress }) {
  const { moveShelf, deleteBook } = useBooks();

  const pct = Math.min(100, Math.round(((book.currentPage || 0) / (book.totalPages || 1)) * 100));

  const getShelfBadgeClass = (status) => {
    switch (status) {
      case SHELVES.READING: return 'tag-reading';
      case SHELVES.BOUGHT: return 'tag-bought';
      case SHELVES.WISHLIST: return 'tag-wishlist';
      case SHELVES.FINISHED: return 'tag-finished';
      case SHELVES.DNF: return 'tag-dnf';
      default: return 'tag-reading';
    }
  };

  const getShelfLabel = (status) => {
    switch (status) {
      case SHELVES.READING: return 'Reading';
      case SHELVES.BOUGHT: return 'Bought';
      case SHELVES.WISHLIST: return 'Wishlist';
      case SHELVES.FINISHED: return 'Finished';
      case SHELVES.DNF: return 'DNF';
      default: return status;
    }
  };

  return (
    <div className="book-card">
      {/* Cover Image Container */}
      <div className="book-cover-wrap" onClick={() => onSelect(book)} style={{ cursor: 'pointer' }}>
        {book.cover ? (
          <img 
            src={book.cover} 
            alt={book.title} 
            className="book-cover-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'flex';
            }} 
          />
        ) : null}
        
        {/* Fallback spine book jacket */}
        <div 
          className="book-fallback-cover" 
          style={{ 
            background: book.gradient || 'linear-gradient(135deg, #1e3a8a, #0f172a)',
            display: book.cover ? 'none' : 'flex' 
          }}
        >
          <div style={{ zIndex: 2 }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {book.genre}
            </span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0 2px', lineHeight: 1.2 }}>
              {book.title}
            </h4>
            <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>{book.author}</p>
          </div>
        </div>

        {/* Shelf Tag */}
        <div className={`book-shelf-tag ${getShelfBadgeClass(book.status)}`}>
          {getShelfLabel(book.status)}
        </div>

        {/* Format Tag */}
        {book.format && (
          <div className="book-format-tag">
            {book.format}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="book-card-content">
        <div className="book-header-info">
          <h3 
            className="book-title" 
            title={book.title}
            onClick={() => onSelect(book)}
            style={{ cursor: 'pointer' }}
          >
            {book.title}
          </h3>
          <p className="book-author">{book.author}</p>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
            <span className="book-genre-pill">{book.genre}</span>
            {book.price > 0 && (
              <span className="book-genre-pill" style={{ color: 'var(--emerald)' }}>
                ৳{Number(book.price).toLocaleString()}
              </span>
            )}
            {book.priority && book.status === SHELVES.WISHLIST && (
              <span 
                className="book-genre-pill" 
                style={{ 
                  color: book.priority === 'High' ? 'var(--rose)' : 'var(--amber)',
                  fontWeight: 600
                }}
              >
                {book.priority} Priority
              </span>
            )}
          </div>
        </div>

        {/* Currently Reading Progress */}
        {book.status === SHELVES.READING && (
          <div className="card-progress-section">
            <div className="progress-stats-row">
              <span style={{ color: 'var(--text-secondary)' }}>
                Page <strong>{book.currentPage}</strong> / {book.totalPages}
              </span>
              <span className="progress-pct">{pct}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>

            <div className="quick-step-buttons">
              <button 
                className="btn-step" 
                onClick={(e) => { e.stopPropagation(); onQuickProgress(book.id, 10); }}
                title="Read 10 pages"
              >
                +10p
              </button>
              <button 
                className="btn-step" 
                onClick={(e) => { e.stopPropagation(); onQuickProgress(book.id, 25); }}
                title="Read 25 pages"
              >
                +25p
              </button>
              <button 
                className="btn-step" 
                onClick={(e) => { e.stopPropagation(); onQuickProgress(book.id, 50); }}
                title="Read 50 pages"
              >
                +50p
              </button>
            </div>
          </div>
        )}

        {/* Bought Shelf: Quick Start Button */}
        {book.status === SHELVES.BOUGHT && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Acquired {book.boughtDate ? new Date(book.boughtDate).toLocaleDateString() : 'recently'}
            </div>
            <button 
              className="btn-secondary" 
              style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--primary-glow)' }}
              onClick={() => moveShelf(book.id, SHELVES.READING)}
            >
              <BookOpen size={14} color="var(--primary)" />
              <span>Start Reading Now</span>
            </button>
          </div>
        )}

        {/* Wishlist Shelf: Quick Actions */}
        {book.status === SHELVES.WISHLIST && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-secondary" 
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}
              onClick={() => moveShelf(book.id, SHELVES.BOUGHT)}
              title="Mark as Purchased / In Hand"
            >
              <ShoppingBag size={13} color="var(--emerald)" />
              <span>Mark Bought</span>
            </button>
            <button 
              className="btn-secondary" 
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}
              onClick={() => moveShelf(book.id, SHELVES.READING)}
              title="Start Reading directly"
            >
              <BookOpen size={13} color="var(--primary)" />
              <span>Read Now</span>
            </button>
          </div>
        )}

        {/* Finished Shelf: Star Rating & Review snippet */}
        {book.status === SHELVES.FINISHED && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="card-rating-row">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={15}
                  fill={star <= (book.rating || 0) ? 'var(--amber)' : 'none'}
                  stroke="var(--amber)"
                />
              ))}
              <span style={{ fontSize: '0.8rem', fontWeight: 700, marginLeft: '4px', color: 'var(--text-primary)' }}>
                {book.rating ? `${book.rating}/5` : 'Unrated'}
              </span>
            </div>

            {book.favoriteQuote && (
              <p className="card-quote">
                "{book.favoriteQuote.length > 85 ? book.favoriteQuote.substring(0, 85) + '...' : book.favoriteQuote}"
              </p>
            )}

            {book.finishDate && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Completed on {new Date(book.finishDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="card-footer-actions">
          {/* Change Shelf Dropdown */}
          <select 
            className="shelf-dropdown"
            value={book.status}
            onChange={(e) => moveShelf(book.id, e.target.value)}
            title="Move to shelf"
          >
            <option value={SHELVES.WISHLIST}>Wishlist</option>
            <option value={SHELVES.BOUGHT}>Bought (Owned)</option>
            <option value={SHELVES.READING}>Reading</option>
            <option value={SHELVES.FINISHED}>Finished</option>
            <option value={SHELVES.DNF}>DNF (Abandoned)</option>
          </select>

          <div className="card-icon-actions">
            <button 
              className="btn-card-icon" 
              onClick={() => onEdit(book)} 
              title="Edit Details"
            >
              <Edit3 size={15} />
            </button>
            <button 
              className="btn-card-icon delete" 
              onClick={() => {
                if (window.confirm(`Delete "${book.title}" from your library?`)) {
                  deleteBook(book.id);
                }
              }} 
              title="Delete Book"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
