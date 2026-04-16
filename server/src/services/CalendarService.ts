import { google } from "googleapis";

/**
 * ICalendarService — Interface for calendar syncing (Dependency Inversion Principle).
 */
export interface ICalendarService {
    getAuthUrl(userId: string): string;
    getTokensFromCode(code: string): Promise<any>;
    syncToCalendar(accessToken: string, refreshToken: string | null, tripData: TripCalendarData): Promise<{ eventsCreated: number }>;
}

/**
 * CalendarService — Google Calendar OAuth2 integration.
 * Single Responsibility: calendar authorization and event creation.
 * Open/Closed: extend via ICalendarService for Outlook, Apple Calendar, etc.
 */
export class CalendarService implements ICalendarService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;

    constructor(options?: { clientId?: string; clientSecret?: string; redirectUri?: string }) {
        this.clientId = options?.clientId || process.env.GOOGLE_CLIENT_ID || "";
        this.clientSecret = options?.clientSecret || process.env.GOOGLE_CLIENT_SECRET || "";
        this.redirectUri = options?.redirectUri || process.env.GOOGLE_REDIRECT_URI || "http://localhost:3001/api/calendar/callback";
    }

    private createOAuth2Client() {
        return new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);
    }

    /**
     * Generate the Google OAuth2 authorization URL for calendar access.
     */
    getAuthUrl(userId: string): string {
        const oauth2Client = this.createOAuth2Client();
        return oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: ["https://www.googleapis.com/auth/calendar.events"],
            state: userId,
            prompt: "consent",
        });
    }

    /**
     * Exchange authorization code for OAuth2 tokens.
     */
    async getTokensFromCode(code: string) {
        const oauth2Client = this.createOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);
        return tokens;
    }

    /**
     * Push trip itinerary events to Google Calendar.
     */
    async syncToCalendar(
        accessToken: string,
        refreshToken: string | null,
        tripData: TripCalendarData
    ): Promise<{ eventsCreated: number }> {
        const oauth2Client = this.createOAuth2Client();
        oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        let eventsCreated = 0;

        const itinerary = tripData.itinerary?.trip_plan?.itinerary || [];
        const startDate = new Date(tripData.startDate);

        for (const day of itinerary) {
            const dayDate = new Date(startDate);
            dayDate.setDate(dayDate.getDate() + (day.day - 1));

            for (const activity of day.activities || []) {
                const created = await this.createCalendarEvent(calendar, dayDate, activity);
                if (created) eventsCreated++;
            }
        }

        return { eventsCreated };
    }

    // ── Private helpers (SRP) ──

    private async createCalendarEvent(calendar: any, dayDate: Date, activity: any): Promise<boolean> {
        const timeStr = activity.best_time_to_visit || "09:00 AM";
        const startTime = this.parseTimeToDate(dayDate, timeStr);
        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

        try {
            await calendar.events.insert({
                calendarId: "primary",
                requestBody: {
                    summary: `🗺️ ${activity.place_name}`,
                    description: `${activity.place_details || ""}\n\n🎫 Ticket: ${activity.ticket_pricing || "N/A"}\n⏱️ Duration: ${activity.time_travel_each_location || "2 hours"}\n\nPowered by Atlas AI`,
                    location: activity.place_address || "",
                    start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
                    end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
                    colorId: "9",
                },
            });
            return true;
        } catch (error) {
            console.error(`CalendarService: Failed to create event for ${activity.place_name}:`, error);
            return false;
        }
    }

    private parseTimeToDate(baseDate: Date, timeStr: string): Date {
        const date = new Date(baseDate);
        const match = timeStr.match(/(\d{1,2})\s*(AM|PM|am|pm)?/);
        if (match) {
            let hour = parseInt(match[1]);
            const period = match[2]?.toUpperCase();
            if (period === "PM" && hour < 12) hour += 12;
            if (period === "AM" && hour === 12) hour = 0;
            date.setHours(hour, 0, 0, 0);
        } else {
            date.setHours(9, 0, 0, 0);
        }
        return date;
    }
}

export interface TripCalendarData {
    title: string;
    startDate: string;
    endDate: string;
    itinerary: any;
}
