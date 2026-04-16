/**
 * IRouteService — Interface for route optimization (Dependency Inversion Principle).
 */
export interface IRouteService {
    optimizeRoute(activities: Activity[]): OptimizedRoute;
    optimizeItinerary(itinerary: any): any;
}

/**
 * RouteService — TSP (Traveling Salesman Problem) solver for daily itineraries.
 * Single Responsibility: route optimization using geospatial algorithms.
 * Open/Closed: extend via IRouteService for alternative solvers (e.g., 2-opt, genetic).
 */
export class RouteService implements IRouteService {
    private static readonly EARTH_RADIUS_KM = 6371;

    /**
     * Nearest-neighbor TSP solver.
     * Takes activities with geo_coordinates and returns them in optimized travel order.
     */
    optimizeRoute(activities: Activity[]): OptimizedRoute {
        const validActivities = activities.filter(
            (a) => a.geo_coordinates?.latitude && a.geo_coordinates?.longitude
        );

        if (validActivities.length <= 2) {
            return {
                optimizedActivities: activities,
                totalDistanceKm: this.calculateTotalDistance(activities),
                savings: 0,
            };
        }

        const originalDistance = this.calculateTotalDistance(validActivities);
        const result = this.nearestNeighborSolve(validActivities);
        const optimizedDistance = this.calculateTotalDistance(result);
        const savings = Math.max(0, originalDistance - optimizedDistance);

        return {
            optimizedActivities: result,
            totalDistanceKm: Math.round(optimizedDistance * 100) / 100,
            savings: Math.round(savings * 100) / 100,
        };
    }

    /**
     * Optimizes the routes for an entire itinerary (all days).
     */
    optimizeItinerary(itinerary: any): any {
        if (!itinerary?.trip_plan?.itinerary) return itinerary;

        const optimized = JSON.parse(JSON.stringify(itinerary));

        for (const day of optimized.trip_plan.itinerary) {
            if (!day.activities || day.activities.length <= 2) continue;
            const result = this.optimizeRoute(day.activities);
            day.activities = result.optimizedActivities;
            day.route_distance_km = result.totalDistanceKm;
            day.route_savings_km = result.savings;
        }

        return optimized;
    }

    // ── Private algorithms ──

    private nearestNeighborSolve(activities: Activity[]): Activity[] {
        const visited = new Set<number>();
        const result: Activity[] = [];
        let current = 0;
        visited.add(0);
        result.push(activities[0]);

        while (result.length < activities.length) {
            let nearestIdx = -1;
            let nearestDist = Infinity;

            for (let i = 0; i < activities.length; i++) {
                if (visited.has(i)) continue;

                const dist = this.haversineDistance(
                    activities[current].geo_coordinates.latitude,
                    activities[current].geo_coordinates.longitude,
                    activities[i].geo_coordinates.latitude,
                    activities[i].geo_coordinates.longitude
                );

                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestIdx = i;
                }
            }

            if (nearestIdx === -1) break;
            visited.add(nearestIdx);
            result.push(activities[nearestIdx]);
            current = nearestIdx;
        }

        return result;
    }

    private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return RouteService.EARTH_RADIUS_KM * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    private calculateTotalDistance(activities: Activity[]): number {
        let total = 0;
        for (let i = 0; i < activities.length - 1; i++) {
            const a = activities[i];
            const b = activities[i + 1];
            if (a.geo_coordinates && b.geo_coordinates) {
                total += this.haversineDistance(
                    a.geo_coordinates.latitude,
                    a.geo_coordinates.longitude,
                    b.geo_coordinates.latitude,
                    b.geo_coordinates.longitude
                );
            }
        }
        return total;
    }
}

export interface Activity {
    place_name: string;
    place_details: string;
    place_image_url: string;
    geo_coordinates: {
        latitude: number;
        longitude: number;
    };
    place_address: string;
    ticket_pricing: string;
    time_travel_each_location: string;
    best_time_to_visit: string;
    [key: string]: any;
}

export interface OptimizedRoute {
    optimizedActivities: Activity[];
    totalDistanceKm: number;
    savings: number;
}
