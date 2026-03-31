import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import arcjet, { shield, tokenBucket } from "@arcjet/node";

import chatRoutes from "./routes/chat";
import authRoutes from "./routes/auth";
import tripRoutes from "./routes/trip";
import calendarRoutes from "./routes/calendar";
import stripeRoutes from "./routes/stripe";

const app = express();
const port = process.env.PORT || 3001;
const hasArcjetKey = Boolean(process.env.ARCJET_KEY && process.env.ARCJET_KEY !== "ajkey_placeholder");
const fallbackHits = new Map<string, { count: number; resetAt: number }>();
const FALLBACK_RATE_LIMIT = 60;
const FALLBACK_RATE_WINDOW_MS = 60_000;

const fallbackRateLimit = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const clientId = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const hit = fallbackHits.get(clientId);

    if (!hit || hit.resetAt <= now) {
        fallbackHits.set(clientId, { count: 1, resetAt: now + FALLBACK_RATE_WINDOW_MS });
        return next();
    }

    hit.count += 1;

    if (hit.count > FALLBACK_RATE_LIMIT) {
        return res.status(429).json({
            error: "Too Many Requests",
            message: "Rate limit exceeded. Please wait a minute and try again.",
        });
    }

    next();
};

// Arcjet rate limiting & bot protection
const aj = arcjet({
    key: process.env.ARCJET_KEY || "ajkey_placeholder", // Get your key from arcjet.com
    rules: [
        shield({ mode: "LIVE" }), // General bot protection
        tokenBucket({
            mode: "LIVE",
            refillRate: 60, // 60 requests per minute
            interval: 60,
            capacity: 60,
        }),
    ],
});

// Security headers
app.use(helmet());

// CORS configuration - restrict to frontend URL in production
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

// Stripe webhooks need raw body, so we mount it BEFORE express.json()
app.use("/api/stripe/webhook", express.raw({ type: 'application/json' }), stripeRoutes);

// Apply Arcjet globally AFTER we bypass the webhook
app.use(async (req, res, next) => {
    // Skip arcjet for webhooks to avoid interfering with Stripe's requests
    if (req.path === "/api/stripe/webhook") {
        return next();
    }

    if (!hasArcjetKey) {
        return fallbackRateLimit(req, res, next);
    }
    
    try {
        const decision = await aj.protect(req, { requested: 1 });
        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ error: "Too Many Requests", reason: decision.reason });
            } else if (decision.reason.isBot()) {
                return res.status(403).json({ error: "No bots allowed" });
            } else {
                return res.status(403).json({ error: "Forbidden" });
            }
        }
        next();
    } catch (err) {
        console.error("Arcjet error:", err);
        return fallbackRateLimit(req, res, next);
    }
});

app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/stripe", stripeRoutes); // (webhook is already mounted above, this mounts /checkout and /status)
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/calendar", calendarRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "Atlas AI API", version: "1.0.0" });
});

app.listen(port, () => {
    console.log(`🚀 Atlas AI server running on port ${port}`);
});
