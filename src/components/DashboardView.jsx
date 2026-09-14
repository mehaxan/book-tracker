import React from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import { 
  Flame, 
  BookOpen, 
  BookMarked, 
  Trophy, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Clock, 
  Library, 
  Compass, 
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Heart
} from 'lucide-react';
import { useBooks } from '../context/BookContext';
import { SHELVES } from '../data/initialBooks';

ChartJS.register(...registerables);

export function DashboardView({ onOpenAddModal, onQuickProgress, onSelectBook }) {
  const { books, sessions, analytics, setCurrentView, theme } = useBooks();

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#57534e';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

  // Currently reading books for spotlight
  const readingBooks = books.filter(b => b.status === SHELVES.READING);

  // 1. Monthly Reading Velocity Chart Data
  const monthlyLabels = analytics.monthlyData.map(d => d.label);
  const monthlyPagesData = analytics.monthlyData.map(d => d.pages);
  const monthlyBooksFinished = analytics.monthlyData.map(d => d.booksFinished);

  const velocityChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        type: 'bar',
        label: 'Pages Read',
        data: monthlyPagesData,
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.7)' : 'rgba(180, 83, 9, 0.7)',
        borderRadius: 8,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: 'Books Finished',
        data: monthlyBooksFinished,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
        borderWidth: 3,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
        yAxisID: 'y1'
      }
    ]
  };

  const velocityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: textColor, font: { family: 'Outfit', size: 12 } }
      },
      tooltip: {
        backgroundColor: isDark ? '#161e30' : '#ffffff',
        titleColor: isDark ? '#f1f5f9' : '#1f2937',
        bodyColor: isDark ? '#94a3b8' : '#4b5563',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Outfit', size: 11 } }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Outfit', size: 11 } },
        title: { display: true, text: 'Pages', color: textColor, font: { size: 11 } }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#10b981', stepSize: 1, font: { family: 'Outfit', size: 11 } },
        title: { display: true, text: 'Books Finished', color: '#10b981', font: { size: 11 } }
      }
    }
  };

  // 2. Shelf Distribution Doughnut
  const shelfChartData = {
    labels: ['Wishlist', 'Bought / Owned', 'Currently Reading', 'Finished'],
    datasets: [
      {
        data: [
          analytics.wishlistCount,
          analytics.boughtCount,
          analytics.readingCount,
          analytics.finishedCount
        ],
        backgroundColor: [
          '#f59e0b', // Wishlist (amber)
          '#10b981', // Bought (emerald)
          '#6366f1', // Reading (indigo)
          '#a855f7'  // Finished (purple)
        ],
        borderWidth: 0
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          color: textColor, 
          boxWidth: 12, 
          font: { family: 'Outfit', size: 11 },
          padding: 14 
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#161e30' : '#ffffff',
        titleColor: isDark ? '#f1f5f9' : '#1f2937',
        bodyColor: isDark ? '#94a3b8' : '#4b5563',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      }
    },
    cutout: '72%'
  };

  // 3. Genre Distribution Data
  const genreLabels = Object.keys(analytics.genreCounts);
  const genreData = Object.values(analytics.genreCounts);
  const genreChartData = {
    labels: genreLabels,
    datasets: [
      {
        data: genreData,
        backgroundColor: [
          '#6366f1', '#3b82f6', '#06b6d4', '#10b981', 
          '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'
        ],
        borderWidth: 0
      }
    ]
  };

  // 4. Ratings Histogram
  const ratingChartData = {
    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
    datasets: [
      {
        label: 'Books',
        data: [
          analytics.ratingsDistribution[5] || 0,
          analytics.ratingsDistribution[4] || 0,
          analytics.ratingsDistribution[3] || 0,
          analytics.ratingsDistribution[2] || 0,
          analytics.ratingsDistribution[1] || 0
        ],
        backgroundColor: '#f59e0b',
        borderRadius: 6
      }
    ]
  };

  const ratingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { stepSize: 1, color: textColor }
      },
      y: {
        grid: { display: false },
        ticks: { color: textColor }
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Hero Welcome */}
      <div className="dashboard-hero">
        <div className="hero-title">
          <h2>Reading Intelligence &amp; Analytics</h2>
          <p>Real-time insights across your library, reading velocity, and book investments.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {analytics.streak > 0 && (
            <div className="reading-streak-badge">
              <Flame size={18} />
              <span>{analytics.streak} Day Reading Streak!</span>
            </div>
          )}
          <button className="btn-secondary" onClick={() => setCurrentView(SHELVES.READING)}>
            <BookOpen size={16} />
            <span>Active Books</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="kpi-grid">
        {/* Streak */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Current Streak</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)' }}>
              <Flame size={20} />
            </div>
          </div>
          <div className="kpi-value">{analytics.streak} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>days</span></div>
          <div className="kpi-subtext">
            <span>Keep your daily reading momentum active</span>
          </div>
        </div>

        {/* Total Pages */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Pages Read</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value">{analytics.totalPagesRead.toLocaleString()}</div>
          <div className="kpi-subtext">
            <span className="highlight">~{analytics.pagesPerDay} pages/day</span>
            <span>over last 30 days</span>
          </div>
        </div>

        {/* Annual Challenge */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Annual Challenge</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)' }}>
              <Trophy size={20} />
            </div>
          </div>
          <div className="kpi-value">{analytics.finishedThisYearCount} <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>/ {analytics.annualGoal}</span></div>
          <div className="kpi-subtext">
            <span className="highlight">{analytics.goalProgressPercent}% completed</span>
            <span>in {new Date().getFullYear()}</span>
          </div>
        </div>

        {/* Bought Unread / Tsundoku */}
        <div className="kpi-card" onClick={() => setCurrentView(SHELVES.BOUGHT)} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Unread Owned (TBR)</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="kpi-value">{analytics.boughtCount} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>books</span></div>
          <div className="kpi-subtext">
            <span className="highlight">৳{analytics.unreadInvestment}</span>
            <span>waiting to be read ({analytics.tsundokuRatio}% of owned)</span>
          </div>
        </div>

        {/* Total Book Investment */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Investment</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--purple)', fontSize: '1.2rem', fontWeight: 800 }}>
              ৳
            </div>
          </div>
          <div className="kpi-value">৳{analytics.totalInvestment}</div>
          <div className="kpi-subtext">
            <span>Across all owned &amp; read books</span>
          </div>
        </div>

        {/* Average Rating */}
        <div className="kpi-card" onClick={() => setCurrentView(SHELVES.FINISHED)} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Average Rating</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)' }}>
              <Star size={20} />
            </div>
          </div>
          <div className="kpi-value">{analytics.avgRating} <span style={{ fontSize: '1.1rem', color: 'var(--amber)' }}>★</span></div>
          <div className="kpi-subtext">
            <span>Across {analytics.finishedCount} completed reads</span>
          </div>
        </div>
      </div>

      {/* Currently Reading Spotlight */}
      {readingBooks.length > 0 && (
        <div className="spotlight-section">
          <div className="section-header-row">
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="var(--primary)" />
              Currently Reading Spotlight
            </h3>
            <button 
              className="btn-secondary" 
              style={{ height: '34px', fontSize: '0.8rem' }}
              onClick={() => setCurrentView(SHELVES.READING)}
            >
              <span>View All ({readingBooks.length})</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="spotlight-cards-grid">
            {readingBooks.map(book => {
              const pct = Math.min(100, Math.round(((book.currentPage || 0) / (book.totalPages || 1)) * 100));
              return (
                <div key={book.id} className="book-card" style={{ flexDirection: 'row', height: '180px' }}>
                  <div style={{ width: '130px', height: '100%', position: 'relative', flexShrink: 0 }}>
                    {book.cover ? (
                      <img src={book.cover} alt={book.title} className="book-cover-img" />
                    ) : (
                      <div className="book-fallback-cover" style={{ background: book.gradient }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{book.title}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 className="book-title" style={{ fontSize: '1rem', cursor: 'pointer' }} onClick={() => onSelectBook(book)}>
                          {book.title}
                        </h4>
                        <span className="book-genre-pill">{book.genre}</span>
                      </div>
                      <p className="book-author" style={{ fontSize: '0.8rem', marginTop: '2px' }}>{book.author}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>p. {book.currentPage} of {book.totalPages}</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{pct}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <button 
                          className="btn-step" 
                          onClick={() => onQuickProgress(book.id, 10)} 
                          title="Read 10 pages"
                        >
                          +10p
                        </button>
                        <button 
                          className="btn-step" 
                          onClick={() => onQuickProgress(book.id, 25)} 
                          title="Read 25 pages"
                        >
                          +25p
                        </button>
                        <button 
                          className="btn-step" 
                          style={{ background: 'var(--primary)', color: '#fff' }}
                          onClick={() => onSelectBook(book)}
                          title="Open details / session log"
                        >
                          Log
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Charts Row */}
      <div className="charts-grid-main">
        {/* Velocity Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Reading Velocity &amp; Monthly Volume</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pages consumed and books finished over the last 6 months</p>
            </div>
            <span className="chart-badge">Pace Analytics</span>
          </div>
          <div className="chart-canvas-wrapper">
            <Bar data={velocityChartData} options={velocityChartOptions} />
          </div>
        </div>

        {/* Shelf Balance / Status Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Library Shelf Balance</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Distribution across reading lifecycle</p>
            </div>
            <span className="chart-badge">{analytics.totalBooks} Total</span>
          </div>
          <div className="chart-canvas-wrapper" style={{ position: 'relative' }}>
            <Doughnut data={shelfChartData} options={doughnutOptions} />
            <div style={{
              position: 'absolute',
              top: '42%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {analytics.totalBooks}
              </span>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tracked
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="charts-grid-secondary">
        {/* Genre Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Genre Diversity</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>What you read the most</p>
            </div>
            <Compass size={18} color="var(--primary)" />
          </div>
          <div className="chart-canvas-wrapper">
            <Doughnut data={genreChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Ratings Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Ratings Breakdown</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scores assigned to finished books</p>
            </div>
            <Star size={18} color="var(--amber)" />
          </div>
          <div className="chart-canvas-wrapper">
            <Bar data={ratingChartData} options={ratingChartOptions} />
          </div>
        </div>

        {/* Recent Reading Sessions */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Recent Reading Sessions</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Latest deep-focus reading activity</p>
            </div>
            <Clock size={18} color="var(--emerald)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '280px' }}>
            {sessions.slice(0, 5).map(session => {
              const book = books.find(b => b.id === session.bookId);
              return (
                <div 
                  key={session.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {book ? book.title : 'General Session'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {session.date} • {session.minutes} mins • {session.notes || 'Progress update'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--emerald)' }}>
                      +{session.pagesRead}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>pages</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
