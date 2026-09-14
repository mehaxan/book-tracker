import express from 'express';
import { Book } from '../models/Book.js';
import { ReadingSession } from '../models/ReadingSession.js';

export const bookRouter = express.Router();

// GET all books with optional filtering
bookRouter.get('/', async (req, res) => {
  try {
    const { status, genre, search, sort } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (genre && genre !== 'All') {
      filter.genre = genre;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { favoriteQuote: { $regex: search, $options: 'i' } },
        { review: { $regex: search, $options: 'i' } }
      ];
    }

    let query = Book.find(filter);

    if (sort === 'rating') {
      query = query.sort({ rating: -1 });
    } else if (sort === 'title') {
      query = query.sort({ title: 1 });
    } else if (sort === 'pages') {
      query = query.sort({ totalPages: -1 });
    } else if (sort === 'price') {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ updatedAt: -1 });
    }

    const books = await query.exec();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books', message: err.message });
  }
});

// GET single book
bookRouter.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch book', message: err.message });
  }
});

// CREATE book
bookRouter.post('/', async (req, res) => {
  try {
    const bookData = { ...req.body };
    const today = new Date().toISOString().split('T')[0];

    if (bookData.status === 'reading' && !bookData.startDate) {
      bookData.startDate = today;
    }
    if (bookData.status === 'bought' && !bookData.boughtDate) {
      bookData.boughtDate = today;
    }
    if (bookData.status === 'finished') {
      if (!bookData.finishDate) bookData.finishDate = today;
      bookData.currentPage = bookData.totalPages;
    }

    const book = new Book(bookData);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create book', message: err.message });
  }
});

// UPDATE book
bookRouter.put('/:id', async (req, res) => {
  try {
    const update = { ...req.body };

    // Auto-mark finished
    if (update.totalPages && update.currentPage >= update.totalPages) {
      update.status = 'finished';
      update.currentPage = update.totalPages;
      if (!update.finishDate) {
        update.finishDate = new Date().toISOString().split('T')[0];
      }
    }

    const book = await Book.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update book', message: err.message });
  }
});

// DELETE book
bookRouter.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    // Clean up associated reading sessions
    await ReadingSession.deleteMany({ bookId: req.params.id });

    res.json({ message: 'Book and associated sessions deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book', message: err.message });
  }
});

// MOVE shelf
bookRouter.patch('/:id/shelf', async (req, res) => {
  try {
    const { status } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const today = new Date().toISOString().split('T')[0];
    book.status = status;

    if (status === 'bought' && !book.boughtDate) {
      book.boughtDate = today;
    } else if (status === 'reading') {
      if (!book.startDate) book.startDate = today;
      if (!book.boughtDate) book.boughtDate = today;
    } else if (status === 'finished') {
      if (!book.finishDate) book.finishDate = today;
      book.currentPage = book.totalPages;
    }

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update shelf', message: err.message });
  }
});

// LOG progress + auto session creation
bookRouter.post('/:id/progress', async (req, res) => {
  try {
    const { newCurrentPage, pagesAdded, minutes, notes } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const oldPage = book.currentPage || 0;
    let targetPage = oldPage;

    if (newCurrentPage !== undefined) {
      targetPage = Math.min(book.totalPages, Math.max(0, Number(newCurrentPage)));
    } else if (pagesAdded !== undefined) {
      targetPage = Math.min(book.totalPages, Math.max(0, oldPage + Number(pagesAdded)));
    }

    const delta = targetPage - oldPage;
    book.currentPage = targetPage;

    let finished = false;
    if (book.currentPage >= book.totalPages && book.status !== 'finished') {
      book.status = 'finished';
      book.currentPage = book.totalPages;
      if (!book.finishDate) book.finishDate = new Date().toISOString().split('T')[0];
      finished = true;
    }

    await book.save();

    // Create session if pages were advanced or minutes logged
    let session = null;
    if (delta > 0 || (minutes && minutes > 0)) {
      session = new ReadingSession({
        bookId: book._id,
        bookTitle: book.title,
        date: new Date().toISOString().split('T')[0],
        pagesRead: Math.max(0, delta),
        minutes: Number(minutes) || Math.round(Math.max(1, delta * 1.2)),
        notes: notes || `Advanced to page ${targetPage}`
      });
      await session.save();
    }

    res.json({ book, session, finished });
  } catch (err) {
    res.status(400).json({ error: 'Failed to record progress', message: err.message });
  }
});

// SEED demo books & sessions
bookRouter.post('/seed', async (req, res) => {
  try {
    const { books, sessions } = req.body;
    if (!books || !Array.isArray(books)) {
      return res.status(400).json({ error: 'Books array is required for seeding' });
    }

    await Book.deleteMany({});
    await ReadingSession.deleteMany({});

    // Clean up IDs so Mongoose creates fresh ObjectIds
    const cleanedBooks = books.map(b => {
      const copy = { ...b };
      delete copy.id;
      delete copy._id;
      return copy;
    });

    const insertedBooks = await Book.insertMany(cleanedBooks);

    if (sessions && Array.isArray(sessions)) {
      const cleanedSessions = sessions.map(s => {
        const copy = { ...s };
        delete copy.id;
        delete copy._id;
        // Optionally map bookId if matching by title
        return copy;
      });
      await ReadingSession.insertMany(cleanedSessions);
    }

    res.json({ message: 'Seeded successfully', count: insertedBooks.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed database', message: err.message });
  }
});

// CLEAR library
bookRouter.post('/clear', async (req, res) => {
  try {
    await Book.deleteMany({});
    await ReadingSession.deleteMany({});
    res.json({ message: 'Database cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear database', message: err.message });
  }
});
