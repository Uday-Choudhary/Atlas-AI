import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { ChatController } from "../controllers/ChatController";

const router = Router();

router.post("/", authenticateToken, ChatController.chat as any);

export default router;
