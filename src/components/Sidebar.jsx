import React, { useState } from 'react';
import { 
  BookOpen, 
  BarChart3, 
  Bookmark, 
  ShoppingBag, 
  Heart, 
  CheckCircle2, 
  Library, 
  Sparkles,
  Trophy,
  Edit2,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { SHELVES } from '../data/initialBooks';

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { 
    currentView, 
    setCurrentView, 
    analytics, 
    annualGoal, 
    setAnnualGoal, 
    resetToDemo, 
    clearAllData 
  } = useBooks();

  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(annualGoal);

  const navItems = [
    { id: 'dashboard', label: 'Analytics Dashboard', icon: BarChart3, badge: null },
    { id: SHELVES.READING, label: 'Currently Reading', icon: BookOpen, badge: analytics.readingCount },
    { id: SHELVES.BOUGHT, label: 'Bought / Owned', icon: ShoppingBag, badge: analytics.boughtCount },
    { id: SHELVES.WISHLIST, label: 'Wishlist', icon: Heart, badge: analytics.wishlistCount },
    { id: SHELVES.FINISHED, label: 'Finished Archive', icon: CheckCircle2, badge: analytics.finishedCount },
    { id: 'all', label: 'Entire Library', icon: Library, badge: analytics.totalBooks }
  ];

  const handleNavClick = (id) => {
    setCurrentView(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  const handleGoalSave = (e) => {
    e.preventDefault();
    const parsed = parseInt(tempGoal, 10);
    if (parsed && parsed > 0) {
      setAnnualGoal(parsed);
    }
    setEditingGoal(false);
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      {/* Brand */}
      <div className="brand-section">
        <div className="brand-icon">
          <Sparkles size={22} />
        </div>
        <div className="brand-text">
          <h1>Lumina Read</h1>
          <span>Literary Tracker &amp; Lab</span>
        </div>
        {setMobileOpen && (
          <button 
            className="btn-card-icon" 
            style={{ marginLeft: 'auto', display: mobileOpen ? 'flex' : 'none' }}
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="nav-menu">
        <div className="nav-label">Navigation</div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <div className="nav-item-left">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}

        <div className="nav-label" style={{ marginTop: '20px' }}>Library Management</div>
        <button className="nav-item" onClick={resetToDemo} title="Reset to curated sample books">
          <div className="nav-item-left">
            <RefreshCw size={16} />
            <span style={{ fontSize: '0.84rem' }}>Reset Demo Library</span>
          </div>
        </button>
        <button className="nav-item" onClick={clearAllData} title="Clear all books and start fresh">
          <div className="nav-item-left">
            <Trash2 size={16} color="var(--rose)" />
            <span style={{ fontSize: '0.84rem', color: 'var(--rose)' }}>Clear Library</span>
          </div>
        </button>
      </nav>

      {/* Reading Goal Widget */}
      <div className="sidebar-goal-card">
        <div className="goal-card-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Trophy size={15} color="var(--amber)" />
            {new Date().getFullYear()} Challenge
          </span>
          <button 
            className="btn-card-icon" 
            style={{ width: '22px', height: '22px' }}
            onClick={() => {
              setTempGoal(annualGoal);
              setEditingGoal(!editingGoal);
            }}
            title="Adjust Annual Target"
          >
            <Edit2 size={12} />
          </button>
        </div>

        {editingGoal ? (
          <form onSubmit={handleGoalSave} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="number"
              className="form-control"
              style={{ height: '32px', fontSize: '0.85rem' }}
              value={tempGoal}
              onChange={(e) => setTempGoal(e.target.value)}
              min="1"
              max="365"
              autoFocus
            />
            <button type="submit" className="btn-primary" style={{ height: '32px', padding: '0 10px', fontSize: '0.75rem' }}>
              Save
            </button>
          </form>
        ) : (
          <div className="goal-numbers">
            <span className="goal-bold">{analytics.finishedThisYearCount}</span>
            <span className="goal-total">/ {annualGoal} books read</span>
          </div>
        )}

        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${analytics.goalProgressPercent}%` }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          <span>{analytics.goalProgressPercent}% reached</span>
          <span>{Math.max(0, annualGoal - analytics.finishedThisYearCount)} to go</span>
        </div>
      </div>
    </aside>
  );
}
