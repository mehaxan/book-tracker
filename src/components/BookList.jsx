import React, { useMemo } from 'react';
import { 
  BookOpen, 
  ShoppingBag, 
  Heart, 
  CheckCircle2, 
  Plus, 
  Library, 
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { BookCard } from './BookCard';
import { SHELVES, GENRES } from '../data/initialBooks';

export function BookList({ onOpenAddModal, onEditBook, onSelectBook, onQuickProgress }) {
  const { 
    books, 
    currentView, 
    setCurrentView, 
    searchQuery, 
    selectedGenre, 
    setSelectedGenre, 
    sortBy, 
    setSortBy 
  } = useBooks();

  // Filter books based on active shelf, search query, and genre
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      // Shelf filter
      if (currentView !== 'all' && currentView !== 'dashboard') {
        if (book.status !== currentView) return false;
      }

      // Genre filter
      if (selectedGenre !== 'All' && book.genre !== selectedGenre) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = book.title?.toLowerCase().includes(q);
        const matchAuthor = book.author?.toLowerCase().includes(q);
        const matchNotes = book.notes?.toLowerCase().includes(q);
        const matchQuote = book.favoriteQuote?.toLowerCase().includes(q);
        const matchReview = book.review?.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchNotes && !matchQuote && !matchReview) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'progress') {
        const pctA = ((a.currentPage || 0) / (a.totalPages || 1));
        const pctB = ((b.currentPage || 0) / (b.totalPages || 1));
        return pctB - pctA;
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'pages') {
        return (b.totalPages || 0) - (a.totalPages || 0);
      }
      if (sortBy === 'price') {
        return (b.price || 0) - (a.price || 0);
      }
      // default: updated / id order
      return 0;
    });
  }, [books, currentView, searchQuery, selectedGenre, sortBy]);

  const shelfTabs = [
    { id: 'all', label: 'All Books' },
    { id: SHELVES.READING, label: 'Reading' },
    { id: SHELVES.BOUGHT, label: 'Bought / Owned' },
    { id: SHELVES.WISHLIST, label: 'Wishlist' },
    { id: SHELVES.FINISHED, label: 'Finished' },
    { id: SHELVES.DNF, label: 'DNF' }
  ];

  const getShelfTitle = () => {
    switch (currentView) {
      case SHELVES.READING: return 'Currently Reading';
      case SHELVES.BOUGHT: return 'Books Bought & Owned (TBR)';
      case SHELVES.WISHLIST: return 'Books Wishlist';
      case SHELVES.FINISHED: return 'Finished Reading Archive';
      case SHELVES.DNF: return 'Did Not Finish (Abandoned)';
      default: return 'Complete Book Library';
    }
  };

  const getShelfDescription = () => {
    switch (currentView) {
      case SHELVES.READING: return 'Active books in flight. Update pages or log timed sessions.';
      case SHELVES.BOUGHT: return 'Physical and digital books in your possession waiting to be read.';
      case SHELVES.WISHLIST: return 'Curated wishlist of anticipated books, release dates, and gift ideas.';
      case SHELVES.FINISHED: return 'Your completed accomplishments, 5-star ratings, and key quotes.';
      case SHELVES.DNF: return 'Books set aside for now or abandoned without guilt.';
      default: return 'Explore and manage your entire reading catalog.';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title & Shelf Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {getShelfTitle()}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {getShelfDescription()}
          </p>
        </div>

        <button className="btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Shelf Controls Bar */}
      <div className="shelf-controls-bar">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          {shelfTabs.map(tab => (
            <button
              key={tab.id}
              className={`filter-tab-btn ${currentView === tab.id ? 'active' : ''}`}
              onClick={() => setCurrentView(tab.id)}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Filters Right: Genre & Sort */}
        <div className="controls-right">
          <select 
            className="select-styled"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="All">All Genres</option>
            {GENRES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select 
            className="select-styled"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="updated">Default Order</option>
            <option value="progress">Reading Progress %</option>
            <option value="rating">Highest Rating</option>
            <option value="title">Title (A-Z)</option>
            <option value="pages">Most Pages</option>
            <option value="price">Highest Price</option>
          </select>
        </div>
      </div>

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <div className="book-cards-grid">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={onEditBook}
              onSelect={onSelectBook}
              onQuickProgress={onQuickProgress}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="empty-shelf-state">
          <div className="empty-icon">
            <Bookmark size={26} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No books found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px' }}>
            {searchQuery 
              ? `No books matching "${searchQuery}". Try adjusting your search term or genre filter.`
              : `Your ${getShelfTitle()} shelf currently has no books.`}
          </p>
          <button className="btn-primary" onClick={onOpenAddModal} style={{ marginTop: '8px' }}>
            <Plus size={16} />
            <span>Add a Book to This Shelf</span>
          </button>
        </div>
      )}
    </div>
  );
}
