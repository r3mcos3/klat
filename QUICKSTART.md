# klat - Quick Start Guide

## Snelle Setup (5 minuten)

### 1. Supabase Database Setup

1. **Ga naar** [supabase.com](https://supabase.com) en maak een gratis account
2. **Klik** op "New Project"
3. **Vul in**:
   - Project naam: `klat`
   - Database wachtwoord: Kies een sterk wachtwoord (**BEWAAR DIT!**)
   - Region: EU West (of dichtst bij jou)
4. **Wacht** ~2 minuten tot project klaar is

### 2. Connection Strings Ophalen

1. **Ga naar** Settings (tandwiel icoon linksonder) → Database
2. **Scroll** naar "Connection string"
3. **Kopieer beide strings**:

**Connection pooling (voor DATABASE_URL):**
```
Selecteer "URI" tab
Kopieer de string
Vervang [YOUR-PASSWORD] met je database wachtwoord
```

**Direct connection (voor DIRECT_URL):**
```
Schakel "Use connection pooling" UIT
Kopieer de nieuwe URI
Vervang [YOUR-PASSWORD] met je database wachtwoord
```

### 3. Backend .env Configureren

1. **Open** `apps/backend/.env` (bestand bestaat al)
2. **Vervang** de DATABASE_URL en DIRECT_URL met jouw strings:

```env
DATABASE_URL="postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 4. Database Migraties Draaien

```bash
cd apps/backend
npm run migrate
```

Je zou moeten zien:
```
✔ Generated Prisma Client
✔ Migration completed
```

### 5. Project Starten

**In de root folder van klat:**
```bash
npm run dev
```

Dit start:
- ✅ Backend API op http://localhost:3001
- ✅ Frontend app op http://localhost:5173

### 6. Verifiëren

**Open je browser:**
- Frontend: http://localhost:5173
- Backend health: http://localhost:3001/health

Je zou de klat kalender moeten zien! 🎉

## Veelvoorkomende Problemen

### "Environment variable not found: DATABASE_URL"
➜ Check of `apps/backend/.env` bestaat en correct is ingevuld

### "Can't reach database server"
➜ Verifieer dat je wachtwoord correct is in beide connection strings
➜ Check of je Supabase project actief is

### "Port 3001 already in use"
➜ Wijzig `PORT=3001` naar een andere port in `.env`

### Prisma migrate faalt
➜ Gebruik DIRECT_URL (zonder `?pgbouncer=true`)
➜ Check of je wachtwoord klopt

## Volgende Stappen

1. **Maak je eerste notitie** - Klik op een datum in de kalender
2. **Voeg tags toe** - Klik op "Tags" in de header
3. **Zoek door notities** - Gebruik de zoekbalk
4. **Auto-save werkt!** - Type gewoon, alles wordt automatisch opgeslagen

## Handige Commands

```bash
# Development
npm run dev              # Start alles
npm run backend:dev      # Alleen backend
npm run frontend:dev     # Alleen frontend

# Database
cd apps/backend
npm run migrate          # Run migrations
npm run prisma:studio    # Open database UI
npm run prisma:generate  # Regenerate Prisma client

# Build voor productie
npm run build
```

## Productie Deployment

**Backend:**
- Deploy naar Railway, Render of Fly.io
- Database blijft op Supabase (gratis tier is prima)

**Frontend:**
- Deploy naar Vercel of Netlify
- Configureer `VITE_API_URL` environment variable

Zie `SETUP.md` voor gedetailleerde deployment instructies.

## Hulp Nodig?

Check de volledige documentatie in:
- `README.md` - Project overzicht
- `SETUP.md` - Gedetailleerde setup instructies
- `C:\Users\r3mco\.claude\plans\eager-mapping-rose.md` - Implementatie plan

Veel plezier met klat! 📝✨
