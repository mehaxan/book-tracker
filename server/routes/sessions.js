import express from 'express';
import { ReadingSession } from '../models/ReadingSession.js';

export const sessionRouter = express.Router();

// GET all sessions
sessionRouter.get('/', async (req, res) => {
  try {
    const { limit = 50, bookId } = req.query;
    const filter = {};
    if (bookId) filter.bookId = bookId;

    const sessions = await ReadingSession.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit))
      .exec();

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions', message: err.message });
  }
});

// CREATE session
sessionRouter.post('/', async (req, res) => {
  try {
    const session = new ReadingSession(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create session', message: err.message });
  }
});

// DELETE session
sessionRouter.delete('/:id', async (req, res) => {
  try {
    const session = await ReadingSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ message: 'Session deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete session', message: err.message });
  }
});
