import { Router } from "express";
import { calendarService, tripService } from "../config/container";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

/**
 * Get Google OAuth2 authorization URL.
 */
router.get("/auth-url", authenticateToken, (req: AuthRequest, res) => {
    try {
        const userId = req.user.id;
        const url = calendarService.getAuthUrl(userId);
        res.json({ url });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * OAuth2 callback — exchanges code for tokens.
 */
router.get("/callback", async (req, res) => {
    try {
        const code = req.query.code as string;
        if (!code) return res.status(400).json({ error: "No code provided" });

        const tokens = await calendarService.getTokensFromCode(code);

        const redirectUrl = `http://localhost:5173/calendar-callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token || ""}`;
        res.redirect(redirectUrl);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Sync a trip's events to Google Calendar.
 */
router.post("/sync/:tripId", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { accessToken, refreshToken } = req.body;
        if (!accessToken) return res.status(400).json({ error: "Access token required" });

        const trip = await tripService.getTripDetails(req.params.tripId as string);
        if (!trip) return res.status(404).json({ error: "Trip not found" });

        const result = await calendarService.syncToCalendar(
            accessToken,
            refreshToken || null,
            {
                title: trip.title,
                startDate: trip.startDate.toISOString(),
                endDate: trip.endDate.toISOString(),
                itinerary: trip.itinerary,
            }
        );

        res.json({ success: true, ...result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
