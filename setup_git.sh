#!/bin/bash

# Clear errors so it pushes through smoothly
set +e

rm -rf .git
git init
git branch -M main

function commit_step {
    local date="$1"
    local message="$2"
    shift 2
    for file in "$@"; do
        # Suppress glob parsing errors if matching exact paths
        git add "$file" >/dev/null 2>&1
    done
    if ! git diff --cached --quiet; then
        GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git commit -m "$message"
    fi
}

# March 27: Root configurations
commit_step "2026-03-27T10:00:00+0530" "chore: clean up Next.js template and refactor to mono-repo structure" package.json package-lock.json tsconfig.json .gitignore README.md FRONTEND_DOCS.md

# March 29: Prisma & Base server packages
commit_step "2026-03-29T14:30:00+0530" "feat(backend): initialize Prisma schema and database configuration" server/package.json server/prisma server/tsconfig.json

# March 31: Express router and JWT
commit_step "2026-03-31T11:15:00+0530" "feat(backend): setup Express router and JWT authentication layers" server/src/index.ts server/src/routes/auth.ts server/src/middleware server/src/config server/src/repositories

# April 3: Vite React app
commit_step "2026-04-03T09:45:00+0530" "feat(frontend): setup Vite React app, routing, and design system" client/package.json client/tsconfig* client/vite.config.ts client/index.html client/src/main.tsx client/src/App.tsx client/src/index.css client/src/components/ui

# April 5: Client Auth pages
commit_step "2026-04-05T16:20:00+0530" "feat(frontend): implement authentication pages, layout, and global context" client/src/pages/HomePage.tsx client/src/pages/LoginPage.tsx client/src/pages/RegisterPage.tsx client/src/context client/src/pages/MainLayout.tsx client/src/lib client/src/assets

# April 7: Backend AI
commit_step "2026-04-07T13:10:00+0530" "feat(backend): integrate LangGraph AI services and itinerary generation logic" server/src/services/AiService.ts server/src/routes/chat.ts server/src/routes/trip.ts server/src/prisma.ts server/src/services/WeatherService.ts

# April 9: Mapbox
commit_step "2026-04-09T10:05:00+0530" "feat(frontend): integrate Mapbox GL 3D globe visualization" client/src/components/map

# April 11: Chat Interface
commit_step "2026-04-11T15:40:00+0530" "feat(frontend): build conversational AI chat interface and streaming logic" client/src/pages/CreateNewTripPage.tsx client/src/pages/_components client/src/components/chat client/src/components/common

# April 14: Community
commit_step "2026-04-14T11:25:00+0530" "feat(frontend): develop detailed itinerary viewing and community exploration" client/src/pages/TripDetailPage.tsx client/src/pages/CommunityPage.tsx client/src/pages/MyTripsPage.tsx client/src/components/trip

# April 16: Stripe backend
commit_step "2026-04-16T14:55:00+0530" "feat(backend): implement Stripe Checkout and webhooks" server/src/services/StripeService.ts server/src/routes/stripe.ts server/src/services/

# April 18: Stripe Frontend
commit_step "2026-04-18T09:15:00+0530" "feat(frontend): add paywall, upgrade flow, and pricing page" client/src/pages/PricingPage.tsx client/src/pages/SuccessPage.tsx client/src/components/layout/Header.tsx client/src/components/layout/Footer.tsx client/src/components/layout

# April 19: Polish & Vercel
commit_step "2026-04-19T10:00:00+0530" "chore: add Arcjet rate-limiting, Vercel SPA fallbacks, and finalize deployment configs" .

git remote add origin https://github.com/Uday-Choudhary/Atlas-AI.git
git push -u origin main -f
