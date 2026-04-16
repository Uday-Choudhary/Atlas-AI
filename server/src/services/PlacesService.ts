/**
 * IPlacesService — Interface for place enrichment (Dependency Inversion Principle).
 */
export interface IPlacesService {
    enrichPlace(placeName: string, nearLocation?: string): Promise<EnrichedPlace>;
    enrichItinerary(itinerary: any, destination: string): Promise<any>;
}

type GeoapifyFeature = {
    properties?: {
        name?: string;
        formatted?: string;
        address_line1?: string;
        address_line2?: string;
        place_id?: string;
        lat?: number;
        lon?: number;
        rank?: {
            confidence?: number;
            popularity?: number;
        };
    };
    geometry?: {
        coordinates?: [number, number];
    };
};

type OpenTripMapFeature = {
    properties?: {
        xid?: string;
        name?: string;
        dist?: number;
        rate?: number | string;
    };
    geometry?: {
        coordinates?: [number, number];
    };
};

type OpenTripMapDetails = {
    xid?: string;
    name?: string;
    rate?: number | string;
    preview?: {
        source?: string;
    };
    image?: string;
    point?: {
        lat?: number;
        lon?: number;
    };
    address?: Record<string, string | undefined>;
    wikipedia_extracts?: {
        text?: string;
    };
};

/**
 * PlacesService — hybrid Geoapify + OpenTripMap place enrichment.
 *
 * Geoapify is used first for dependable place lookup, address, and coordinates.
 * OpenTripMap is then used for travel-specific photos/details when a nearby
 * tourist attraction match is available.
 */
export class PlacesService implements IPlacesService {
    private readonly geoapifyApiKey: string;
    private readonly openTripMapApiKey: string;
    private readonly cache: Map<string, EnrichedPlace>;

    constructor(options?: { geoapifyApiKey?: string; openTripMapApiKey?: string }) {
        this.geoapifyApiKey = options?.geoapifyApiKey || process.env.GEOAPIFY_API_KEY || "";
        this.openTripMapApiKey = options?.openTripMapApiKey || process.env.OPENTRIPMAP_API_KEY || "";
        this.cache = new Map();
    }

    /**
     * Search for a place by name and enrich it with hybrid provider data.
     */
    async enrichPlace(placeName: string, nearLocation?: string): Promise<EnrichedPlace> {
        const normalizedPlaceName = placeName.trim();
        const cacheKey = `${normalizedPlaceName.toLowerCase()}-${nearLocation?.toLowerCase() || ""}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        if (!this.geoapifyApiKey && !this.openTripMapApiKey) {
            return this.createFallbackPlace(normalizedPlaceName);
        }

        try {
            const geoapifyPlace = await this.searchGeoapify(normalizedPlaceName, nearLocation);
            const openTripMapPlace = await this.searchOpenTripMap(
                normalizedPlaceName,
                nearLocation,
                geoapifyPlace
            );

            const enriched = this.mergeProviderData(normalizedPlaceName, geoapifyPlace, openTripMapPlace);
            this.cache.set(cacheKey, enriched);
            return enriched;
        } catch (error) {
            console.error(`PlacesService: Failed to enrich "${normalizedPlaceName}":`, error);
            return this.createFallbackPlace(normalizedPlaceName);
        }
    }

    /**
     * Enrich an entire itinerary's activities with real place data.
     */
    async enrichItinerary(itinerary: any, destination: string): Promise<any> {
        if (!itinerary?.trip_plan?.itinerary) return itinerary;

        const enrichedItinerary = JSON.parse(JSON.stringify(itinerary));

        for (const day of enrichedItinerary.trip_plan.itinerary) {
            if (!day.activities) continue;
            for (let i = 0; i < day.activities.length; i++) {
                const activity = day.activities[i];
                const enriched = await this.enrichPlace(activity.place_name, destination);
                this.applyEnrichmentToActivity(activity, enriched);
            }
        }

        if (enrichedItinerary.trip_plan.hotels) {
            for (let i = 0; i < enrichedItinerary.trip_plan.hotels.length; i++) {
                const hotel = enrichedItinerary.trip_plan.hotels[i];
                const enriched = await this.enrichPlace(hotel.hotel_name, destination);
                this.applyEnrichmentToHotel(hotel, enriched);
            }
        }

        return enrichedItinerary;
    }

    private async searchGeoapify(placeName: string, nearLocation?: string): Promise<EnrichedPlace | null> {
        if (!this.geoapifyApiKey) return null;

        const query = nearLocation ? `${placeName}, ${nearLocation}` : placeName;
        const url = new URL("https://api.geoapify.com/v1/geocode/search");
        url.searchParams.set("text", query);
        url.searchParams.set("limit", "1");
        url.searchParams.set("format", "geojson");
        url.searchParams.set("apiKey", this.geoapifyApiKey);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Geoapify lookup failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as { features?: GeoapifyFeature[] };
        const feature = data.features?.[0];
        if (!feature) return null;

        return this.mapGeoapifyPlace(feature, placeName);
    }

    private async searchOpenTripMap(
        placeName: string,
        nearLocation?: string,
        geoapifyPlace?: EnrichedPlace | null
    ): Promise<EnrichedPlace | null> {
        if (!this.openTripMapApiKey) return null;

        const coordinates = geoapifyPlace?.latitude && geoapifyPlace.longitude
            ? { latitude: geoapifyPlace.latitude, longitude: geoapifyPlace.longitude }
            : await this.getOpenTripMapCoordinates(nearLocation || placeName);

        if (!coordinates) return null;

        const url = new URL("https://api.opentripmap.com/0.1/en/places/autosuggest");
        url.searchParams.set("name", placeName);
        url.searchParams.set("lat", String(coordinates.latitude));
        url.searchParams.set("lon", String(coordinates.longitude));
        url.searchParams.set("radius", "50000");
        url.searchParams.set("limit", "1");
        url.searchParams.set("apikey", this.openTripMapApiKey);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`OpenTripMap autosuggest failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as { features?: OpenTripMapFeature[] };
        const feature = data.features?.find((item) => item.properties?.xid);
        const xid = feature?.properties?.xid;
        if (!xid) return null;

        const details = await this.getOpenTripMapDetails(xid);
        return this.mapOpenTripMapPlace(details, feature, placeName);
    }

    private async getOpenTripMapCoordinates(location: string): Promise<{ latitude: number; longitude: number } | null> {
        if (!location) return null;

        const url = new URL("https://api.opentripmap.com/0.1/en/places/geoname");
        url.searchParams.set("name", location);
        url.searchParams.set("apikey", this.openTripMapApiKey);

        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json() as { lat?: number; lon?: number };
        if (typeof data.lat !== "number" || typeof data.lon !== "number") return null;

        return { latitude: data.lat, longitude: data.lon };
    }

    private async getOpenTripMapDetails(xid: string): Promise<OpenTripMapDetails | null> {
        const url = new URL(`https://api.opentripmap.com/0.1/en/places/xid/${encodeURIComponent(xid)}`);
        url.searchParams.set("apikey", this.openTripMapApiKey);

        const response = await fetch(url);
        if (!response.ok) return null;

        return await response.json() as OpenTripMapDetails;
    }

    private mapGeoapifyPlace(feature: GeoapifyFeature, fallbackName: string): EnrichedPlace {
        const properties = feature.properties || {};
        const coordinates = feature.geometry?.coordinates;
        const longitude = typeof properties.lon === "number" ? properties.lon : coordinates?.[0] || null;
        const latitude = typeof properties.lat === "number" ? properties.lat : coordinates?.[1] || null;
        const confidence = properties.rank?.confidence;
        const popularity = properties.rank?.popularity;

        return {
            name: properties.name || properties.address_line1 || fallbackName,
            photoUrl: null,
            rating: this.normalizeGeoapifyRating(confidence || popularity),
            latitude,
            longitude,
            address: properties.formatted || [properties.address_line1, properties.address_line2].filter(Boolean).join(", ") || null,
            placeId: properties.place_id || null,
            description: null,
            source: "geoapify",
        };
    }

    private mapOpenTripMapPlace(
        details: OpenTripMapDetails | null,
        feature: OpenTripMapFeature,
        fallbackName: string
    ): EnrichedPlace {
        const point = details?.point;
        const coordinates = feature.geometry?.coordinates;

        return {
            name: details?.name || feature.properties?.name || fallbackName,
            photoUrl: details?.preview?.source || details?.image || null,
            rating: this.normalizeOpenTripMapRating(details?.rate || feature.properties?.rate),
            latitude: typeof point?.lat === "number" ? point.lat : coordinates?.[1] || null,
            longitude: typeof point?.lon === "number" ? point.lon : coordinates?.[0] || null,
            address: this.formatOpenTripMapAddress(details?.address),
            placeId: details?.xid || feature.properties?.xid || null,
            description: details?.wikipedia_extracts?.text || null,
            source: "opentripmap",
        };
    }

    private mergeProviderData(
        fallbackName: string,
        geoapifyPlace: EnrichedPlace | null,
        openTripMapPlace: EnrichedPlace | null
    ): EnrichedPlace {
        return {
            name: geoapifyPlace?.name || openTripMapPlace?.name || fallbackName,
            photoUrl: openTripMapPlace?.photoUrl || geoapifyPlace?.photoUrl || null,
            rating: openTripMapPlace?.rating || geoapifyPlace?.rating || null,
            latitude: geoapifyPlace?.latitude || openTripMapPlace?.latitude || null,
            longitude: geoapifyPlace?.longitude || openTripMapPlace?.longitude || null,
            address: geoapifyPlace?.address || openTripMapPlace?.address || null,
            placeId: geoapifyPlace?.placeId || openTripMapPlace?.placeId || null,
            description: openTripMapPlace?.description || geoapifyPlace?.description || null,
            source: [geoapifyPlace?.source, openTripMapPlace?.source].filter(Boolean).join("+") || null,
        };
    }

    private createFallbackPlace(placeName: string): EnrichedPlace {
        return {
            name: placeName,
            photoUrl: null,
            rating: null,
            latitude: null,
            longitude: null,
            address: null,
            placeId: null,
            description: null,
            source: null,
        };
    }

    private normalizeGeoapifyRating(value?: number): number | null {
        if (typeof value !== "number") return null;
        return Math.round(Math.min(Math.max(value, 0), 1) * 50) / 10;
    }

    private normalizeOpenTripMapRating(value?: number | string): number | null {
        const numericValue = typeof value === "string" ? Number(value) : value;
        if (typeof numericValue !== "number" || Number.isNaN(numericValue)) return null;
        return Math.round((Math.min(Math.max(numericValue, 0), 7) / 7) * 50) / 10;
    }

    private formatOpenTripMapAddress(address?: Record<string, string | undefined>): string | null {
        if (!address) return null;

        const parts = [
            address.road,
            address.suburb,
            address.city || address.town || address.village,
            address.state,
            address.country,
        ];

        return parts.filter(Boolean).join(", ") || null;
    }

    private applyEnrichmentToActivity(activity: any, enriched: EnrichedPlace): void {
        if (enriched.photoUrl) activity.place_image_url = enriched.photoUrl;
        if (enriched.rating) activity.rating = enriched.rating;
        if (enriched.latitude && enriched.longitude) {
            activity.geo_coordinates = {
                latitude: enriched.latitude,
                longitude: enriched.longitude,
            };
        }
        if (enriched.address) activity.place_address = enriched.address;
        if (enriched.description) activity.place_details = enriched.description;
        if (enriched.placeId) activity.place_id = enriched.placeId;
        if (enriched.source) activity.place_data_source = enriched.source;
    }

    private applyEnrichmentToHotel(hotel: any, enriched: EnrichedPlace): void {
        if (enriched.photoUrl) hotel.hotel_image_url = enriched.photoUrl;
        if (enriched.rating) hotel.rating = enriched.rating;
        if (enriched.latitude && enriched.longitude) {
            hotel.geo_coordinates = {
                latitude: enriched.latitude,
                longitude: enriched.longitude,
            };
        }
        if (enriched.address) hotel.hotel_address = enriched.address;
        if (enriched.description) hotel.description = enriched.description;
        if (enriched.placeId) hotel.place_id = enriched.placeId;
        if (enriched.source) hotel.place_data_source = enriched.source;
    }
}

export interface EnrichedPlace {
    name: string;
    photoUrl: string | null;
    rating: number | null;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    placeId: string | null;
    description: string | null;
    source: string | null;
}
