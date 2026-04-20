# ER Diagram — Atlas AI (Entity-Relationship)

## Database Schema (PostgreSQL / Prisma)

```mermaid
erDiagram
    User {
        String id PK "UUID"
        String email "UNIQUE"
        String password "Nullable"
        String firstName "Nullable"
        String lastName "Nullable"
        String profileImage "Nullable"
        DateTime createdAt "DEFAULT(now())"
        DateTime updatedAt
        Int freeTripsUsed "DEFAULT(0)"
        String planType "DEFAULT('free')"
        String stripeCustomerId "Nullable"
        String subscriptionStatus "DEFAULT('inactive')"
    }

    Trip {
        String id PK "UUID"
        String title
        String destination
        String startDate
        String endDate
        String budget
        String groupSize "DEFAULT('Solo')"
        String travelStyle "DEFAULT('Sightseeing')"
        Boolean isPublic "DEFAULT(false)"
        String forkedFrom "Nullable"
        Int forkCount "DEFAULT(0)"
        Int likes "DEFAULT(0)"
        String userId FK
        Json itinerary
        DateTime createdAt "DEFAULT(now())"
        DateTime updatedAt
    }

    Place {
        String id PK "UUID"
        String name
        String address "Nullable"
        String photoUrl "Nullable"
        Float rating "Nullable"
        Float latitude "Nullable"
        Float longitude "Nullable"
        String googlePlaceId "Nullable"
        String ticketPricing "Nullable"
        String description "Nullable"
        String tripId FK
        DateTime createdAt "DEFAULT(now())"
    }

    %% Relationships
    User ||--o{ Trip : "creates / owns"
    Trip ||--o{ Place : "contains"
```

---

## Explanation of Entities and Relationships

### `User`
- Represents an authenticated user in the system.
- Has a **one-to-many** (`1:N`) relationship with `Trip`s. A user can create many trips, but each trip belongs to exactly one user.
- Contains fields for Stripe subscription management (`planType`, `stripeCustomerId`, `subscriptionStatus`) to track access control.

### `Trip`
- Represents a generated or forked travel itinerary.
- Belongs to a single `User` via the `userId` foreign key.
- Has a **one-to-many** (`1:N`) relationship with `Place`s. A trip consists of multiple places, and each place record belongs to a specific trip.
- Stores the core AI-generated schedule in the `itinerary` (JSON) field.
- Community features are supported by `isPublic` (boolean toggle), `forkedFrom` (self-referencing logic but at application level, pointing to another trip ID), and metric fields like `forkCount` and `likes`.

### `Place`
- Represents a specific point of interest (POI), hotel, or restaurant associated with a trip.
- Belongs to a single `Trip` via the `tripId` foreign key.
- Caches data heavily from the Google Places API (`googlePlaceId`, `latitude`, `longitude`, `rating`, `photoUrl`) to populate map markers and UI cards efficiently without re-querying the API unnecessarily.
