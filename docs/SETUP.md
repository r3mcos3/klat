# klat - Setup Instructions

This guide helps you set up the klat project from scratch.

## Prerequisites

- Node.js 18 or higher
- npm
- A Supabase account (free tier is fine)

## 1. Install Dependencies

Install all dependencies for the monorepo:

```bash
npm install
```

This installs dependencies for:
- Root workspace
- Backend (`apps/backend`)
- Frontend (`apps/frontend`)
- Types package (`packages/types`)

## 2. Supabase Database Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com).
2. Create a free account or log in.
3. Click on "New Project".
4. Fill in the details:
   - **Name:** `klat`
   - **Password:** Choose a strong password (save this!)
   - **Region:** Choose a region close to you.
5. Wait for the project to be created (~2 minutes).

### Step 2: Get Connection Strings

1. Go to your Supabase project dashboard.
2. Click **Settings** (gear icon) → **Database**.
3. Scroll to **Connection string**.

**For `DATABASE_URL`** (Transaction Mode - Port 6543):
- Ensure "Use connection pooling" is **ON**.
- Mode: **Transaction**.
- Copy the URI. Replace `[YOUR-PASSWORD]` with your actual password.

**For `DIRECT_URL`** (Session Mode - Port 5432):
- Toggle "Use connection pooling" **OFF**.
- Copy the URI. Replace `[YOUR-PASSWORD]` with your actual password.

### Step 3: Backend Environment Variables

1. Copy the example file:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

2. Open `apps/backend/.env` and configure:
   ```env
   # Transaction mode (pgbouncer) for the application
   DATABASE_URL="postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   
   # Direct connection for migrations
   DIRECT_URL="postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
   
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

## 3. Setup Database Schema

The database schema is managed via Supabase migrations in the `supabase/migrations/` directory. To apply migrations:

```bash
cd supabase
npx supabase db push
```

This will create the required `notes` and `tags` tables in your Supabase database.

## 4. Start the Project

### Option 1: Run All (Recommended)

From the root folder:
```bash
npm run dev
```
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

### Option 2: Run Separately

**Backend:**
```bash
npm run backend:dev
```

**Frontend:**
```bash
npm run frontend:dev
```

## 5. Verification

1. **Backend Health:** Visit http://localhost:3001/health. You should see `{"status":"ok"}`.
2. **Frontend:** Visit http://localhost:5173. The app should load without errors.
3. **Database:** View your data in the Supabase dashboard at https://supabase.com/dashboard/project/YOUR_PROJECT_ID/editor

## Troubleshooting

- **`Environment variable not found`**: Ensure `.env` is in `apps/backend/`.
- **`Can't reach database server`**: Check your credentials and ensure the project is not paused in Supabase.
- **Migration Fails**: Ensure your Supabase project is accessible and you have internet access.

## Deployment

### Backend
Deploy to a Node.js compatible host (Railway, Render, Fly.io).
- Set `DATABASE_URL` and `DIRECT_URL` in the host's environment variables.
- Build command: `npm run build`.
- Start command: `npm run start` (inside `apps/backend`).

### Frontend
Deploy to a static host (Vercel, Netlify).
- Set `VITE_API_URL` to your production backend URL.
- Build command: `npm run build`.
- Output directory: `apps/frontend/dist`.