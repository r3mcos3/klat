# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Klat is a calendar-style notepad webapp where users can write one note per day. Notes support Markdown, auto-save, tags (including automatic tag creation from hashtags), and full-text search.

**Tech Stack:**
- **Monorepo** with npm workspaces
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + React Query + Zustand
- **Backend:** Node.js + Express + TypeScript + Supabase Client Library
- **Database:** Supabase (PostgreSQL)
- **Validation:** Zod (backend), TypeScript (frontend)

## Development Commands

### Running the Application

```bash
# Start both frontend (5173) and backend (3001)
npm run dev

# Start individually
npm run backend:dev   # Backend only on :3001
npm run frontend:dev  # Frontend only on :5173
```

### Database Operations

**Important:** All database commands must be run from `apps/backend/`:

```bash
cd apps/backend

# Run migrations (development)
npm run migrate

# Deploy migrations (production)
npm run migrate:deploy

# Regenerate Prisma client after schema changes
npm run prisma:generate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### Code Quality

```bash
# Lint all workspaces
npm run lint

# Format with Prettier
npm run format

# Build for production
npm run build
```

## Architecture & Key Patterns

### Monorepo Structure

```
klat/
├── apps/
│   ├── backend/          # Express API
│   │   ├── src/
│   │   │   ├── config/   # Database & Supabase client setup
│   │   │   ├── controllers/  # Request handlers
│   │   │   ├── routes/   # Express route definitions
│   │   │   ├── services/ # Business logic (NOTE: Uses Supabase client, NOT Prisma)
│   │   │   ├── middleware/  # Error handling, validation
│   │   │   └── types/    # Zod validation schemas
│   │   └── prisma/       # Database schema (for reference only)
│   └── frontend/
│       ├── src/
│       │   ├── components/  # Reusable UI components
│       │   ├── pages/       # Route pages (DayView, CalendarView, etc.)
│       │   ├── hooks/       # React Query hooks, custom hooks
│       │   ├── services/    # API client (axios)
│       │   └── utils/       # Date helpers, etc.
└── packages/
    └── types/            # Shared TypeScript types between frontend/backend
```

### Critical Architecture Notes

**1. Database Access Pattern:**
- The backend **uses Supabase Client Library** (`@supabase/supabase-js`), **NOT Prisma Client**
- Prisma schema exists for documentation and potential future migrations only
- All CRUD operations are in `apps/backend/src/services/` using `supabase` from `config/supabase.ts`
- Database tables are directly accessed via Supabase API (`.from('notes')`, `.from('tags')`, etc.)

**2. Service Layer Pattern:**
- Services in `apps/backend/src/services/` contain all database logic
- Controllers are thin wrappers that call services
- Services use Supabase queries like:
  ```typescript
  const { data, error } = await supabase
    .from('notes')
    .select('*, tags:_NoteToTag(tag:tags(*))')
    .eq('date', date);
  ```

**3. Frontend State Management:**
- **Server state:** React Query (`@tanstack/react-query`)
  - All API calls go through hooks in `src/hooks/useNotes.ts`, `src/hooks/useTags.ts`
  - Automatic cache invalidation after mutations
  - Optimistic updates for better UX
- **Client state:** Zustand (currently minimal usage)
- **Form state:** React `useState`

**4. Auto-Save Implementation:**
- 30-second debounce interval (configurable in `MarkdownEditor.tsx`)
- Custom `useAutoSave` hook with duplicate save prevention
- Concurrent save protection via `isSaving` ref
- Manual "Opslaan" button for immediate saves

**5. Hashtag → Tag Conversion:**
- DayView extracts hashtags from note content with regex `/#(\w+)/g`
- On save, hashtags are converted to tags automatically
- Each new tag gets a unique color from predefined palette (10 colors)
- Color selection tracks usage within same operation to prevent duplicates
- React Query cache is invalidated after tag creation

### Database Schema

**Notes Table:**
- One note per day (unique constraint on `date`)
- Stores Markdown content
- Many-to-many relationship with tags via `_NoteToTag` junction table

**Tags Table:**
- Unique tag names
- Optional hex color for UI display
- Many-to-many relationship with notes

**Junction Table: `_NoteToTag`**
- Column A: Note ID
- Column B: Tag ID

### API Endpoints

**Notes:**
- `POST /api/notes` - Create note (date, content, tagIds)
- `GET /api/notes/:date` - Get note by date (YYYY-MM-DD)
- `GET /api/notes?month=YYYY-MM` - Get all notes for month
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

**Tags:**
- `GET /api/tags` - Get all tags with note counts
- `POST /api/tags` - Create tag (name, color)
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag (fails if in use)

**Search:**
- `GET /api/search?q=query&tags=tag1,tag2&startDate=&endDate=` - Search notes

### Frontend Routing

- `/calendar` - Month view with note previews
- `/day/:date` - Single day view with editor (format: YYYY-MM-DD)
- `/tags` - Tag management
- `/search` - Search interface

### Environment Variables

**Backend (`apps/backend/.env`):**
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Note:** `DATABASE_URL` and `DIRECT_URL` exist in `.env` but are **not used** by the application (legacy from Prisma setup). The app uses `SUPABASE_URL` and `SUPABASE_ANON_KEY` instead.

## Important Implementation Details

### Custom Components

**ConfirmDialog** (`components/Common/ConfirmDialog.tsx`):
- Custom styled confirmation dialog (replaces browser alerts)
- Used for delete confirmations
- Props: `isOpen`, `title`, `message`, `onConfirm`, `onCancel`, `danger`

**MarkdownEditor** (`components/NoteEditor/MarkdownEditor.tsx`):
- Uses `@uiw/react-md-editor`
- 30-second auto-save with manual save button
- Processes hashtags on save
- Shows save status indicator

**DayCell** (`components/Calendar/DayCell.tsx`):
- Shows note content preview (first 60 chars, markdown stripped)
- Displays first 2 tags
- Blue indicator removed (replaced with content preview)

### Tag Color Palette

10 predefined colors in `DayView.tsx`:
```typescript
const TAG_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#84CC16'
];
```

### Date Handling

- Backend stores dates as ISO timestamps
- Frontend displays with `date-fns` formatting
- Date normalization happens in `MonthView` (strips time from ISO string)
- One note per day enforced by unique constraint

### Error Handling

- Backend uses custom `AppError` class with `statusCode` and `isOperational`
- Global error handler middleware in `middleware/errorHandler.ts`
- Frontend shows error states via React Query's error handling

## Common Development Tasks

### Adding a New API Endpoint

1. Define Zod schema in `apps/backend/src/types/validation.ts`
2. Create service method in appropriate service file (uses Supabase client)
3. Create controller in `apps/backend/src/controllers/`
4. Add route in `apps/backend/src/routes/`
5. Create React Query hook in `apps/frontend/src/hooks/`
6. Add API method in `apps/frontend/src/services/`

### Modifying Database Schema

**Note:** Prisma migrations are not currently used. Schema changes must be made directly in Supabase:

1. Update `apps/backend/prisma/schema.prisma` (for documentation)
2. Create SQL migration in Supabase dashboard
3. Update service methods to reflect new schema
4. Update TypeScript types in `packages/types/`

### Working with the Supabase Client

The Supabase client is initialized in `apps/backend/src/config/supabase.ts`:

```typescript
import { supabase } from '../config/supabase';

// Query example
const { data, error } = await supabase
  .from('notes')
  .select('*')
  .eq('id', noteId);

// Insert example
const { data, error } = await supabase
  .from('notes')
  .insert({ id, date, content })
  .select()
  .single();

// Update example
const { data, error } = await supabase
  .from('notes')
  .update({ content })
  .eq('id', id);
```

## Git Commit Conventions

All commits must:
- Be in **English**
- Start with an **emoji prefix**:
  - ✨ New features
  - 🐛 Bug fixes
  - 📝 Documentation
  - ♻️ Refactoring
  - 🎨 Code styling/formatting
  - ⚡ Performance improvements
  - 🔒 Security fixes
  - 🧪 Tests
  - 🔖 Version bumps
  - ⚙️ Configuration changes
- **Never include** "Generated with Claude Code" footer or "Co-Authored-By: Claude" signatures

Example: `✨ Add delete button for notes with confirmation dialog`

## Deployment

### Vercel Deployment (Single Project)

The application is deployed as a **single Vercel project** with both frontend and backend:

**Structure:**
- Frontend: Served as static site from `apps/frontend/dist`
- Backend: Runs as Vercel serverless function from `apps/backend/api/index.ts`
- All API requests to `/api/*` are routed to the backend serverless function

**Routing (configured in root `vercel.json`):**
```
yourdomain.com/          → Frontend (React)
yourdomain.com/api/*     → Backend (Express as serverless function)
yourdomain.com/health    → Backend health check
```

**Environment Variables (set in Vercel Dashboard):**

Frontend:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

Backend:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (bypasses RLS)
- `NODE_ENV` - Set to `production`

**Benefits of Single Project Setup:**
- ✅ No CORS issues (same domain)
- ✅ Unified deployment and environment management
- ✅ Cost-effective (single project)
- ✅ Automatic HTTPS for both frontend and backend

**Development vs Production:**
- **Development:** Frontend calls `http://localhost:3001/api` (separate backend server)
- **Production:** Frontend calls `/api` (relative path, same domain)
