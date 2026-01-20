# klat - Quick Start Guide

## Quick Setup (5 minutes)

### 1. Supabase Database Setup

1. **Go to** [supabase.com](https://supabase.com) and create a free account.
2. **Click** "New Project".
3. **Fill in**:
   - Project Name: `klat`
   - Database Password: Choose a strong password (**SAVE THIS!**)
   - Region: Select the region closest to you.
4. **Wait** ~2 minutes for the project to provision.

### 2. Get Connection Strings

1. **Go to** Settings (gear icon bottom left) → Database.
2. **Scroll** to "Connection string".
3. **Copy both strings**:

**Connection pooling (for DATABASE_URL):**
```
Select "URI" tab
Copy the string (port 6543)
Replace [YOUR-PASSWORD] with your database password
```

**Direct connection (for DIRECT_URL):**
```
Toggle "Use connection pooling" OFF
Copy the new URI (port 5432)
Replace [YOUR-PASSWORD] with your database password
```

### 3. Configure Backend .env

1. **Create** `apps/backend/.env` (use `.env.example` as a template).
2. **Fill in** the `DATABASE_URL` and `DIRECT_URL` with your strings:

```env
DATABASE_URL="postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 4. Install & Migrate

**From the root folder of klat:**

```bash
# 1. Install dependencies
npm install

# 2. Run database migrations (from backend folder)
cd apps/backend
npm run migrate
cd ../..
```

### 5. Start Project

**From the root folder of klat:**
```bash
npm run dev
```

This starts:
- ✅ Backend API at http://localhost:3001
- ✅ Frontend app at http://localhost:5173

### 6. Verify

**Open your browser:**
- Frontend: http://localhost:5173
- Backend health: http://localhost:3001/health

You should see the klat calendar! 🎉

## Common Issues

### "Environment variable not found: DATABASE_URL"
➜ Check if `apps/backend/.env` exists and is filled in correctly.

### "Can't reach database server"
➜ Verify your Supabase credentials are correct.
➜ Check if your Supabase project is active.

## Useful Commands

```bash
# Development (from root)
npm run dev              # Start everything
npm run build            # Build everything
npm run format           # Format code

# Backend Specific
npm run backend:dev      # Backend server only
# View data in Supabase Dashboard: https://supabase.com/dashboard
```

## More Info

See `SETUP.md` for detailed setup and deployment instructions.