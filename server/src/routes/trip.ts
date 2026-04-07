import { Router } from "express";
import { tripService, pdfService } from "../config/container";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../prisma";
import { z } from "zod";
import { validateRequest } from "../middleware/validateRequest";

const router = Router();
const FREE_TRIP_LIMIT = 2;

const saveTripSchema = z.object({
    body: z.object({
        tripPlan: z.any(),
        startDate: z.string().optional().or(z.date()),
        endDate: z.string().optional().or(z.date()),
    })
});

// Save a trip from chat AI output
router.post("/save", authenticateToken, validateRequest(saveTripSchema), async (req: AuthRequest, res) => {
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
});

// Legacy create
router.post("/create", authenticateToken, async (req: AuthRequest, res) => {
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
});

// Get current user's trips
router.get("/user", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user.id;
        const trips = await tripService.getUserTrips(userId);
        res.json(trips);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Community trips
router.get("/community", async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 20;
        const trips = await tripService.getCommunityTrips(limit);
        res.json(trips);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get single trip
router.get("/:id", async (req, res) => {
    try {
        const trip = await tripService.getTripDetails(req.params.id as string);
        if (!trip) return res.status(404).json({ error: "Trip not found" });
        res.json(trip);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle public/private
router.patch("/:id/publish", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user.id;
        const trip = await tripService.togglePublic(req.params.id as string, userId);
        res.json(trip);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Optimize route
router.post("/:id/optimize", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user.id;
        const trip = await tripService.optimizeTrip(req.params.id as string, userId);
        res.json(trip);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Generate PDF
router.get("/:id/pdf", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const trip = await tripService.getTripDetails(req.params.id as string);
        if (!trip) return res.status(404).json({ error: "Trip not found" });

        const pdfBuffer = await pdfService.generateTripPDF(trip);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="atlas-ai-${trip.destination.replace(/[^a-zA-Z0-9]/g, "-")}.pdf"`,
            "Content-Length": pdfBuffer.length,
        });
        res.send(pdfBuffer);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Fork trip
router.post("/fork/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user.id;
        const newTrip = await tripService.forkTrip(userId, req.params.id as string);
        res.json(newTrip);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete trip
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user.id;
        await tripService.deleteTrip(req.params.id as string, userId);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
