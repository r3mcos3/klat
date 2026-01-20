# Klat Deployment Guide

## Deployment Opties

### Optie 1: Frontend op Vercel + Backend op Render (Aanbevolen)

#### Frontend deployen op Vercel

1. **Push je code naar GitHub** (als je dat nog niet hebt gedaan)
   ```bash
   git push origin master
   ```

2. **Ga naar [Vercel](https://vercel.com)** en log in met je GitHub account

3. **Import het project**
   - Klik op "Add New Project"
   - Selecteer je `klat` repository
   - Vercel detecteert automatisch de monorepo

4. **Configureer het project**
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables toevoegen**
   - Klik op "Environment Variables"
   - Voeg toe: `VITE_API_URL` = `[je-backend-url]/api`
   - (Backend URL krijg je na stap 2)

6. **Deploy!**
   - Klik op "Deploy"
   - Vercel bouwt en deploy je frontend

#### Backend deployen op Render

1. **Ga naar [Render](https://render.com)** en log in

2. **Create New Web Service**
   - Klik op "New +" → "Web Service"
   - Connect je GitHub repository
   - Selecteer `klat`

3. **Configureer de service**
   - **Name**: `klat-backend` (of een andere naam)
   - **Root Directory**: `apps/backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. **Environment Variables toevoegen**
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (of laat leeg, Render gebruikt dan de standaard)
   - `SUPABASE_URL` = `[je-supabase-url]`
   - `SUPABASE_ANON_KEY` = `[je-supabase-key]`
   - `CORS_ORIGIN` = `[je-vercel-frontend-url]`

5. **Deploy!**
   - Klik op "Create Web Service"
   - Render bouwt en deploy je backend
   - Kopieer de backend URL (bijv. `https://klat-backend.onrender.com`)

6. **Update Frontend Environment Variable**
   - Ga terug naar Vercel
   - Voeg `VITE_API_URL` toe met de waarde: `https://klat-backend.onrender.com/api`
   - Redeploy de frontend

---

### Optie 2: Beide op Vercel (Geavanceerd)

Voor deze optie moet de backend worden aangepast naar Vercel Serverless Functions.

**Voordelen:**
- Alles op één platform
- Eenvoudiger te beheren

**Nadelen:**
- Vereist code aanpassingen
- Serverless functions hebben cold starts
- Meer complex om in te stellen

Als je deze route wilt, laat het me weten en ik help je de backend om te zetten naar serverless functions.

---

## Automatische Deployments

Beide Vercel en Render ondersteunen automatische deployments:
- Elke push naar `master` triggert automatisch een nieuwe deployment
- Pull requests krijgen preview deployments

## Database (Supabase)

Je Supabase database blijft waar deze is - alleen de frontend en backend worden gehost.

Zorg ervoor dat je Supabase project ingesteld is met:
- De juiste tabellen (via SQL migrations in `supabase/migrations/`)
- Row Level Security policies indien nodig

## Custom Domain (Optioneel)

Beide platforms ondersteunen custom domains:
- **Vercel**: Settings → Domains
- **Render**: Settings → Custom Domain

---

## Troubleshooting

### CORS Errors
Zorg dat `CORS_ORIGIN` in je backend environment variables de juiste frontend URL heeft.

### API niet bereikbaar
Check of `VITE_API_URL` in de frontend correct is ingesteld met de backend URL.

### Build Errors
- Check of alle dependencies in package.json staan
- Verifieer dat de build commands correct zijn
- Bekijk de deployment logs voor specifieke errors
