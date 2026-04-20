import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import express from "express";
import { StripeController } from "../controllers/StripeController";

const router = Router();

router.post("/checkout", authenticateToken, StripeController.checkout as any);
router.post("/webhook", express.raw({ type: "application/json" }), StripeController.webhook as any);
router.get("/status", authenticateToken, StripeController.status as any);

export default router;
