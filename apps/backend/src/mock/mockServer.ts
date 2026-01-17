/**
 * Mock Server for Development
 *
 * A standalone Express server that provides mock API responses
 * without requiring a Supabase connection. Useful for frontend
 * development and testing.
 *
 * Run with: npm run mock:server (from apps/backend)
 * Or: npm run dev:mock (from root)
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { mockDataStore, MockNote, MockTag } from './mockData';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());

// Mock user ID (always authenticated in mock mode)
const MOCK_USER_ID = 'mock-user-1';

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[MOCK] ${req.method} ${req.path}`);
  next();
});

// ============================================
// AUTH ROUTES (simplified for mock)
// ============================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = mockDataStore.users.find(u => u.email === email && u.password === password);

  if (user) {
    res.json({
      data: {
        user: { id: user.id, email: user.email },
        session: { access_token: 'mock-token-12345' },
      },
      message: 'Ingelogd',
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const id = mockDataStore.generateId('user');
  mockDataStore.users.push({ id, email, password });

  res.status(201).json({
    data: {
      user: { id, email },
      session: { access_token: 'mock-token-12345' },
    },
    message: 'Geregistreerd',
  });
});

app.get('/api/auth/me', (_req: Request, res: Response) => {
  const user = mockDataStore.users[0];
  res.json({
    data: { id: user.id, email: user.email },
  });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Uitgelogd' });
});

// ============================================
// NOTES ROUTES
// ============================================

// Helper to transform note for response
const transformNote = (note: MockNote) => ({
  ...note,
  tags: note.tags || [],
});

// GET /api/notes - Get all notes or by month
app.get('/api/notes', (req: Request, res: Response) => {
  const { month } = req.query;
  let notes = mockDataStore.notes.filter(n => n.userId === MOCK_USER_ID);

  if (month) {
    const [year, monthNum] = (month as string).split('-').map(Number);
    notes = notes.filter(n => {
      const noteDate = new Date(n.date);
      return noteDate.getFullYear() === year && noteDate.getMonth() + 1 === monthNum;
    });
  }

  res.json({ data: notes.map(transformNote) });
});

// GET /api/notes/id/:id - Get note by ID
app.get('/api/notes/id/:id', (req: Request, res: Response) => {
  const note = mockDataStore.notes.find(n => n.id === req.params.id && n.userId === MOCK_USER_ID);

  if (note) {
    res.json({ data: transformNote(note) });
  } else {
    res.status(404).json({ error: 'Notitie niet gevonden' });
  }
});

// GET /api/notes/:date - Get notes by date
app.get('/api/notes/:date', (req: Request, res: Response) => {
  const notes = mockDataStore.notes.filter(
    n => n.date === req.params.date && n.userId === MOCK_USER_ID
  );
  res.json({ data: notes.map(transformNote) });
});

// POST /api/notes - Create note
app.post('/api/notes', (req: Request, res: Response) => {
  const { date, content, deadline, completedAt, inProgress, importance, tagIds } = req.body;
  const now = new Date().toISOString();

  const tags = tagIds
    ? mockDataStore.tags.filter((t: MockTag) => tagIds.includes(t.id))
    : [];

  const newNote: MockNote = {
    id: mockDataStore.generateId('note'),
    userId: MOCK_USER_ID,
    date,
    content: content || '',
    deadline: deadline || null,
    completedAt: completedAt || null,
    inProgress: inProgress || false,
    importance: importance || null,
    createdAt: now,
    updatedAt: now,
    tags,
  };

  mockDataStore.notes.push(newNote);
  res.status(201).json({ data: transformNote(newNote), message: 'Notitie aangemaakt' });
});

// PUT /api/notes/:id - Update note
app.put('/api/notes/:id', (req: Request, res: Response): void => {
  const noteIndex = mockDataStore.notes.findIndex(
    n => n.id === req.params.id && n.userId === MOCK_USER_ID
  );

  if (noteIndex === -1) {
    res.status(404).json({ error: 'Notitie niet gevonden' });
    return;
  }

  const { content, deadline, completedAt, inProgress, importance, tagIds } = req.body;
  const note = mockDataStore.notes[noteIndex];

  if (content !== undefined) note.content = content;
  if (deadline !== undefined) note.deadline = deadline || null;
  if (completedAt !== undefined) {
    note.completedAt = completedAt || null;
    if (completedAt) note.inProgress = false;
  }
  if (inProgress !== undefined) note.inProgress = inProgress;
  if (importance !== undefined) note.importance = importance || null;
  if (tagIds !== undefined) {
    note.tags = mockDataStore.tags.filter((t: MockTag) => tagIds.includes(t.id));
  }

  note.updatedAt = new Date().toISOString();

  res.json({ data: transformNote(note), message: 'Notitie bijgewerkt' });
});

// DELETE /api/notes/completed/all - Delete all completed notes
app.delete('/api/notes/completed/all', (_req: Request, res: Response) => {
  const completedNotes = mockDataStore.notes.filter(
    n => n.userId === MOCK_USER_ID && n.completedAt
  );
  const deletedCount = completedNotes.length;

  mockDataStore.notes = mockDataStore.notes.filter(
    n => !(n.userId === MOCK_USER_ID && n.completedAt)
  );

  res.json({ message: 'Voltooide notities verwijderd', deletedCount });
});

// DELETE /api/notes/:id - Delete note
app.delete('/api/notes/:id', (req: Request, res: Response): void => {
  const noteIndex = mockDataStore.notes.findIndex(
    n => n.id === req.params.id && n.userId === MOCK_USER_ID
  );

  if (noteIndex === -1) {
    res.status(404).json({ error: 'Notitie niet gevonden' });
    return;
  }

  mockDataStore.notes.splice(noteIndex, 1);
  res.json({ message: 'Notitie verwijderd' });
});

// ============================================
// TAGS ROUTES
// ============================================

// GET /api/tags - Get all tags with note counts
app.get('/api/tags', (_req: Request, res: Response) => {
  const tags = mockDataStore.tags
    .filter(t => t.userId === MOCK_USER_ID)
    .map(tag => ({
      ...tag,
      _count: {
        notes: mockDataStore.notes.filter(
          n => n.userId === MOCK_USER_ID && n.tags.some(t => t.id === tag.id)
        ).length,
      },
    }));

  res.json({ data: tags });
});

// POST /api/tags - Create tag
app.post('/api/tags', (req: Request, res: Response): void => {
  const { name, color } = req.body;
  const now = new Date().toISOString();

  // Check for duplicate name
  const existing = mockDataStore.tags.find(
    t => t.userId === MOCK_USER_ID && t.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) {
    res.status(400).json({ error: 'Tag bestaat al' });
    return;
  }

  const newTag: MockTag = {
    id: mockDataStore.generateId('tag'),
    userId: MOCK_USER_ID,
    name,
    color: color || '#6366F1',
    createdAt: now,
    updatedAt: now,
  };

  mockDataStore.tags.push(newTag);
  res.status(201).json({ data: { ...newTag, _count: { notes: 0 } }, message: 'Tag aangemaakt' });
});

// PUT /api/tags/:id - Update tag
app.put('/api/tags/:id', (req: Request, res: Response): void => {
  const tagIndex = mockDataStore.tags.findIndex(
    t => t.id === req.params.id && t.userId === MOCK_USER_ID
  );

  if (tagIndex === -1) {
    res.status(404).json({ error: 'Tag niet gevonden' });
    return;
  }

  const { name, color } = req.body;
  const tag = mockDataStore.tags[tagIndex];

  if (name !== undefined) tag.name = name;
  if (color !== undefined) tag.color = color;
  tag.updatedAt = new Date().toISOString();

  // Also update tag references in notes
  mockDataStore.notes.forEach(note => {
    const noteTagIndex = note.tags.findIndex(t => t.id === tag.id);
    if (noteTagIndex !== -1) {
      note.tags[noteTagIndex] = { ...tag };
    }
  });

  const noteCount = mockDataStore.notes.filter(
    n => n.userId === MOCK_USER_ID && n.tags.some(t => t.id === tag.id)
  ).length;

  res.json({ data: { ...tag, _count: { notes: noteCount } }, message: 'Tag bijgewerkt' });
});

// DELETE /api/tags/:id - Delete tag
app.delete('/api/tags/:id', (req: Request, res: Response): void => {
  const tagIndex = mockDataStore.tags.findIndex(
    t => t.id === req.params.id && t.userId === MOCK_USER_ID
  );

  if (tagIndex === -1) {
    res.status(404).json({ error: 'Tag niet gevonden' });
    return;
  }

  // Check if tag is in use
  const inUse = mockDataStore.notes.some(
    n => n.userId === MOCK_USER_ID && n.tags.some(t => t.id === req.params.id)
  );

  if (inUse) {
    res.status(400).json({ error: 'Tag is in gebruik' });
    return;
  }

  mockDataStore.tags.splice(tagIndex, 1);
  res.json({ message: 'Tag verwijderd' });
});

// ============================================
// SEARCH ROUTES
// ============================================

app.get('/api/search', (req: Request, res: Response) => {
  const { q, tags, startDate, endDate } = req.query;

  let notes = mockDataStore.notes.filter(n => n.userId === MOCK_USER_ID);

  // Filter by search query
  if (q) {
    const query = (q as string).toLowerCase();
    notes = notes.filter(n => n.content.toLowerCase().includes(query));
  }

  // Filter by tags
  if (tags) {
    const tagNames = (tags as string).split(',').map(t => t.toLowerCase());
    notes = notes.filter(n =>
      n.tags.some(t => tagNames.includes(t.name.toLowerCase()))
    );
  }

  // Filter by date range
  if (startDate) {
    notes = notes.filter(n => n.date >= (startDate as string));
  }
  if (endDate) {
    notes = notes.filter(n => n.date <= (endDate as string));
  }

  res.json({ data: notes.map(transformNote) });
});

// ============================================
// IMAGES ROUTES (mock - no actual storage)
// ============================================

app.post('/api/images/upload', (_req: Request, res: Response) => {
  // Mock image upload - return a placeholder URL
  const mockImageId = mockDataStore.generateId('img');
  res.json({
    data: {
      url: `https://picsum.photos/seed/${mockImageId}/800/600`,
      id: mockImageId,
    },
    message: 'Image uploaded (mock)',
  });
});

app.get('/api/images/:id', (req: Request, res: Response) => {
  // Redirect to placeholder image
  res.redirect(`https://picsum.photos/seed/${req.params.id}/800/600`);
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    mode: 'mock',
    timestamp: new Date().toISOString(),
    data: {
      notes: mockDataStore.notes.length,
      tags: mockDataStore.tags.length,
      users: mockDataStore.users.length,
    },
  });
});

// Reset mock data endpoint (for testing)
app.post('/api/mock/reset', (_req: Request, res: Response) => {
  mockDataStore.reset();
  res.json({ message: 'Mock data reset to initial state' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[MOCK ERROR]', err);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                    MOCK SERVER                         ║
╠════════════════════════════════════════════════════════╣
║  🚀 Running on port ${PORT}                              ║
║  📍 Mode: MOCK (no database connection)                ║
║                                                        ║
║  📊 Initial Data:                                      ║
║     - ${mockDataStore.notes.length} notes                                       ║
║     - ${mockDataStore.tags.length} tags                                        ║
║     - ${mockDataStore.users.length} user(s)                                     ║
║                                                        ║
║  🔐 Login credentials:                                 ║
║     Email: demo@example.com                            ║
║     Password: demo123                                  ║
║                                                        ║
║  🏥 Health: http://localhost:${PORT}/health              ║
║  📡 API: http://localhost:${PORT}/api                    ║
║                                                        ║
║  🔄 Reset data: POST /api/mock/reset                   ║
╚════════════════════════════════════════════════════════╝
  `);
});
