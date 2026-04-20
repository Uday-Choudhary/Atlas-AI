import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { CalendarController } from "../controllers/CalendarController";

const router = Router();

router.get("/auth-url", authenticateToken, CalendarController.getAuthUrl as any);
router.get("/callback", CalendarController.callback as any);
router.post("/sync/:tripId", authenticateToken, CalendarController.sync as any);

export default router;
