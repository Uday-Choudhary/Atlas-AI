import type { Prisma, Trip } from "@prisma/client";
import type { ITripRepository } from "../repositories/TripRepository";
import type { IPlacesService } from "./PlacesService";
import type { IRouteService } from "./RouteService";

export type TripGenerationParams = {
    destination: string;
    startDate: Date;
    endDate: Date;
    budget: string;
    travelers: string;
    travelStyle?: string;
};

/**
 * ITripService — Interface for trip orchestration (Interface Segregation Principle).
 */
export interface ITripService {
    saveTripFromChat(userId: string, tripPlanJson: any, meta: { startDate: string; endDate: string }): Promise<Trip>;
    getTripDetails(tripId: string): Promise<Trip | null>;
    getUserTrips(userId: string): Promise<Trip[]>;
    getCommunityTrips(limit?: number): Promise<Trip[]>;
    togglePublic(tripId: string, userId: string): Promise<Trip>;
    deleteTrip(tripId: string, userId: string): Promise<Trip>;
    forkTrip(userId: string, originalTripId: string): Promise<Trip>;
    optimizeTrip(tripId: string, userId: string): Promise<Trip>;
}

/**
 * TripService — Orchestrates trip lifecycle using injected dependencies.
 * 
 * SOLID Principles:
 * - Single Responsibility: orchestrates trip workflows, delegates to specialized services
 * - Open/Closed: new enrichment/optimization strategies via interface swapping
 * - Liskov Substitution: any IPlacesService/IRouteService impl can be used
 * - Interface Segregation: ITripService exposes only trip-level operations
 * - Dependency Inversion: depends on abstractions (interfaces), not concretions
 */
export class TripService implements ITripService {
    constructor(
        private readonly tripRepo: ITripRepository,
        private readonly placesService: IPlacesService,
        private readonly routeService: IRouteService
    ) {}

    /**
     * Save a complete AI-generated trip.
     * Pipeline: AI JSON → Place Enrichment → Route Optimization → DB Save
     */
    async saveTripFromChat(
        userId: string,
        tripPlanJson: any,
        meta: { startDate: string; endDate: string }
    ): Promise<Trip> {
        const tripPlan = tripPlanJson?.trip_plan || tripPlanJson;
        const destination = tripPlan?.destination || "Unknown";

        // 1. Enrich places with Geoapify + OpenTripMap
        let enrichedData = tripPlanJson;
        try {
            enrichedData = await this.placesService.enrichItinerary(tripPlanJson, destination);
        } catch (e) {
            console.warn("Place enrichment skipped (no API key or error):", e);
        }

        // 2. Optimize routes per day (TSP solver)
        let optimizedData = enrichedData;
        try {
            optimizedData = this.routeService.optimizeItinerary(enrichedData);
        } catch (e) {
            console.warn("Route optimization skipped:", e);
        }

        // 3. Persist to database
        const tripData: Prisma.TripUncheckedCreateInput = {
            userId,
            title: `Trip to ${destination}`,
            destination,
            startDate: new Date(meta.startDate || Date.now()),
            endDate: new Date(meta.endDate || Date.now()),
            budget: tripPlan?.budget || "Medium",
            groupSize: tripPlan?.group_size || "Solo",
            travelStyle: "Sightseeing",
            itinerary: optimizedData,
            isPublic: false,
        };

        return this.tripRepo.createTrip(tripData);
    }

    /**
     * Legacy method — generates with placeholder (kept for backwards compat).
     */
    async generateAndSaveTrip(userId: string, params: TripGenerationParams): Promise<Trip> {
        const tripData: Prisma.TripUncheckedCreateInput = {
            userId,
            title: `Trip to ${params.destination}`,
            destination: params.destination,
            startDate: params.startDate,
            endDate: params.endDate,
            budget: params.budget,
            groupSize: params.travelers || "Solo",
            travelStyle: params.travelStyle || "Sightseeing",
            itinerary: { days: [] },
            isPublic: false,
        };

        return this.tripRepo.createTrip(tripData);
    }

    async getTripDetails(tripId: string): Promise<Trip | null> {
        return this.tripRepo.getTripById(tripId);
    }

    async getUserTrips(userId: string): Promise<Trip[]> {
        return this.tripRepo.getUserTrips(userId);
    }

    async getCommunityTrips(limit: number = 20): Promise<Trip[]> {
        return this.tripRepo.getPublicTrips(limit);
    }

    /**
     * Toggle a trip's public/private visibility (owner only).
     */
    async togglePublic(tripId: string, userId: string): Promise<Trip> {
        const trip = await this.guardOwnership(tripId, userId);
        return this.tripRepo.updateTrip(tripId, { isPublic: !trip.isPublic });
    }

    /**
     * Delete a trip (owner only).
     */
    async deleteTrip(tripId: string, userId: string): Promise<Trip> {
        await this.guardOwnership(tripId, userId);
        return this.tripRepo.deleteTrip(tripId);
    }

    /**
     * Fork (deep copy) a public trip for the current user.
     */
    async forkTrip(userId: string, originalTripId: string): Promise<Trip> {
        const originalTrip = await this.tripRepo.getTripById(originalTripId);
        if (!originalTrip) throw new Error("Original trip not found.");
        if (!originalTrip.isPublic && originalTrip.userId !== userId) {
            throw new Error("Cannot fork a private trip you don't own.");
        }

        // Increment fork count on original
        await this.tripRepo.updateTrip(originalTripId, {
            forkCount: { increment: 1 },
        });

        const newTripData: Prisma.TripUncheckedCreateInput = {
            userId,
            title: `Copy of ${originalTrip.title}`,
            destination: originalTrip.destination,
            startDate: originalTrip.startDate,
            endDate: originalTrip.endDate,
            budget: originalTrip.budget,
            groupSize: (originalTrip as any).groupSize,
            travelStyle: (originalTrip as any).travelStyle,
            itinerary: originalTrip.itinerary as Prisma.InputJsonValue,
            isPublic: false,
            forkedFrom: originalTrip.id,
        };

        return this.tripRepo.createTrip(newTripData);
    }

    /**
     * Run route optimization on an existing saved trip.
     */
    async optimizeTrip(tripId: string, userId: string): Promise<Trip> {
        const trip = await this.guardOwnership(tripId, userId);
        const optimized = this.routeService.optimizeItinerary(trip.itinerary);
        return this.tripRepo.updateTrip(tripId, { itinerary: optimized });
    }

    // ── Private guards ──

    private async guardOwnership(tripId: string, userId: string): Promise<Trip> {
        const trip = await this.tripRepo.getTripById(tripId);
        if (!trip) throw new Error("Trip not found.");
        if (trip.userId !== userId) throw new Error("Unauthorized.");
        return trip;
    }
}
