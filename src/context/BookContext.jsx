import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_BOOKS, INITIAL_SESSIONS, ANNUAL_READING_GOAL, SHELVES } from '../data/initialBooks';
import { api } from '../api/client';

const BookContext = createContext();

export function BookProvider({ children }) {
  // Backend connectivity state
  const [dbConnected, setDbConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('lumina_theme') || 'dark';
  });

  // Books state
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem('lumina_books');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved books', e);
      }
    }
    return INITIAL_BOOKS;
  });

  // Reading sessions state
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('lumina_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved sessions', e);
      }
    }
    return INITIAL_SESSIONS;
  });

  // Annual reading goal
  const [annualGoal, setAnnualGoal] = useState(() => {
    const saved = localStorage.getItem('lumina_annual_goal');
    return saved ? parseInt(saved, 10) : ANNUAL_READING_GOAL;
  });

  // Active view: 'dashboard', 'reading', 'bought', 'wishlist', 'finished', 'all'
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('updated');

  // Confetti trigger hook
  const [celebrationEvent, setCelebrationEvent] = useState(null);

  // Synchronize with backend on mount
  useEffect(() => {
    async function syncWithBackend() {
      try {
        const health = await api.checkHealth();
        if (health && health.status === 'ok') {
          setDbConnected(health.database === 'connected');

          // Fetch books from MongoDB
          const remoteBooks = await api.getBooks();
          if (remoteBooks && remoteBooks.length > 0) {
            setBooks(remoteBooks);
            localStorage.setItem('lumina_books', JSON.stringify(remoteBooks));
          } else {
            // DB is empty, sync initial books to MongoDB Atlas
            api.seedBooks(INITIAL_BOOKS, INITIAL_SESSIONS).catch(() => {});
          }

          // Fetch sessions from MongoDB
          const remoteSessions = await api.getSessions();
          if (remoteSessions && remoteSessions.length > 0) {
            setSessions(remoteSessions);
            localStorage.setItem('lumina_sessions', JSON.stringify(remoteSessions));
          }

          // Fetch settings
          const remoteSettings = await api.getSettings();
          if (remoteSettings) {
            if (remoteSettings.annualGoal) setAnnualGoal(remoteSettings.annualGoal);
            if (remoteSettings.theme) setTheme(remoteSettings.theme);
          }
        }
      } catch (err) {
        // Backend not currently running - fallback cleanly to localStorage
        console.log('[Lumina Read] Operating in local storage mode.');
        setDbConnected(false);
      }
    }

    syncWithBackend();
  }, []);

  // Save to localStorage as backup
  useEffect(() => {
    localStorage.setItem('lumina_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('lumina_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('lumina_annual_goal', annualGoal.toString());
  }, [annualGoal]);

  useEffect(() => {
    localStorage.setItem('lumina_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'warm' : 'dark';
    setTheme(nextTheme);
    api.updateSettings({ theme: nextTheme }).catch(() => {});
  };

  const handleSetAnnualGoal = (newGoal) => {
    setAnnualGoal(newGoal);
    api.updateSettings({ annualGoal: newGoal }).catch(() => {});
  };

  // Book CRUD operations (Optimistic UI + API synchronization)
  const addBook = async (newBookData) => {
    const tempId = `book-${Date.now()}`;
    const newBook = {
      ...newBookData,
      id: tempId,
      currentPage: Number(newBookData.currentPage) || 0,
      totalPages: Number(newBookData.totalPages) || 1,
      price: Number(newBookData.price) || 0,
      rating: Number(newBookData.rating) || 0,
      gradient: newBookData.gradient || getRandomGradient()
    };

    if (newBook.status === SHELVES.READING && !newBook.startDate) {
      newBook.startDate = new Date().toISOString().split('T')[0];
    }
    if (newBook.status === SHELVES.BOUGHT && !newBook.boughtDate) {
      newBook.boughtDate = new Date().toISOString().split('T')[0];
    }
    if (newBook.status === SHELVES.FINISHED && !newBook.finishDate) {
      newBook.finishDate = new Date().toISOString().split('T')[0];
      newBook.currentPage = newBook.totalPages;
    }

    setBooks(prev => [newBook, ...prev]);

    // Async sync to MongoDB
    try {
      const created = await api.createBook(newBook);
      if (created && (created.id || created._id)) {
        const remoteId = created.id || created._id;
        setBooks(prev => prev.map(b => b.id === tempId ? { ...b, id: remoteId } : b));
      }
    } catch (e) {
      console.warn('Saved book locally (API offline)');
    }

    return newBook;
  };

  const updateBook = (id, updatedFields) => {
    setBooks(prev =>
      prev.map(book => {
        if (book.id !== id) return book;
        const updated = { ...book, ...updatedFields };

        // Handle auto-finish
        if (
          updated.currentPage >= updated.totalPages &&
          updated.status !== SHELVES.FINISHED &&
          updated.totalPages > 0
        ) {
          updated.status = SHELVES.FINISHED;
          updated.currentPage = updated.totalPages;
          if (!updated.finishDate) {
            updated.finishDate = new Date().toISOString().split('T')[0];
          }
          setCelebrationEvent({ bookTitle: updated.title, timestamp: Date.now() });
        }
        return updated;
      })
    );

    api.updateBook(id, updatedFields).catch(() => {});
  };

  const deleteBook = (id) => {
    setBooks(prev => prev.filter(book => book.id !== id));
    setSessions(prev => prev.filter(session => session.bookId !== id));
    api.deleteBook(id).catch(() => {});
  };

  const moveShelf = (id, newStatus) => {
    setBooks(prev =>
      prev.map(book => {
        if (book.id !== id) return book;
        const today = new Date().toISOString().split('T')[0];
        const updates = { status: newStatus };

        if (newStatus === SHELVES.BOUGHT && !book.boughtDate) {
          updates.boughtDate = today;
        } else if (newStatus === SHELVES.READING) {
          if (!book.startDate) updates.startDate = today;
          if (!book.boughtDate && book.status === SHELVES.WISHLIST) updates.boughtDate = today;
        } else if (newStatus === SHELVES.FINISHED) {
          if (!book.finishDate) updates.finishDate = today;
          updates.currentPage = book.totalPages;
          setCelebrationEvent({ bookTitle: book.title, timestamp: Date.now() });
        }
        return { ...book, ...updates };
      })
    );

    api.moveShelf(id, newStatus).catch(() => {});
  };

  // Quick progress update + session log
  const logProgress = (bookId, pagesAddedOrAbsolute, isAbsolute = false, minutes = 0, sessionNotes = '') => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const oldPage = book.currentPage;
    const newPage = isAbsolute
      ? Math.min(book.totalPages, Math.max(0, Number(pagesAddedOrAbsolute)))
      : Math.min(book.totalPages, Math.max(0, oldPage + Number(pagesAddedOrAbsolute)));
    
    const delta = newPage - oldPage;

    updateBook(bookId, { currentPage: newPage });

    if (delta > 0 || minutes > 0) {
      const newSession = {
        id: `s-${Date.now()}`,
        bookId,
        bookTitle: book.title,
        date: new Date().toISOString().split('T')[0],
        pagesRead: Math.max(0, delta),
        minutes: Number(minutes) || Math.round(Math.max(1, delta * 1.2)),
        notes: sessionNotes || `Read from page ${oldPage} to ${newPage}`
      };
      setSessions(prev => [newSession, ...prev]);

      api.logProgress(bookId, {
        newCurrentPage: newPage,
        minutes: Number(minutes) || Math.round(Math.max(1, delta * 1.2)),
        notes: sessionNotes
      }).catch(() => {});
    }
  };

  // Add individual reading session
  const addReadingSession = (sessionData) => {
    const session = {
      ...sessionData,
      id: `s-${Date.now()}`,
      pagesRead: Number(sessionData.pagesRead) || 0,
      minutes: Number(sessionData.minutes) || 0,
      date: sessionData.date || new Date().toISOString().split('T')[0]
    };
    setSessions(prev => [session, ...prev]);
    api.createSession(session).catch(() => {});

    if (session.bookId && session.pagesRead > 0) {
      const book = books.find(b => b.id === session.bookId);
      if (book) {
        const newPage = Math.min(book.totalPages, book.currentPage + session.pagesRead);
        updateBook(session.bookId, { currentPage: newPage });
      }
    }
  };

  // Reset to initial demo data
  const resetToDemo = () => {
    if (window.confirm('Reset all books and reading history to initial sample library?')) {
      setBooks(INITIAL_BOOKS);
      setSessions(INITIAL_SESSIONS);
      setAnnualGoal(ANNUAL_READING_GOAL);
      api.seedBooks(INITIAL_BOOKS, INITIAL_SESSIONS).catch(() => {});
    }
  };

  // Clear library
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear your entire library and history? This cannot be undone.')) {
      setBooks([]);
      setSessions([]);
      api.clearAllBooks().catch(() => {});
    }
  };

  // Export JSON backup
  const exportDataJSON = () => {
    const exportObject = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      annualGoal,
      books,
      sessions
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lumina-read-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const importDataJSON = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.books && Array.isArray(imported.books)) {
          setBooks(imported.books);
          if (imported.sessions && Array.isArray(imported.sessions)) {
            setSessions(imported.sessions);
          }
          if (imported.annualGoal) {
            setAnnualGoal(imported.annualGoal);
          }
          api.seedBooks(imported.books, imported.sessions || []).catch(() => {});
          alert('Library backup successfully restored and synced!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Could not parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const analytics = computeAnalytics(books, sessions, annualGoal);

  return (
    <BookContext.Provider
      value={{
        books,
        sessions,
        annualGoal,
        setAnnualGoal: handleSetAnnualGoal,
        theme,
        toggleTheme,
        dbConnected,
        currentView,
        setCurrentView,
        searchQuery,
        setSearchQuery,
        selectedGenre,
        setSelectedGenre,
        sortBy,
        setSortBy,
        addBook,
        updateBook,
        deleteBook,
        moveShelf,
        logProgress,
        addReadingSession,
        resetToDemo,
        clearAllData,
        exportDataJSON,
        importDataJSON,
        analytics,
        celebrationEvent,
        setCelebrationEvent
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
}

function getRandomGradient() {
  const gradients = [
    'linear-gradient(135deg, #1e3a8a, #0f172a)',
    'linear-gradient(135deg, #b45309, #7c2d12)',
    'linear-gradient(135deg, #065f46, #064e3b)',
    'linear-gradient(135deg, #581c87, #312e81)',
    'linear-gradient(135deg, #0e7490, #1e3a8a)',
    'linear-gradient(135deg, #c2410c, #78350f)',
    'linear-gradient(135deg, #be185d, #831843)',
    'linear-gradient(135deg, #0f766e, #083344)'
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}

function computeAnalytics(books, sessions, annualGoal) {
  const currentYear = new Date().getFullYear();

  const totalBooks = books.length;
  const readingBooks = books.filter(b => b.status === SHELVES.READING);
  const boughtBooks = books.filter(b => b.status === SHELVES.BOUGHT);
  const wishlistBooks = books.filter(b => b.status === SHELVES.WISHLIST);
  const finishedBooks = books.filter(b => b.status === SHELVES.FINISHED);
  const dnfBooks = books.filter(b => b.status === SHELVES.DNF);

  const finishedThisYear = finishedBooks.filter(b => {
    if (!b.finishDate) return false;
    return new Date(b.finishDate).getFullYear() === currentYear;
  });

  const totalPagesRead = books.reduce((acc, book) => {
    if (book.status === SHELVES.FINISHED) return acc + (book.totalPages || 0);
    return acc + (book.currentPage || 0);
  }, 0);

  const ownedBooks = books.filter(b => b.status !== SHELVES.WISHLIST);
  const totalInvestment = ownedBooks.reduce((acc, b) => acc + (Number(b.price) || 0), 0);
  const unreadInvestment = boughtBooks.reduce((acc, b) => acc + (Number(b.price) || 0), 0);
  
  const tsundokuRatio = ownedBooks.length > 0 
    ? Math.round((boughtBooks.length / ownedBooks.length) * 100) 
    : 0;

  const ratedFinished = finishedBooks.filter(b => b.rating > 0);
  const avgRating = ratedFinished.length > 0
    ? (ratedFinished.reduce((acc, b) => acc + b.rating, 0) / ratedFinished.length).toFixed(1)
    : '—';

  const streak = calculateStreak(sessions);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSessions = sessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
  const recentPages = recentSessions.reduce((acc, s) => acc + (s.pagesRead || 0), 0);
  const pagesPerDay = Math.round(recentPages / 30);

  const genreCounts = {};
  books.forEach(b => {
    const g = b.genre || 'Other';
    genreCounts[g] = (genreCounts[g] || 0) + 1;
  });

  const formatCounts = {};
  books.forEach(b => {
    const f = b.format || 'Paperback';
    formatCounts[f] = (formatCounts[f] || 0) + 1;
  });

  const ratingsDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  finishedBooks.forEach(b => {
    const r = Math.round(b.rating);
    if (r >= 1 && r <= 5) {
      ratingsDistribution[r] += 1;
    }
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mIndex = d.getMonth();
    const y = d.getFullYear();
    const label = `${monthNames[mIndex]} ${y.toString().slice(-2)}`;

    const monthSessions = sessions.filter(s => {
      const sd = new Date(s.date);
      return sd.getMonth() === mIndex && sd.getFullYear() === y;
    });
    const pages = monthSessions.reduce((acc, s) => acc + (s.pagesRead || 0), 0);

    const booksFinished = finishedBooks.filter(b => {
      if (!b.finishDate) return false;
      const fd = new Date(b.finishDate);
      return fd.getMonth() === mIndex && fd.getFullYear() === y;
    }).length;

    const booksBought = books.filter(b => {
      if (!b.boughtDate) return false;
      const bd = new Date(b.boughtDate);
      return bd.getMonth() === mIndex && bd.getFullYear() === y;
    }).length;

    monthlyData.push({
      label,
      pages,
      booksFinished,
      booksBought
    });
  }

  return {
    totalBooks,
    readingCount: readingBooks.length,
    boughtCount: boughtBooks.length,
    wishlistCount: wishlistBooks.length,
    finishedCount: finishedBooks.length,
    dnfCount: dnfBooks.length,
    finishedThisYearCount: finishedThisYear.length,
    annualGoal,
    goalProgressPercent: Math.min(100, Math.round((finishedThisYear.length / (annualGoal || 1)) * 100)),
    totalPagesRead,
    totalInvestment: totalInvestment.toFixed(2),
    unreadInvestment: unreadInvestment.toFixed(2),
    tsundokuRatio,
    avgRating,
    streak,
    pagesPerDay,
    genreCounts,
    formatCounts,
    ratingsDistribution,
    monthlyData
  };
}

function calculateStreak(sessions) {
  if (!sessions || sessions.length === 0) return 0;

  const dateSet = new Set(sessions.filter(s => s.pagesRead > 0 || s.minutes > 0).map(s => s.date));
  const sortedDates = Array.from(dateSet).sort().reverse();

  if (sortedDates.length === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const mostRecent = sortedDates[0];
  if (mostRecent !== todayStr && mostRecent !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(mostRecent);

  for (let i = 0; i < sortedDates.length; i++) {
    const currentStr = sortedDates[i];
    const expectedStr = checkDate.toISOString().split('T')[0];

    if (currentStr === expectedStr) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
