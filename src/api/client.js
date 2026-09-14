/**
 * Unified API Client for Lumina Read Backend & MongoDB Atlas
 */

const API_BASE = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api'
);

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed request to ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Health & connection status
  checkHealth: () => request('/health'),

  // Books
  getBooks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.genre && params.genre !== 'All') query.set('genre', params.genre);
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);
    const qs = query.toString();
    return request(`/books${qs ? `?${qs}` : ''}`);
  },

  getBook: (id) => request(`/books/${id}`),

  createBook: (bookData) => request('/books', {
    method: 'POST',
    body: JSON.stringify(bookData)
  }),

  updateBook: (id, bookData) => request(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookData)
  }),

  deleteBook: (id) => request(`/books/${id}`, {
    method: 'DELETE'
  }),

  moveShelf: (id, status) => request(`/books/${id}/shelf`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  logProgress: (id, { newCurrentPage, pagesAdded, minutes, notes }) => request(`/books/${id}/progress`, {
    method: 'POST',
    body: JSON.stringify({ newCurrentPage, pagesAdded, minutes, notes })
  }),

  seedBooks: (books, sessions) => request('/books/seed', {
    method: 'POST',
    body: JSON.stringify({ books, sessions })
  }),

  clearAllBooks: () => request('/books/clear', {
    method: 'POST'
  }),

  // Reading Sessions
  getSessions: (limit = 50) => request(`/sessions?limit=${limit}`),

  createSession: (sessionData) => request('/sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData)
  }),

  deleteSession: (id) => request(`/sessions/${id}`, {
    method: 'DELETE'
  }),

  // Settings
  getSettings: () => request('/settings'),

  updateSettings: (settingsData) => request('/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData)
  })
};
