import { Request, Response } from "express";
import { StripeService } from "../services/StripeService";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../prisma";

export class StripeController {
    static async checkout(req: AuthRequest, res: Response) {
        try {
            const userId = req.user.id;
            const email = req.user.email;
            const url = await StripeService.createCheckoutSession(userId, email);
            res.json({ url });
        } catch (error: any) {
            console.error("Stripe checkout error:", error);
            res.status(500).json({ error: error.message || "Failed to create checkout session" });
        }
    }

    static async webhook(req: Request, res: Response) {
        const signature = req.headers["stripe-signature"];
        try {
            if (!signature) {
                res.status(400).send("No signature block found");
                return;
            }
            await StripeService.handleWebhookEvent(req.body, signature as string);
            res.json({ received: true });
        } catch (error: any) {
            console.error("Webhook Error:", error.message);
            res.status(400).send(`Webhook Error: ${error.message}`);
        }
    }

    static async status(req: AuthRequest, res: Response) {
        try {
            const userId = req.user.id;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { planType: true, subscriptionStatus: true, freeTripsUsed: true }
            });

            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            res.json({
                planType: user.planType,
                subscriptionStatus: user.subscriptionStatus,
                freeTripsUsed: user.freeTripsUsed,
                freeTripsLeft: Math.max(0, 2 - user.freeTripsUsed)
            });
        } catch (error: any) {
            res.status(500).json({ error: "Failed to fetch status" });
        }
    }
}
