import React, { useRef } from 'react';
import { 
  Search, 
  Plus, 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  Menu,
  BookOpen
} from 'lucide-react';
import { useBooks } from '../context/BookContext';

export function Header({ onOpenAddModal, onToggleMobileMenu }) {
  const { 
    searchQuery, 
    setSearchQuery, 
    theme, 
    toggleTheme, 
    exportDataJSON, 
    importDataJSON,
    dbConnected 
  } = useBooks();

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importDataJSON(file);
      e.target.value = '';
    }
  };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button 
          className="btn-icon mobile-only-btn" 
          onClick={onToggleMobileMenu}
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="header-search">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search titles, authors, quotes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="header-actions">
        {/* Database Status Indicator */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.76rem',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: dbConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            color: dbConnected ? 'var(--emerald)' : 'var(--amber)',
            border: `1px solid ${dbConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            fontWeight: 600
          }}
          title={dbConnected ? 'Connected to MongoDB Atlas' : 'Local Storage Mode (Connect backend & MongoDB Atlas on VPS)'}
        >
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: dbConnected ? 'var(--emerald)' : 'var(--amber)',
            boxShadow: dbConnected ? '0 0 6px var(--emerald)' : 'none'
          }} />
          <span>{dbConnected ? 'MongoDB Atlas' : 'Local Mode'}</span>
        </div>

        {/* Export / Import */}
        <button 
          className="btn-icon" 
          onClick={exportDataJSON} 
          title="Export Library Backup (JSON)"
        >
          <Download size={17} />
        </button>

        <button 
          className="btn-icon" 
          onClick={() => fileInputRef.current?.click()} 
          title="Import Library Backup (JSON)"
        >
          <Upload size={17} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".json" 
          style={{ display: 'none' }} 
        />

        {/* Theme Toggle */}
        <button 
          className="btn-icon" 
          onClick={toggleTheme} 
          title={theme === 'dark' ? 'Switch to Warm Parchment Mode' : 'Switch to Dark Obsidian Mode'}
        >
          {theme === 'dark' ? <Sun size={17} color="var(--amber)" /> : <Moon size={17} />}
        </button>

        {/* Add Book */}
        <button className="btn-primary" onClick={onOpenAddModal}>
          <Plus size={18} />
          <span>Add Book</span>
        </button>
      </div>
    </header>
  );
}
