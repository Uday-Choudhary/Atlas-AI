# Sequence Diagram — Atlas AI (Main Flow End-to-End)

## Flow 1: User Registration & Login

```mermaid
sequenceDiagram
    autonumber
    actor U as User (Browser)
    participant FE as React Frontend
    participant BE as Express Backend
    participant DB as PostgreSQL (Neon)

    U->>FE: Navigate to /register
    FE->>U: Render RegisterPage form

    U->>FE: Submit (email, password, name)
    FE->>BE: POST /api/auth/register
    BE->>DB: Check if email exists
    DB-->>BE: Not found
    BE->>BE: bcrypt.hash(password)
    BE->>DB: INSERT User record
    DB-->>BE: User created
    BE->>BE: jwt.sign({ userId })
    BE-->>FE: 201 { token, user }
    FE->>FE: Store token in context / localStorage
    FE-->>U: Redirect to /create-new-trip
```

---

## Flow 2: AI Trip Generation (Key Flow)

```mermaid
sequenceDiagram
    autonumber
    actor U as User (Browser)
    participant FE as React Frontend
    participant BE as Express Backend
    participant AI as Gemini 1.5 Pro
    participant GP as Google Places API
    participant DB as PostgreSQL (Neon)

    U->>FE: Fill trip form (destination, dates, budget, style, group)
    FE->>U: Show loading state

    FE->>BE: POST /api/trips/generate  { Authorization: Bearer <JWT> }
    BE->>BE: verifyToken middleware
    BE->>DB: Check user.freeTripsUsed vs planType

    alt Free user over limit
        BE-->>FE: 403 { error: "Upgrade required" }
        FE-->>U: Show paywall modal
    else Under limit or Pro
        BE->>AI: generateContent(prompt with trip params)
        AI-->>BE: Structured JSON itinerary (days, activities, tips)
        BE->>GP: searchNearby(places in itinerary)
        GP-->>BE: Place details (photos, rating, address, lat/lng)
        BE->>BE: Merge AI itinerary + Places data
        BE->>DB: INSERT Trip + Places records
        BE->>DB: INCREMENT user.freeTripsUsed (if free plan)
        DB-->>BE: Trip saved
        BE-->>FE: 201 { trip }
        FE-->>U: Navigate to /trip/:id
    end
```

---

## Flow 3: Chat with AI to Refine Trip

```mermaid
sequenceDiagram
    autonumber
    actor U as User (Browser)
    participant FE as React Frontend
    participant BE as Express Backend
    participant AI as Gemini 1.5 Pro

    U->>FE: Open chat panel on TripDetailPage
    U->>FE: Type message (e.g. "Replace Day 2 lunch with a seafood restaurant")

    FE->>BE: POST /api/chat  { message, tripContext, history[] }
    note over BE: Authenticated via JWT middleware
    BE->>AI: generateContent with streaming (trip context + message)

    loop Streaming tokens
        AI-->>BE: token chunk
        BE-->>FE: SSE chunk (text/event-stream)
        FE-->>U: Append streamed text to chat bubble
    end

    BE-->>FE: Stream complete
    FE-->>U: Full AI response displayed
```

---

## Flow 4: Stripe Subscription Upgrade

```mermaid
sequenceDiagram
    autonumber
    actor U as User (Browser)
    participant FE as React Frontend
    participant BE as Express Backend
    participant ST as Stripe
    participant DB as PostgreSQL (Neon)

    U->>FE: Click "Upgrade to Pro"
    FE->>BE: POST /api/stripe/checkout  { Authorization: Bearer <JWT> }
    BE->>ST: stripe.checkout.sessions.create({ price_id, customer_email })
    ST-->>BE: { url: "https://checkout.stripe.com/..." }
    BE-->>FE: { url }
    FE-->>U: Redirect to Stripe Checkout

    U->>ST: Enter card details & pay
    ST-->>U: Redirect to /success?session_id=xxx

    ST->>BE: POST /api/stripe/webhook (checkout.session.completed)
    BE->>BE: stripe.webhooks.constructEvent (verify signature)
    BE->>DB: UPDATE User SET planType="pro", subscriptionStatus="active"
    DB-->>BE: Updated

    FE->>BE: GET /api/stripe/status?session_id=xxx
    BE->>ST: stripe.checkout.sessions.retrieve(session_id)
    ST-->>BE: { payment_status: "paid" }
    BE-->>FE: { status: "paid", plan: "pro" }
    FE-->>U: Show SuccessPage with Pro badge
```

---

## Flow 5: Community Trip Fork

```mermaid
sequenceDiagram
    autonumber
    actor U as User (Browser)
    participant FE as React Frontend
    participant BE as Express Backend
    participant DB as PostgreSQL (Neon)

    U->>FE: Browse /community page
    FE->>BE: GET /api/trips/community
    BE->>DB: SELECT trips WHERE isPublic=true
    DB-->>BE: [ ...public trips ]
    BE-->>FE: Trip list
    FE-->>U: Render trip cards

    U->>FE: Click "Fork" on a trip
    FE->>BE: POST /api/trips/:id/fork  { Authorization: Bearer <JWT> }
    BE->>DB: SELECT original trip
    DB-->>BE: Trip data
    BE->>DB: INSERT new Trip (userId=current, forkedFrom=originalId)
    BE->>DB: INCREMENT original.forkCount
    DB-->>BE: Saved
    BE-->>FE: 201 { newTrip }
    FE-->>U: Navigate to /my-trips (forked trip appears)
```
