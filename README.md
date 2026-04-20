# Atlas AI — Intelligent Travel Operating System

**Live Application: https://atlas-ai-client.vercel.app/**

Atlas AI is a full-stack SaaS travel planning application powered by Generative AI, geospatial algorithms, and a strictly OOP-architected backend built with TypeScript.

## Backend Architecture — SOLID OOP Design

The backend is structured across **three strictly decoupled layers**, each behind a typed TypeScript interface:

| Layer | Classes | Interface |
|---|---|---|
| **Controllers** | `AuthController`, `TripController`, `ChatController`, `StripeController`, `CalendarController` | HTTP boundary — encapsulates request/response |
| **Services** | `TripService`, `UserService`, `AIService`, `PlacesService`, `RouteService`, `StripeService`, `CalendarService`, `PDFService` | Business logic — implements `ITripService`, `IUserService` |
| **Repositories** | `TripRepository`, `UserRepository` | Data access — implements `ITripRepository`, `IUserRepository` |

**Dependency Inversion — Composition Root (`config/container.ts`):**
```ts
// Concrete implementations instantiated ONCE, injected via interfaces
const userService  = new UserService(new UserRepository());
const tripService  = new TripService(new TripRepository(), new PlacesService(), new RouteService());
```

`TripService` and `UserService` never import Prisma directly — they depend only on `ITripRepository` / `IUserRepository` abstractions. This enables full Liskov Substitution (any repository implementation is swappable).

**Encapsulation example** (`TripService`):
```ts
export class TripService implements ITripService {
    constructor(
        private readonly tripRepo: ITripRepository,
        private readonly placesService: IPlacesService,
        private readonly routeService: IRouteService
    ) {}
    private async guardOwnership(tripId: string, userId: string): Promise<Trip> { ... }
}
```

## Key Features

- **AI-Powered Trip Planning:** Google Gemini Conversational AI generates day-by-day itineraries as structured JSON via a LangGraph state machine.
- **Place Enrichment:** Integrated with Geoapify and OpenTripMap to fetch rich geospatial data, photos, travel ratings, and geo-coordinates.
- **3D Interactive Maps:** Immersive journey visualization powered by Mapbox GL JS globe views.
- **Route Optimization:** Traveling Salesperson Problem (TSP) solver reorders daily activities for the most efficient routes.
- **Calendar Syncing:** OAuth2 integration pushes optimized itineraries directly to Google Calendar.
- **PDF Itinerary Export:** Server-side rendering generates structured PDF travel vouchers for offline use.
- **Community Feed:** Browse, discover, and "fork" public trips from the Atlas AI community.

## Technology Stack

| Layer       | Technologies & Frameworks                                 |
|-------------|-----------------------------------------------------------|
| **Frontend**| React 19, Vite, Tailwind CSS 4, Framer Motion, Mapbox GL JS |
| **Backend** | Express 5, Node.js, TypeScript, REST APIs                 |
| **Database**| PostgreSQL, Prisma ORM                                    |
| **AI/ML**   | Google Gemini + Groq fallback (LangGraph state machine)   |
| **Auth**    | Stateless JWT Authorization                               |
| **Deployment** | Vercel (Frontend), Hosted Node (Backend), Neon (DB)    |

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (or an equivalent hosted PG service like Neon or Supabase)
- NPM or PNPM

### 1. Installation

```bash
npm run install:all
```

### 2. Environment Configuration

```bash
cp server/.env.example server/.env
```

Open `server/.env` and supply your API keys:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/atlas_ai"
AUTH_SECRET="your-jwt-secret-key-super-secure"
GEMINI_API_KEY="your-gemini-key"
GEMINI_MODEL="gemini-2.5-flash"
GEOAPIFY_API_KEY="your-geoapify-key"
OPENTRIPMAP_API_KEY="your-opentripmap-key"
MAPBOX_TOKEN="your-mapbox-token"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

### 3. Database Initialization

```bash
cd server
npx prisma db push
npx prisma db seed
cd ..
```

### 4. Running the Application

```bash
npm run dev
```

- **Client Application:** `http://localhost:5173`
- **Server API:** `http://localhost:3001`

### Demo Login Credentials

```text
Email: test@atlas.ai
Password: test1234
```

## Project Structure

```
/client   — Vite-powered React frontend
/server
  /src
    /controllers  — HTTP layer (AuthController, TripController, ...)
    /services     — Business logic (TripService implements ITripService, ...)
    /repositories — Data access (TripRepository implements ITripRepository, ...)
    /config       — Composition Root (container.ts wires all DI)
    /middleware   — Auth + validation
    /routes       — Express router definitions
/idea.md, /useCaseDiagram.md, /sequenceDiagram.md, /classDiagram.md, /ErDiagram.md
```

## Live Application

**[Atlas AI — Live Preview](https://atlas-ai-client.vercel.app/)**

---

<p align="center">
  <i>Designed and developed as the ultimate intelligent travel companion.</i>
</p>
