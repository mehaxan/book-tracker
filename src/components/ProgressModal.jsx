import React, { useState } from 'react';
import { X, BookOpen, Clock, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { useBooks } from '../context/BookContext';

export function ProgressModal({ isOpen, onClose, book }) {
  const { logProgress, updateBook } = useBooks();

  const [newPage, setNewPage] = useState(book ? book.currentPage : 0);
  const [minutes, setMinutes] = useState(30);
  const [sessionNotes, setSessionNotes] = useState('');

  if (!isOpen || !book) return null;

  const total = book.totalPages || 1;
  const oldPage = book.currentPage || 0;
  const delta = Math.max(0, newPage - oldPage);
  const pct = Math.min(100, Math.round((newPage / total) * 100));

  const handleStep = (amount) => {
    setNewPage(prev => Math.min(total, Math.max(0, prev + amount)));
  };

  const handleSave = (e) => {
    e.preventDefault();
    logProgress(book.id, newPage, true, minutes, sessionNotes);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--primary)" />
            <h3>Log Reading Progress</h3>
          </div>
          <button className="btn-card-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ gap: '20px' }}>
            {/* Book Info */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', background: 'var(--bg-elevated)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              {book.cover ? (
                <img src={book.cover} alt={book.title} style={{ width: '45px', height: '65px', objectFit: 'cover', borderRadius: '4px' }} />
              ) : (
                <div style={{ width: '45px', height: '65px', background: book.gradient, borderRadius: '4px' }} />
              )}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{book.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{book.author}</p>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Currently on page {oldPage} of {total}</span>
              </div>
            </div>

            {/* Page Slider & Steppers */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label>New Current Page</label>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  Page {newPage} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({pct}%)</span>
                </span>
              </div>

              <input 
                type="range" 
                min="0" 
                max={total} 
                value={newPage} 
                onChange={(e) => setNewPage(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', height: '6px', cursor: 'pointer', margin: '8px 0' }}
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn-step" onClick={() => handleStep(10)}>+10p</button>
                <button type="button" className="btn-step" onClick={() => handleStep(25)}>+25p</button>
                <button type="button" className="btn-step" onClick={() => handleStep(50)}>+50p</button>
                <button 
                  type="button" 
                  className="btn-step" 
                  style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--emerald)' }}
                  onClick={() => setNewPage(total)}
                >
                  Finished!
                </button>
              </div>
            </div>

            {/* Session Time & Notes */}
            <div className="form-row">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} />
                  Time Read (Minutes)
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Pages Advanced</label>
                <input
                  type="text"
                  className="form-control"
                  value={`+${delta} pages`}
                  disabled
                  style={{ opacity: 0.8 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Session Notes / Chapter Reflection</label>
              <textarea
                className="form-control"
                placeholder="What happened in today's reading session?"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                style={{ minHeight: '60px' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <CheckCircle2 size={16} />
              <span>Record Progress</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
