import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { z } from "zod";
import { validateRequest } from "../middleware/validateRequest";
import { TripController } from "../controllers/TripController";

const router = Router();

const saveTripSchema = z.object({
    body: z.object({
        tripPlan: z.any(),
        startDate: z.string().optional().or(z.date()),
        endDate: z.string().optional().or(z.date()),
    })
});

router.post("/save", authenticateToken, validateRequest(saveTripSchema), TripController.saveTrip as any);
router.post("/create", authenticateToken, TripController.createLegacy as any);
router.get("/user", authenticateToken, TripController.getUserTrips as any);
router.get("/community", TripController.getCommunityTrips);
router.get("/:id", TripController.getTrip);
router.patch("/:id/publish", authenticateToken, TripController.togglePublish as any);
router.post("/:id/optimize", authenticateToken, TripController.optimizeTrip as any);
router.get("/:id/pdf", authenticateToken, TripController.generatePdf as any);
router.post("/fork/:id", authenticateToken, TripController.forkTrip as any);
router.delete("/:id", authenticateToken, TripController.deleteTrip as any);

export default router;
