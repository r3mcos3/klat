import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import notesRouter from './routes/notes';
import tagsRouter from './routes/tags';
import searchRouter from './routes/search';

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
