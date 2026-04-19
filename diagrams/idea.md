# 🗺️ Atlas AI — Project Idea

## What We Are Building

**Atlas AI** is a full-stack, AI-powered travel planning web application that transforms how users discover, plan, and organise trips. Users describe where they want to go and the app generates a fully structured, day-by-day itinerary — complete with curated places, maps, travel tips, and exportable calendars — all in seconds.

---

## Problem Statement

Planning a trip from scratch is time-consuming and fragmented. Travellers have to juggle multiple tabs (Google, TripAdvisor, Booking.com, Maps), manually build schedules, and still risk missing hidden gems or logistics issues. Atlas AI solves this by acting as an intelligent, one-stop trip planner.

---

## Scope

### Core Application
- React (Vite + TypeScript) SPA frontend
- Node.js + Express TypeScript backend
- PostgreSQL via Neon (serverless) with Prisma ORM
- Google Gemini 1.5 Pro (LLM for itinerary generation)
- Google Places API (real venue data + photos)
- Deployed on Vercel (frontend) + Render (backend)

---

## Key Features

| Feature | Description |
|---|---|
| 🤖 AI Itinerary Generation | Gemini Pro generates a day-by-day itinerary with activities, tips, and best times to visit |
| 💬 Conversational Chat | After generation, users chat with the AI to refine, extend, or replace parts of the trip |
| 🗺️ Interactive 3D Map | Mapbox GL globe showing all trip places as pins |
| 📍 Google Places Integration | Real venue photos, ratings, addresses, and pricing pulled automatically |
| 👥 Community Hub | Users can make trips public, browse and fork other users' itineraries |
| 🔒 Authentication | JWT-based login/register; Google OAuth optional |
| 💳 Stripe Subscriptions | Free tier (3 trips), Pro plan (unlimited) with Stripe Checkout + Webhooks |
| 📅 Calendar Export | Export itinerary to Google Calendar via OAuth2 |
| 📄 PDF Export | Download a print-ready trip PDF |
| 🛡️ Rate Limiting | Arcjet bot-protection + token-bucket rate limiting |

---

## User Roles

- **Guest** — Browse landing page, see community trips
- **Free User** — Register/login, generate up to 3 AI trips
- **Pro User** — Unlimited trips, all export features
- **Admin** *(future)* — Content moderation for community

---

## Tech Stack Summary

```
Frontend:   React 18 + TypeScript + Vite + Tailwind-like CSS
Backend:    Node.js + Express + TypeScript
Database:   PostgreSQL (Neon) + Prisma ORM
AI:         Google Gemini 1.5 Pro via @google/generative-ai
Maps:       Mapbox GL JS
Payments:   Stripe Checkout + Webhooks
Auth:       JWT (jsonwebtoken + bcrypt)
Security:   Arcjet Shield + Token Bucket
Hosting:    Vercel (frontend) + Render (backend)
```
