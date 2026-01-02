# klat

Een kalender-stijl kladblok webapp met maandweergave, markdown ondersteuning en zoekfunctionaliteit.

## Features

- 📅 Maandkalender weergave met notities per dag
- ✍️ Markdown editor met auto-save
- 🔍 Zoeken door alle notities
- 🏷️ Tags en categorieën
- 💾 Opslag via Supabase

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Query + Zustand
- Markdown editor

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- Supabase (PostgreSQL)
- Zod validation

## Project Structuur

```
klat/
├── apps/
│   ├── frontend/    # React webapp
│   └── backend/     # Express API
└── packages/
    └── types/       # Shared TypeScript types
```

## Development

### Prerequisites
- Node.js 18+
- npm
- Supabase account

### Setup

1. Clone repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   - Create `.env` in `apps/backend/`
   - Add `DATABASE_URL` from Supabase

4. Run database migrations:
   ```bash
   npm run backend:migrate
   ```

5. Start development servers:
   ```bash
   npm run dev
   ```

### Scripts

- `npm run dev` - Start all development servers
- `npm run backend:dev` - Start backend only
- `npm run frontend:dev` - Start frontend only
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier

## License

MIT
