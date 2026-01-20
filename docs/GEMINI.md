# Gemini Context: klat

## Project Overview
**klat** is a full-stack web application designed as a calendar-style notepad. It allows users to manage notes on a daily basis, supporting Markdown content, tags, and search functionality. The project is structured as a monorepo.

## Project Structure
The project uses **npm workspaces** to manage multiple packages:

- **Root:** Orchestrates the monorepo, linting, and formatting.
- **apps/backend:** Express.js API server.
- **apps/frontend:** React Single Page Application (Vite).
- **packages/types:** Shared TypeScript definitions used by both frontend and backend.

## Tech Stack

### Frontend (`apps/frontend`)
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State/Data Fetching:** TanStack Query (React Query) for server state, Zustand (available for client state).
- **Editor:** `@uiw/react-md-editor` for Markdown.
- **HTTP Client:** Axios.

### Backend (`apps/backend`)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database Client:** Supabase Client Library
- **Validation:** Zod
- **Database:** PostgreSQL (via Supabase)

### Shared (`packages/types`)
- Contains TypeScript interfaces for Models (`Note`, `Tag`), DTOs (`CreateNoteDto`, etc.), and API responses.

## Key Commands

Run these from the **root** directory:

- **Start All:** `npm run dev` (starts both frontend and backend)
- **Build All:** `npm run build`
- **Lint All:** `npm run lint`
- **Format:** `npm run format` (Prettier)

### Backend Specific (`apps/backend`)
- **Dev Server:** `npm run dev` (uses `tsx watch`)
- **Database Migrations:** `cd supabase && npx supabase db push`
- **View Database:** Use Supabase Dashboard

### Frontend Specific (`apps/frontend`)
- **Dev Server:** `npm run dev` (Vite)
- **Build:** `npm run build`

## Architecture & Conventions

### Data Model
- **Note:** The core entity. Contains `content` (Markdown), `date`, `deadline`, and relations to `Tag`s.
- **Tag:** Label for notes with a `name` and optional `color`.
- **Relationship:** Many-to-Many between `Note` and `Tag`.

### Backend Pattern
- **Routes:** Define endpoints (`routes/*.ts`).
- **Controllers:** Handle HTTP request/response (`controllers/*.ts`).
- **Services:** specific business logic (`services/*.ts`).
- **Middleware:** Validation (Zod) and Error handling.

### Frontend Pattern
- **Hooks:** Custom hooks (`hooks/useNotes.ts`, `hooks/useTags.ts`) encapsulate React Query logic for data fetching and mutations.
- **Services:** `services/api.ts` handles Axios configuration; specific API calls are in `services/noteApi.ts`, etc.
- **Components:** Functional components using Tailwind for styling.

### Development Workflow
1.  **Database Changes:**
    -   Create SQL migration in `supabase/migrations/`.
    -   Run `cd supabase && npx supabase db push` to apply migrations.
    -   Update service methods to reflect new schema.
2.  **Type Updates:**
    -   Update `packages/types/src/index.ts` to reflect model changes.
3.  **Backend Logic:** Update routes/controllers/services using the new types/schema.
4.  **Frontend Logic:** Update hooks and components to consume the new API features.

## Environment Setup
Required `.env` file in `apps/backend`:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```
