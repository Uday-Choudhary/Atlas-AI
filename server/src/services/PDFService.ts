import PDFDocument from "pdfkit";

/**
 * IPDFService — Interface for document generation (Dependency Inversion Principle).
 */
export interface IPDFService {
    generateTripPDF(trip: any): Promise<Buffer>;
}

/**
 * PDFService — Server-side PDF generation for trip vouchers.
 * Single Responsibility: rendering trip data into branded PDF documents.
 * Open/Closed: extend via IPDFService for alternative formats (e.g., DOCX, HTML).
 */
export class PDFService implements IPDFService {
    private readonly brandColor: string;
    private readonly darkColor: string;
    private readonly grayColor: string;
    private readonly lightGray: string;

    constructor(options?: { brandColor?: string }) {
        this.brandColor = options?.brandColor || "#6C3CE0";
        this.darkColor = "#1a1a2e";
        this.grayColor = "#666666";
        this.lightGray = "#f0f0f0";
    }

    /**
     * Generate a branded PDF buffer for a trip.
     */
    async generateTripPDF(trip: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: "A4",
                margin: 50,
                info: {
                    Title: `${trip.title} — Atlas AI Travel Voucher`,
                    Author: "Atlas AI",
                    Subject: `Travel itinerary for ${trip.destination}`,
                },
            });

            const chunks: Buffer[] = [];
            doc.on("data", (chunk: Buffer) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", reject);

            let y = this.renderHeader(doc, trip);
            y = this.renderTripInfoGrid(doc, trip, y);
            y = this.renderHotels(doc, trip, y);
            y = this.renderItinerary(doc, trip, y);
            this.renderFooter(doc);

            doc.end();
        });
    }

    // ── Private rendering methods (SRP — each handles one section) ──

    private renderHeader(doc: PDFKit.PDFDocument, trip: any): number {
        doc.rect(0, 0, doc.page.width, 120).fill(this.brandColor);
        doc.fontSize(32).fillColor("#ffffff").text("Atlas AI", 50, 35, { align: "left" });
        doc.fontSize(12).fillColor("rgba(255,255,255,0.8)").text("Intelligent Travel Operating System", 50, 75, { align: "left" });
        doc.moveDown(2);

        let y = 140;
        doc.fontSize(24).fillColor(this.darkColor).text(trip.title, 50, y);
        return y + 40;
    }

    private renderTripInfoGrid(doc: PDFKit.PDFDocument, trip: any, y: number): number {
        const infoItems = [
            { label: "Destination", value: trip.destination },
            { label: "Dates", value: `${new Date(trip.startDate).toLocaleDateString()} — ${new Date(trip.endDate).toLocaleDateString()}` },
            { label: "Budget", value: trip.budget },
            { label: "Group", value: trip.groupSize || "N/A" },
            { label: "Style", value: trip.travelStyle || "N/A" },
        ];

        doc.roundedRect(50, y, doc.page.width - 100, 70, 8).fill(this.lightGray);
        let infoX = 65;
        for (const item of infoItems) {
            doc.fontSize(8).fillColor(this.grayColor).text(item.label.toUpperCase(), infoX, y + 12);
            doc.fontSize(11).fillColor(this.darkColor).text(item.value, infoX, y + 26);
            infoX += 100;
        }
        return y + 90;
    }

    private renderHotels(doc: PDFKit.PDFDocument, trip: any, y: number): number {
        const itinerary = trip.itinerary?.trip_plan || trip.itinerary;
        if (!itinerary?.hotels || itinerary.hotels.length === 0) return y;

        doc.fontSize(16).fillColor(this.brandColor).text("🏨 Hotels", 50, y);
        y += 25;

        for (const hotel of itinerary.hotels) {
            doc.fontSize(12).fillColor(this.darkColor).text(hotel.hotel_name, 50, y);
            y += 16;
            doc.fontSize(9).fillColor(this.grayColor).text(
                `${hotel.hotel_address} · ${hotel.price_per_night}/night · ⭐ ${hotel.rating || "N/A"}`, 50, y
            );
            y += 20;
        }
        return y + 10;
    }

    private renderItinerary(doc: PDFKit.PDFDocument, trip: any, y: number): number {
        const itinerary = trip.itinerary?.trip_plan || trip.itinerary;
        const days = itinerary?.itinerary || [];

        for (const day of days) {
            if (y > doc.page.height - 150) {
                doc.addPage();
                y = 50;
            }

            // Day header
            doc.roundedRect(50, y, doc.page.width - 100, 30, 6).fill(this.brandColor);
            doc.fontSize(13).fillColor("#ffffff").text(
                `Day ${day.day} — ${day.day_plan || "Exploration"}`, 60, y + 8
            );
            y += 45;

            for (const activity of day.activities || []) {
                y = this.renderActivity(doc, activity, y);
            }
            y += 10;
        }

        return y;
    }

    private renderActivity(doc: PDFKit.PDFDocument, activity: any, y: number): number {
        if (y > doc.page.height - 100) {
            doc.addPage();
            y = 50;
        }

        doc.fontSize(12).fillColor(this.darkColor).text(`📍 ${activity.place_name}`, 65, y);
        y += 16;

        if (activity.place_details) {
            doc.fontSize(9).fillColor(this.grayColor).text(activity.place_details, 75, y, {
                width: doc.page.width - 150,
                lineGap: 2,
            });
            y += doc.heightOfString(activity.place_details, { width: doc.page.width - 150 }) + 6;
        }

        const meta = [
            activity.place_address && `📫 ${activity.place_address}`,
            activity.ticket_pricing && `🎫 ${activity.ticket_pricing}`,
            activity.best_time_to_visit && `⏰ ${activity.best_time_to_visit}`,
            activity.time_travel_each_location && `⏱️ ${activity.time_travel_each_location}`,
        ].filter(Boolean).join("  ·  ");

        if (meta) {
            doc.fontSize(8).fillColor(this.grayColor).text(meta, 75, y, { width: doc.page.width - 150 });
            y += 14;
        }

        doc.moveTo(75, y).lineTo(doc.page.width - 75, y).strokeColor("#e0e0e0").lineWidth(0.5).stroke();
        return y + 12;
    }

    private renderFooter(doc: PDFKit.PDFDocument): void {
        doc.fontSize(8).fillColor(this.grayColor).text(
            `Generated by Atlas AI — ${new Date().toLocaleDateString()} | atlas-ai.com`,
            50, doc.page.height - 50,
            { align: "center", width: doc.page.width - 100 }
        );
    }
}
