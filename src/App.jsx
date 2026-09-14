import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BookProvider, useBooks } from './context/BookContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { BookList } from './components/BookList';
import { BookModal } from './components/BookModal';
import { ProgressModal } from './components/ProgressModal';
import { BookDetailModal } from './components/BookDetailModal';
import { ReadingTimer } from './components/ReadingTimer';

function AppContent() {
  const { currentView, celebrationEvent, setCelebrationEvent, logProgress } = useBooks();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [progressBook, setProgressBook] = useState(null);

  // Trigger celebratory confetti on finishing a book
  useEffect(() => {
    if (celebrationEvent) {
      confetti({
        particleCount: 110,
        spread: 70,
        origin: { y: 0.65 }
      });
      // Clear event after firing
      const timer = setTimeout(() => {
        setCelebrationEvent(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [celebrationEvent, setCelebrationEvent]);

  const handleQuickProgress = (bookId, pagesToAdd) => {
    logProgress(bookId, pagesToAdd, false, Math.round(pagesToAdd * 1.3), `Quick +${pagesToAdd} pages`);
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Workspace */}
      <div className="main-wrapper">
        <Header 
          onOpenAddModal={() => { setEditingBook(null); setIsAddModalOpen(true); }}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        <main className="content-body">
          {currentView === 'dashboard' ? (
            <DashboardView
              onOpenAddModal={() => { setEditingBook(null); setIsAddModalOpen(true); }}
              onQuickProgress={handleQuickProgress}
              onSelectBook={(book) => setSelectedBook(book)}
            />
          ) : (
            <BookList
              onOpenAddModal={() => { setEditingBook(null); setIsAddModalOpen(true); }}
              onEditBook={(book) => setEditingBook(book)}
              onSelectBook={(book) => setSelectedBook(book)}
              onQuickProgress={handleQuickProgress}
            />
          )}
        </main>
      </div>

      {/* Floating Reading Stopwatch */}
      <ReadingTimer />

      {/* Add / Edit Book Modal */}
      {(isAddModalOpen || editingBook) && (
        <BookModal
          isOpen={isAddModalOpen || Boolean(editingBook)}
          initialData={editingBook}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingBook(null);
          }}
        />
      )}

      {/* Quick Progress / Session Logger Modal */}
      {progressBook && (
        <ProgressModal
          isOpen={Boolean(progressBook)}
          book={progressBook}
          onClose={() => setProgressBook(null)}
        />
      )}

      {/* Book Detailed Editorial View Modal */}
      {selectedBook && (
        <BookDetailModal
          isOpen={Boolean(selectedBook)}
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onEdit={(book) => setEditingBook(book)}
          onOpenProgress={(book) => setProgressBook(book)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BookProvider>
      <AppContent />
    </BookProvider>
  );
}
