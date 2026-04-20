import { Request, Response } from "express";
import { calendarService, tripService } from "../config/container";
import { AuthRequest } from "../middleware/authMiddleware";

export class CalendarController {
    static getAuthUrl(req: AuthRequest, res: Response) {
        try {
            const userId = req.user.id;
            const url = calendarService.getAuthUrl(userId);
            res.json({ url });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async callback(req: Request, res: Response): Promise<void> {
        try {
            const code = req.query.code as string;
            if (!code) {
                res.status(400).json({ error: "No code provided" });
                return;
            }

            const tokens = await calendarService.getTokensFromCode(code);

            const redirectUrl = `http://localhost:5173/calendar-callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token || ""}`;
            res.redirect(redirectUrl);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    static async sync(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { accessToken, refreshToken } = req.body;
            if (!accessToken) {
                res.status(400).json({ error: "Access token required" });
                return;
            }

            const trip = await tripService.getTripDetails(req.params.tripId as string);
            if (!trip) {
                res.status(404).json({ error: "Trip not found" });
                return;
            }

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
    }
}
