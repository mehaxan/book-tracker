import React, { useState, useEffect } from 'react';
import { X, Star, Sparkles, Image, BookOpen } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { SHELVES, GENRES, FORMATS } from '../data/initialBooks';

export function BookModal({ isOpen, onClose, initialData = null }) {
  const { addBook, updateBook } = useBooks();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    cover: '',
    totalPages: '',
    currentPage: '0',
    status: SHELVES.WISHLIST,
    genre: 'Fiction',
    format: 'Paperback',
    price: '',
    rating: 0,
    priority: 'Medium',
    startDate: '',
    finishDate: '',
    boughtDate: '',
    favoriteQuote: '',
    review: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        cover: initialData.cover || '',
        totalPages: initialData.totalPages || '',
        currentPage: initialData.currentPage !== undefined ? initialData.currentPage.toString() : '0',
        status: initialData.status || SHELVES.WISHLIST,
        genre: initialData.genre || 'Fiction',
        format: initialData.format || 'Paperback',
        price: initialData.price !== undefined ? initialData.price.toString() : '',
        rating: initialData.rating || 0,
        priority: initialData.priority || 'Medium',
        startDate: initialData.startDate || '',
        finishDate: initialData.finishDate || '',
        boughtDate: initialData.boughtDate || '',
        favoriteQuote: initialData.favoriteQuote || '',
        review: initialData.review || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        title: '',
        author: '',
        cover: '',
        totalPages: '',
        currentPage: '0',
        status: SHELVES.READING,
        genre: 'Fiction',
        format: 'Paperback',
        price: '',
        rating: 0,
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        finishDate: '',
        boughtDate: '',
        favoriteQuote: '',
        review: '',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) {
      alert('Please provide both a Title and Author.');
      return;
    }

    const payload = {
      ...formData,
      totalPages: Number(formData.totalPages) || 1,
      currentPage: Number(formData.currentPage) || 0,
      price: Number(formData.price) || 0,
      rating: Number(formData.rating) || 0
    };

    if (initialData?.id) {
      updateBook(initialData.id, payload);
    } else {
      addBook(payload);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>{initialData ? 'Edit Book Details' : 'Add New Book'}</h3>
          <button className="btn-card-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title & Author */}
            <div className="form-row">
              <div className="form-group">
                <label>Book Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Dune"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Author *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Frank Herbert"
                  value={formData.author}
                  onChange={(e) => handleChange('author', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Status / Shelf & Genre */}
            <div className="form-row">
              <div className="form-group">
                <label>Shelf / Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value={SHELVES.WISHLIST}>Wishlist (Want to Read)</option>
                  <option value={SHELVES.BOUGHT}>Bought / Owned (Unread TBR)</option>
                  <option value={SHELVES.READING}>Currently Reading</option>
                  <option value={SHELVES.FINISHED}>Finished</option>
                  <option value={SHELVES.DNF}>Did Not Finish (DNF)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Genre / Category</label>
                <select
                  className="form-control"
                  value={formData.genre}
                  onChange={(e) => handleChange('genre', e.target.value)}
                >
                  {GENRES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pages: Total & Current */}
            <div className="form-row">
              <div className="form-group">
                <label>Total Pages</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 450"
                  value={formData.totalPages}
                  onChange={(e) => handleChange('totalPages', e.target.value)}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Current Page Read</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 120"
                  value={formData.currentPage}
                  onChange={(e) => handleChange('currentPage', e.target.value)}
                  min="0"
                  max={formData.totalPages || 99999}
                />
              </div>
            </div>

            {/* Format & Price */}
            <div className="form-row">
              <div className="form-group">
                <label>Format</label>
                <select
                  className="form-control"
                  value={formData.format}
                  onChange={(e) => handleChange('format', e.target.value)}
                >
                  {FORMATS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Price (৳ Taka)</label>
                <input
                  type="number"
                  step="1"
                  className="form-control"
                  placeholder="e.g. 650"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            {/* Conditional fields based on status */}
            {formData.status === SHELVES.WISHLIST && (
              <div className="form-group">
                <label>Wishlist Priority</label>
                <select
                  className="form-control"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  <option value="High">High (Next to buy)</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            )}

            {/* Rating Stars (for Finished or in general) */}
            <div className="form-group">
              <label>Your Rating ({formData.rating ? `${formData.rating} Stars` : 'Unrated'})</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                    onClick={() => handleChange('rating', formData.rating === star ? 0 : star)}
                  >
                    <Star
                      size={24}
                      fill={star <= formData.rating ? 'var(--amber)' : 'none'}
                      stroke="var(--amber)"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Image URL */}
            <div className="form-group">
              <label>Cover Image URL (Optional)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={formData.cover}
                onChange={(e) => handleChange('cover', e.target.value)}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Leave blank to automatically render an artistic book jacket gradient.
              </span>
            </div>

            {/* Quotes & Review */}
            <div className="form-group">
              <label>Favorite Quote / Passage</label>
              <input
                type="text"
                className="form-control"
                placeholder="A memorable line from the book..."
                value={formData.favoriteQuote}
                onChange={(e) => handleChange('favoriteQuote', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Review &amp; Personal Takeaways</label>
              <textarea
                className="form-control"
                placeholder="What did you learn? How did it make you feel?"
                value={formData.review}
                onChange={(e) => handleChange('review', e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Sparkles size={16} />
              <span>{initialData ? 'Save Changes' : 'Add to Library'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
