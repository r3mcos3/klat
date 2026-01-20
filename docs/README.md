# klat

A calendar-style notepad web application with monthly views, markdown support, and robust search functionality.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Node](https://img.shields.io/badge/Node-18+-green)

## Features

- 📅 **Monthly Calendar View:** visually manage notes day by day.
- ✍️ **Markdown Editor:** rich text editing with auto-save capabilities.
- 🔍 **Search:** full-text search across all your notes.
- 🏷️ **Tags:** organize content with custom tags and categories.
- 💾 **Cloud Storage:** secure data persistence via Supabase (PostgreSQL).

## Tech Stack

The project is a monorepo managed by npm workspaces.

### Frontend (`apps/frontend`)
- **Core:** React 18, TypeScript, Vite
- **State:** React Query (Server State), Zustand (Client State)
- **Styling:** Tailwind CSS
- **Editor:** @uiw/react-md-editor

### Backend (`apps/backend`)
- **Core:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (via Supabase), Supabase Client Library
- **Validation:** Zod

### Shared (`packages/types`)
- Shared TypeScript interfaces and DTOs.

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- A generic Supabase account

### Quick Start
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Setup Environment:**
    Create `apps/backend/.env` and add your Supabase credentials (see `SETUP.md`).
3.  **Run Migrations:**
    ```bash
    cd supabase && npx supabase db push
    ```
4.  **Start Development:**
    ```bash
    npm run dev
    ```

For detailed instructions, see [QUICKSTART.md](./QUICKSTART.md) or [SETUP.md](./SETUP.md).

## Development Commands

Run these from the project root:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run build` | Build all packages for production |
| `npm run lint` | Run ESLint across all packages |
| `npm run format` | Format code with Prettier |
| `npm run backend:dev` | Start only the backend server |
| `npm run frontend:dev` | Start only the frontend server |

## Project Structure

```
klat/
├── apps/
│   ├── backend/     # Express API
│   └── frontend/    # React Application
└── packages/
    └── types/       # Shared TypeScript definitions
```

## License

MIT