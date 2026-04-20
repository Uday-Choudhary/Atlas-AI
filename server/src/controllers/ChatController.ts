import { Response } from "express";
import { AIService, type ClientMessage } from "../services/AIService";
import { placesService } from "../config/container";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../prisma";

const FREE_TRIP_LIMIT = 2;

export class ChatController {
    static async chat(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user.id;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, planType: true, freeTripsUsed: true },
            });

            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            if (user.planType === "free" && user.freeTripsUsed >= FREE_TRIP_LIMIT) {
                res.status(402).json({
                    error: "free_limit_reached",
                    message: "You have used your 2 free AI trips. Please upgrade to Pro for unlimited planning.",
                    freeTripsUsed: user.freeTripsUsed,
                    freeTripsLeft: 0,
                });
                return;
            }

            const messages = req.body.messages as ClientMessage[];
            const response = await AIService.chat(messages);
            const tripPlan = response?.trip_plan || response;

            if (response?.trip_plan && tripPlan?.destination) {
                let freeTripsUsed = user.freeTripsUsed;

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
                        res.status(402).json({
                            error: "free_limit_reached",
                            message: "You have used your 2 free AI trips. Please upgrade to Pro for unlimited planning.",
                            freeTripsUsed: FREE_TRIP_LIMIT,
                            freeTripsLeft: 0,
                        });
                        return;
                    }

                    freeTripsUsed += 1;
                }

                const enrichedResponse = await placesService.enrichItinerary(response, tripPlan.destination);
                res.json({
                    ...enrichedResponse,
                    usage: {
                        freeTripsUsed,
                        freeTripsLeft: user.planType === "free" ? Math.max(0, FREE_TRIP_LIMIT - freeTripsUsed) : null,
                        planType: user.planType,
                    },
                });
                return;
            }

            res.json(response);
        } catch (error: any) {
            console.error("Error in AI chat route:", error);

            const message = error.message || "Unknown error";
            const isQuotaError = message.includes("429") || message.toLowerCase().includes("quota");

            res.status(isQuotaError ? 429 : 500).json({
                error: isQuotaError
                    ? "AI request quota exceeded. Please wait a bit and try again."
                    : "Internal server error",
                details: message,
            });
        }
    }
}
