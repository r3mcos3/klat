# klat - Setup Instructies

Deze guide helpt je om het klat project van scratch op te zetten.

## Prerequisites

- Node.js 18 of hoger
- npm
- Een Supabase account (gratis tier is prima)

## 1. Dependencies Installeren

Installeer alle dependencies voor de monorepo:

```bash
npm install
```

Dit installeert dependencies voor:
- Root workspace
- Backend (`apps/backend`)
- Frontend (`apps/frontend`)
- Types package (`packages/types`)

## 2. Supabase Database Setup

### Stap 1: Maak een Supabase Project aan

1. Ga naar [https://supabase.com](https://supabase.com)
2. Maak een gratis account of log in
3. Klik op "New Project"
4. Vul de volgende gegevens in:
   - Project naam: `klat` (of een andere naam)
   - Database wachtwoord: Kies een sterk wachtwoord (bewaar dit!)
   - Region: Kies een regio dichtbij jou
5. Wacht tot het project is aangemaakt (~2 minuten)

### Stap 2: Haal de Database Connection Strings op

1. Ga naar je Supabase project dashboard
2. Klik op het **Settings** tandwiel icoon (linksonder)
3. Ga naar **Database** in het menu
4. Scroll naar beneden naar **Connection string**
5. Kopieer de volgende strings:

**Voor `DATABASE_URL`** (met connection pooling):
- Selecteer "URI" tab
- Kopieer de connection string
- Vervang `[YOUR-PASSWORD]` met je database wachtwoord
- Deze URL bevat `?pgbouncer=true` aan het einde

**Voor `DIRECT_URL`** (directe verbinding, voor migraties):
- Selecteer "URI" tab bij **Connection pooling**
- Schakel "Use connection pooling" UIT
- Kopieer deze connection string
- Vervang `[YOUR-PASSWORD]` met je database wachtwoord

### Stap 3: Backend Environment Variables

1. Kopieer de `.env.example` in de backend folder:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

2. Open `apps/backend/.env` en vul de Supabase connection strings in:
   ```env
   DATABASE_URL="postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

## 3. Database Schema Migreren

Nu gaan we de Prisma schema naar Supabase pushen:

```bash
cd apps/backend
npm run migrate
```

Dit:
1. Maakt de `notes` en `tags` tabellen aan in Supabase
2. Zet de relaties en indexes op
3. Genereert de Prisma client

Je kunt de tabellen bekijken in Supabase:
- Ga naar je Supabase project
- Klik op **Table Editor** in het menu
- Je zou de `notes` en `tags` tabellen moeten zien

## 4. Project Starten

Nu kun je het hele project starten!

### Optie 1: Beide servers tegelijk (aanbevolen)

Vanuit de root folder:
```bash
npm run dev
```

Dit start:
- Backend API op http://localhost:3001
- Frontend webapp op http://localhost:5173

### Optie 2: Servers apart

**Backend:**
```bash
npm run backend:dev
```

**Frontend (in een andere terminal):**
```bash
npm run frontend:dev
```

## 5. Verifiëren dat alles werkt

### Backend checken:

Open http://localhost:3001/health in je browser. Je zou moeten zien:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Frontend checken:

Open http://localhost:5173 in je browser. Je zou de klat homepage moeten zien.

### Database checken:

Je kunt Prisma Studio gebruiken om je database te inspecteren:
```bash
cd apps/backend
npm run prisma:studio
```

Dit opent een UI op http://localhost:5555 waar je:
- Notes kunt aanmaken, bewerken en verwijderen
- Tags kunt beheren
- Je database kunt inspecteren

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
- Zorg dat je `.env` bestand in `apps/backend/` staat
- Check of de DATABASE_URL en DIRECT_URL correct zijn ingevuld

### "Can't reach database server"
- Check of je Supabase project actief is
- Verifieer dat je wachtwoord correct is in de connection strings
- Zorg dat `?pgbouncer=true` aan het einde van DATABASE_URL staat

### "Port 3001 is already in use"
- Er draait al iets op port 3001
- Wijzig `PORT=3001` naar een andere port in `apps/backend/.env`
- Of stop het andere proces

### Prisma migrate faalt
- Zorg dat je `DIRECT_URL` gebruikt (zonder pgbouncer)
- Check of de connection string geldig is
- Verifieer dat je database wachtwoord correct is

## Volgende Stappen

Nu de setup compleet is, kun je:

1. **Backend API's bouwen**: Voeg endpoints toe in `apps/backend/src/routes/`
2. **Frontend componenten maken**: Bouw de kalender in `apps/frontend/src/components/`
3. **Types uitbreiden**: Voeg nieuwe types toe in `packages/types/src/`

Zie het implementatieplan in `C:\Users\r3mco\.claude\plans\eager-mapping-rose.md` voor de volledige roadmap!

## Handige Commands

```bash
# Root level
npm run dev              # Start alle dev servers
npm run build            # Build alle packages
npm run lint             # Lint alle packages
npm run format           # Format code met Prettier

# Backend
npm run backend:dev      # Start backend dev server
cd apps/backend && npm run migrate        # Run database migraties
cd apps/backend && npm run prisma:studio  # Open Prisma Studio
cd apps/backend && npm run prisma:generate # Genereer Prisma client

# Frontend
npm run frontend:dev     # Start frontend dev server
```
