import { prisma } from "../prisma";
import type { Trip, Prisma } from "@prisma/client";

/**
 * Interface for Trip data access — follows Interface Segregation Principle.
 * Any data source (DB, API, cache) can implement this contract.
 */
export interface ITripRepository {
    createTrip(data: Prisma.TripUncheckedCreateInput): Promise<Trip>;
    getTripById(id: string): Promise<Trip | null>;
    getUserTrips(userId: string): Promise<Trip[]>;
    getPublicTrips(limit: number): Promise<Trip[]>;
    updateTrip(id: string, data: Prisma.TripUpdateInput): Promise<Trip>;
    deleteTrip(id: string): Promise<Trip>;
    searchPublicTrips(query: string, limit: number): Promise<Trip[]>;
}

/**
 * TripRepository — Prisma-backed implementation of ITripRepository.
 * Single Responsibility: only handles data persistence for Trip entities.
 */
export class TripRepository implements ITripRepository {
    async createTrip(data: Prisma.TripUncheckedCreateInput): Promise<Trip> {
        return prisma.trip.create({ data });
    }

    async getTripById(id: string): Promise<Trip | null> {
        return prisma.trip.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true, profileImage: true },
                },
                places: true,
            },
        });
    }

    async getUserTrips(userId: string): Promise<Trip[]> {
        return prisma.trip.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async getPublicTrips(limit: number = 20): Promise<Trip[]> {
        return prisma.trip.findMany({
            where: { isPublic: true },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                user: {
                    select: { firstName: true, lastName: true, profileImage: true },
                },
            },
        });
    }

    async updateTrip(id: string, data: Prisma.TripUpdateInput): Promise<Trip> {
        return prisma.trip.update({
            where: { id },
            data,
        });
    }

    async deleteTrip(id: string): Promise<Trip> {
        return prisma.trip.delete({
            where: { id },
        });
    }

    async searchPublicTrips(query: string, limit: number = 20): Promise<Trip[]> {
        return prisma.trip.findMany({
            where: {
                isPublic: true,
                OR: [
                    { destination: { contains: query, mode: "insensitive" } },
                    { title: { contains: query, mode: "insensitive" } },
                ],
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                user: {
                    select: { firstName: true, lastName: true, profileImage: true },
                },
            },
        });
    }
}
