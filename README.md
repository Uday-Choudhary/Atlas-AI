# 🌍 Atlas AI — Intelligent Travel Operating System

<div align="center">
  <img src="https://img.shields.io/badge/Status-Live-success?style=for-the-badge&logoColor=white" alt="Status" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

<p align="center">
  <strong>🌟 Experience the live application here: <a href="https://atlas-ai-client.vercel.app/">https://atlas-ai-client.vercel.app/</a> 🌟</strong>
</p>

---

**Atlas AI** is a cutting-edge full-stack SaaS application that converges Generative AI, robust geospatial algorithms, and actionable execution tools to create a complete and intelligent Travel Operating System. 

Whether you're planning a quick weekend getaway or a month-long backpacking trip, Atlas AI generates a fully fleshed-out, highly optimized itinerary—taking the hassle out of travel planning.

## ✨ Key Features

- 🧠 **AI-Powered Trip Planning:** Utilizes Google's Gemini Conversational AI to generate highly contextual, day-by-day itineraries dynamically parsed into JSON.
- 📍 **Place Enrichment:** Integrated with Geoapify and OpenTripMap to fetch rich geospatial data, photos, travel ratings, and exact geo-coordinates.
- 🗺️ **3D Interactive Maps:** Experience an immersive journey visualization powered by Mapbox GL JS globe views, allowing you to visually explore your entire trip before you go.
- ⚡ **Route Optimization:** Implements a Traveling Salesperson Problem (TSP) solver to intelligently reorder daily activities, ensuring the most efficient and practical travel routes.
- 📅 **Calendar Syncing:** Seamless OAuth2 integration that allows you to push your optimized travel itinerary directly to your Google Calendar.
- 📄 **PDF Itinerary Export:** Features robust server-side rendering to generate beautiful, structured PDF travel vouchers for offline use during your travels.
- 🤝 **Community Feed:** Browse, discover, and "fork" public trips curated by other travelers from the Atlas AI community.

## 🛠️ Technology Stack

| Layer       | Technologies & Frameworks                                 |
|-------------|-----------------------------------------------------------|
| **Frontend**| React 19, Vite, Tailwind CSS 4, Framer Motion, Mapbox GL JS |
| **Backend** | Express 5, Node.js, TypeScript, REST APIs                 |
| **Database**| PostgreSQL, Prisma ORM                                    |
| **AI/ML**   | Google Gemini (Generative AI for JSON structures)         |
| **Auth**    | Stateless JWT Authorization                               |
| **Deployment** | Vercel (Frontend), Hosted Node (Backend), Neon (DB)    |

## 🚀 Getting Started

Follow the instructions below to spin up your own local version of Atlas AI.

### Prerequisites

Ensure you have the following installed on your local machine:
- Node.js (v18+)
- PostgreSQL (or an equivalent hosted PG service like Neon or Supabase)
- NPM or PNPM

### 1. Installation

Clone the repository and install dependencies across the monorepo:

```bash
# Install dependencies for both client and server workspaces
npm run install:all
```

### 2. Environment Configuration

Navigate to the `server/` directory and configure your environment variables:

```bash
cp server/.env.example server/.env
```

Open `server/.env` and supply your API keys:

```env
# Database Configuration
DATABASE_URL="postgresql://user:pass@localhost:5432/atlas_ai"

# Security & Authentication
AUTH_SECRET="your-jwt-secret-key-super-secure"

# AI Integration
GEMINI_API_KEY="your-gemini-key"
GEMINI_MODEL="gemini-2.5-flash"

# Maps & Geospatial Services
GEOAPIFY_API_KEY="your-geoapify-key"
OPENTRIPMAP_API_KEY="your-opentripmap-key"
MAPBOX_TOKEN="your-mapbox-token"

# (Optional) Calendar Sync Integration
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

### 3. Database Initialization

Push the Prisma schema to your PostgreSQL database and seed the initial mock data:

```bash
cd server
npx prisma db push
npx prisma db seed
cd ..
```

### 4. Running the Application

You can spin up both the React frontend and Express backend concurrently:

```bash
# Run both development servers concurrently
npm run dev
```

- **Client Application:** `http://localhost:5173`
- **Server API:** `http://localhost:3001`

### Demo Login Credentials

If you seeded the database using `npx prisma db seed`, you can access the pre-configured demo account immediately:

```text
Email: test@atlas.ai
Password: test1234
```

## 🏗️ Project Structure

This project is built using an NPM Workspaces monorepo structure:

- `/client` - The Vite-powered React front-end.
- `/server` - The Express backend serving API endpoints and database communication.
- `/diagrams` - Supplementary documentation, ER diagrams, and system architecture blueprints.

## 🔗 Live Application

The client application is live and continuously deployed! 
Check it out here: **[Atlas AI — Live Preview](https://atlas-ai-client.vercel.app/)**

---

<p align="center">
  <i>Designed and developed as the ultimate intelligent travel companion.</i>
</p>
