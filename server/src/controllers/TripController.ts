import { Request, Response } from "express";
import { tripService, pdfService } from "../config/container";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../prisma";

const FREE_TRIP_LIMIT = 2;

export class TripController {
    static async saveTrip(req: AuthRequest, res: Response) {
        try {
            const userId = req.user.id;

            const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
            if (!user) return res.status(404).json({ error: "User not found" });

            const { tripPlan, startDate, endDate } = req.body;
            const trip = await tripService.saveTripFromChat(userId, tripPlan, { startDate, endDate });

            res.json(trip);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createLegacy(req: AuthRequest, res: Response) {
        try {
            const userId = req.user.id;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { planType: true, freeTripsUsed: true },
            });

            if (!user) return res.status(404).json({ error: "User not found" });

            if (user.planType === "free") {
                const usageUpdate = await prisma.user.updateMany({
                    where: {
                        id: userId,
                        planType: "free",
                        freeTripsUsed: { lt: FREE_TRIP_LIMIT },
                    },
                    data: { freeTripsUsed: { increment: 1 } },
                });

                if (usageUpdate.count === 0) {
                    return res.status(402).json({
                        error: "free_limit_reached",
                        message: "You have used your 2 free trips. Please upgrade to Pro.",
                    });
                }
            }

            const trip = await tripService.generateAndSaveTrip(userId, req.body);
            res.json(trip);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getUserTrips(req: AuthRequest, res: Response) {
        try {
            const userId = req.user.id;
            const trips = await tripService.getUserTrips(userId);
            res.json(trips);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getCommunityTrips(req: Request, res: Response) {
        try {
            const limit = Number(req.query.limit) || 20;
            const trips = await tripService.getCommunityTrips(limit);
            res.json(trips);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTrip(req: Request, res: Response) {
        try {
            const trip = await tripService.getTripDetails(req.params.id as string);
            if (!trip) return res.status(404).json({ error: "Trip not found" });
            res.json(trip);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async togglePublish(req: AuthRequest, res: Response) {
        try {
            const userId = req.user.id;
            const trip = await tripService.togglePublic(req.params.id as string, userId);
            res.json(trip);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async optimizeTrip(req: AuthRequest, res: Response) {
        try {
            const userId = req.user.id;
            const trip = await tripService.optimizeTrip(req.params.id as string, userId);
            res.json(trip);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async generatePdf(req: AuthRequest, res: Response) {
        try {
            const trip = await tripService.getTripDetails(req.params.id as string);
            if (!trip) return res.status(404).json({ error: "Trip not found" });

            const pdfBuffer = await pdfService.generateTripPDF(trip);

            res.set({
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="atlas-ai-${trip.destination.replace(/[^a-zA-Z0-9]/g, "-")}.pdf"`,
                "Content-Length": pdfBuffer.length.toString(),
            });
            res.send(pdfBuffer);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async forkTrip(req: AuthRequest, res: Response) {
        try {
            const userId = req.user.id;
            const newTrip = await tripService.forkTrip(userId, req.params.id as string);
            res.json(newTrip);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteTrip(req: AuthRequest, res: Response) {
        try {
            const userId = req.user.id;
            await tripService.deleteTrip(req.params.id as string, userId);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
