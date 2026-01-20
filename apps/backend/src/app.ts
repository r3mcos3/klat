import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import notesRouter from './routes/notes';
import tagsRouter from './routes/tags';
import searchRouter from './routes/search';
import imageRouter from './routes/images';
import preferencesRouter from './routes/preferences';

const app = express();

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://klat.13-home.org',
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.get('/api', (_req, res) => {
  res.json({
    message: 'klat API',
    version: '0.1.0',
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/search', searchRouter);
app.use('/api/images', imageRouter);
app.use('/api/preferences', preferencesRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
