import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { bookRouter } from './routes/books.js';
import { sessionRouter } from './routes/sessions.js';
import { settingsRouter } from './routes/settings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lumina_read';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

// Security & Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allow loading covers from external domains (Unsplash, etc.)
}));
app.use(cors({
  origin: CLIENT_ORIGIN === '*' ? '*' : CLIENT_ORIGIN.split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api/books', bookRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/settings', settingsRouter);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Lumina Read API is running. Access endpoints via /api/health, /api/books, etc.');
});

// Connect to MongoDB Atlas & start server
async function startServer() {
  try {
    if (MONGODB_URI) {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB Atlas successfully!');
    } else {
      console.warn('⚠️ No MONGODB_URI provided in environment variables.');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Lumina Read Server is running on port ${PORT}`);
      console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
    console.log('Starting server in fallback mode (ready once MongoDB credentials are configured)...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Lumina Read Server running on port ${PORT} (Database pending connection)`);
    });
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await mongoose.connection.close();
  process.exit(0);
});
