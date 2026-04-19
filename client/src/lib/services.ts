import api from "./api";

/**
 * TripApiService — Client-side service class for trip API operations.
 * Single Responsibility: encapsulates all trip-related HTTP calls.
 * Open/Closed: extend for caching, offline support, etc.
 */
export class TripApiService {
    /**
     * Save a new trip from AI chat output.
     */
    async saveFromChat(tripPlan: any, startDate: string, endDate: string) {
        const res = await api.post("/api/trips/save", { tripPlan, startDate, endDate });
        return res.data;
    }

    /**
     * Fetch all trips for the current authenticated user.
     */
    async getUserTrips() {
        const res = await api.get("/api/trips/user");
        return res.data;
    }

    /**
     * Fetch community (public) trips.
     */
    async getCommunityTrips(limit: number = 50) {
        const res = await api.get(`/api/trips/community?limit=${limit}`);
        return res.data;
    }

    /**
     * Get a single trip by ID.
     */
    async getTripById(id: string) {
        const res = await api.get(`/api/trips/${id}`);
        return res.data;
    }

    /**
     * Toggle public/private visibility.
     */
    async togglePublic(tripId: string) {
        const res = await api.patch(`/api/trips/${tripId}/publish`);
        return res.data;
    }

    /**
     * Optimize route for a trip.
     */
    async optimizeRoute(tripId: string) {
        const res = await api.post(`/api/trips/${tripId}/optimize`);
        return res.data;
    }

    /**
     * Download trip PDF as a Blob.
     */
    async downloadPDF(tripId: string): Promise<Blob> {
        const res = await api.get(`/api/trips/${tripId}/pdf`, { responseType: "blob" });
        return res.data;
    }

    /**
     * Fork a community trip to the user's account.
     */
    async forkTrip(tripId: string) {
        const res = await api.post(`/api/trips/fork/${tripId}`);
        return res.data;
    }

    /**
     * Delete a trip.
     */
    async deleteTrip(tripId: string) {
        const res = await api.delete(`/api/trips/${tripId}`);
        return res.data;
    }
}

/**
 * CalendarApiService — Client-side service for calendar operations.
 */
export class CalendarApiService {
    /**
     * Get the Google OAuth2 authorization URL.
     */
    async getAuthUrl(): Promise<string> {
        const res = await api.get("/api/calendar/auth-url");
        return res.data.url;
    }

    /**
     * Sync a trip's events to the user's Google Calendar.
     */
    async syncTrip(tripId: string, accessToken: string, refreshToken?: string) {
        const res = await api.post(`/api/calendar/sync/${tripId}`, {
            accessToken,
            refreshToken,
        });
        return res.data;
    }
}

// ── Export singleton instances (Composition Root for client) ──
export const tripApi = new TripApiService();
export const calendarApi = new CalendarApiService();
