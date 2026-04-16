import { Router } from "express";
import { StripeService } from "../services/StripeService";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import express from "express";
import { UserRepository } from "../repositories/UserRepository";
import { prisma } from "../prisma";

const router = Router();

router.post("/checkout", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user.id;
        const email = req.user.email;
        const url = await StripeService.createCheckoutSession(userId, email);
        res.json({ url });
    } catch (error: any) {
        console.error("Stripe checkout error:", error);
        res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
});

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const signature = req.headers["stripe-signature"];
    try {
        if (!signature) {
            return res.status(400).send("No signature block found");
        }
        await StripeService.handleWebhookEvent(req.body, signature as string);
        res.json({ received: true });
    } catch (error: any) {
        console.error("Webhook Error:", error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

router.get("/status", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user.id;
        // Fetch fresh user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { planType: true, subscriptionStatus: true, freeTripsUsed: true }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
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
});

export default router;
