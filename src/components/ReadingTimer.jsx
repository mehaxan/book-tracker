import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, BookOpen, Clock, X, Check } from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { SHELVES } from '../data/initialBooks';

export function ReadingTimer() {
  const { books, logProgress } = useBooks();

  const readingBooks = books.filter(b => b.status === SHELVES.READING);

  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedBookId, setSelectedBookId] = useState(readingBooks[0]?.id || '');
  const [isFinishing, setIsFinishing] = useState(false);
  const [pagesReadInput, setPagesReadInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    if (!selectedBookId && readingBooks.length > 0) {
      setSelectedBookId(readingBooks[0].id);
    }
    setIsActive(!isActive);
    setIsExpanded(true);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsFinishing(true);
  };

  const handleConfirmFinish = (e) => {
    e.preventDefault();
    const minutes = Math.max(1, Math.round(seconds / 60));
    const pages = Number(pagesReadInput) || 0;

    if (selectedBookId && pages > 0) {
      logProgress(selectedBookId, pages, false, minutes, `Live timer session: ${minutes} min`);
    }

    setSeconds(0);
    setIsFinishing(false);
    setIsExpanded(false);
    setPagesReadInput('');
  };

  const handleCancelFinish = () => {
    setIsFinishing(false);
    setSeconds(0);
    setIsActive(false);
  };

  if (readingBooks.length === 0 && !isActive && !isFinishing) return null;

  return (
    <div className="floating-timer-bar">
      {isFinishing ? (
        <form onSubmit={handleConfirmFinish} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {formatTime(seconds)} ({Math.max(1, Math.round(seconds / 60))}m)
          </span>
          <input
            type="number"
            className="form-control"
            style={{ width: '110px', height: '32px', fontSize: '0.82rem' }}
            placeholder="Pages read?"
            value={pagesReadInput}
            onChange={(e) => setPagesReadInput(e.target.value)}
            min="1"
            autoFocus
            required
          />
          <button type="submit" className="btn-icon" style={{ width: '32px', height: '32px', background: 'var(--emerald)', color: 'white' }} title="Save Session">
            <Check size={16} />
          </button>
          <button type="button" className="btn-icon" style={{ width: '32px', height: '32px' }} onClick={handleCancelFinish} title="Discard">
            <X size={16} />
          </button>
        </form>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--primary)" />
            <span className="timer-digits">{formatTime(seconds)}</span>
          </div>

          {isExpanded && (
            <select
              className="select-styled"
              style={{ height: '32px', fontSize: '0.78rem', maxWidth: '140px' }}
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
            >
              {readingBooks.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          )}

          <div className="timer-controls">
            <button 
              className="btn-icon" 
              style={{ width: '34px', height: '34px', background: isActive ? 'var(--amber)' : 'var(--primary)', color: 'white' }} 
              onClick={handleStartPause}
              title={isActive ? 'Pause Timer' : 'Start Reading Stopwatch'}
            >
              {isActive ? <Pause size={15} /> : <Play size={15} />}
            </button>

            {seconds > 0 && (
              <button 
                className="btn-icon" 
                style={{ width: '34px', height: '34px', background: 'var(--rose)', color: 'white' }} 
                onClick={handleStop}
                title="Finish & Log Pages"
              >
                <Square size={14} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
