/**
 * Composition Root — wires up all service dependencies following Dependency Inversion Principle.
 * 
 * This is the ONLY place where concrete implementations are instantiated and wired together.
 * All other modules depend on abstractions (interfaces), not concretions.
 */
import { TripRepository } from "../repositories/TripRepository";
import { TripService } from "../services/TripService";
import { PlacesService } from "../services/PlacesService";
import { RouteService } from "../services/RouteService";
import { CalendarService } from "../services/CalendarService";
import { PDFService } from "../services/PDFService";
import { StripeService } from "../services/StripeService";

// ── Instantiate concrete implementations ──
const tripRepository = new TripRepository();
const placesService = new PlacesService();
const routeService = new RouteService();
const calendarService = new CalendarService();
const pdfService = new PDFService();

// ── Inject dependencies into services ──
const tripService = new TripService(tripRepository, placesService, routeService);

// ── Export singleton instances for route consumption ──
export { tripService, calendarService, pdfService, routeService, placesService, StripeService };
