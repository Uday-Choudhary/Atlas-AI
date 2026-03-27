# Atlas AI — Intelligent Travel Operating System

A full-stack SaaS application that combines Generative AI, geospatial algorithms, and execution tools to create a complete Travel OS.

## Features

- **AI Trip Planning** — Conversational AI (Gemini) generates day-by-day JSON itineraries
- **Place Enrichment** — Geoapify + OpenTripMap for photos, ratings, geo-coordinates
- **3D Interactive Maps** — Mapbox globe visualization of your entire trip
- **Route Optimization** — TSP solver reorders daily activities for efficient travel
- **Calendar Sync** — OAuth2 integration to push events to Google Calendar
- **PDF Export** — Server-side rendered travel vouchers for offline use
- **Community Feed** — Browse and fork public trips from other travelers

## Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | React 19, Vite, TailwindCSS 4, Framer Motion |
| Backend     | Express 5, TypeScript, Prisma ORM       |
| Database    | PostgreSQL                              |
| AI          | Google Gemini (Generative AI)           |
| Maps        | Mapbox GL JS                            |
| Auth        | Stateless JWT                           |

## Getting Started

```bash
# Install dependencies
npm run install:all

# Set up environment variables
cp server/.env.example server/.env
# Fill in your API keys

# Push database schema
cd server && npx prisma db push && cd ..

# Seed the demo account and sample community trips
cd server && npx prisma db seed && cd ..

# Run development servers (client + server concurrently)
npm run dev
```

Client runs on `http://localhost:5173`, Server on `http://localhost:3001`.

Demo login:

```text
Email: test@atlas.ai
Password: test1234
```

## Environment Variables

```env
# Server (.env)
DATABASE_URL="postgresql://user:pass@localhost:5432/atlas_ai"
AUTH_SECRET="your-jwt-secret"
GEMINI_API_KEY="your-gemini-key"
GEMINI_MODEL="gemini-2.5-flash"
GEOAPIFY_API_KEY="your-geoapify-key"
OPENTRIPMAP_API_KEY="your-opentripmap-key"
MAPBOX_TOKEN="your-mapbox-token"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```
