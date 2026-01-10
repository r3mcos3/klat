import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import authRouter from '../apps/backend/src/routes/auth';
import notesRouter from '../apps/backend/src/routes/notes';
import tagsRouter from '../apps/backend/src/routes/tags';
import searchRouter from '../apps/backend/src/routes/search';
import imageRouter from '../apps/backend/src/routes/images';
import { errorHandler, notFoundHandler } from '../apps/backend/src/middleware/errorHandler';

const app = express();

// CORS - allow all origins in production (same domain)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/search', searchRouter);
app.use('/api/images', imageRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Export as serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  return app(req as any, res as any);
};
