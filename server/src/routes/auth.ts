import { Router } from "express";
import { UserService } from "../services/UserService";
import jwt from "jsonwebtoken";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { z } from "zod";
import { validateRequest } from "../middleware/validateRequest";

const router = Router();

const registerSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string(),
    })
});

router.post("/register", validateRequest(registerSchema), async (req, res) => {
    try {
        const user = await UserService.registerUser(req.body);
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.AUTH_SECRET as string,
            { expiresIn: "7d" }
        );
        res.json({ success: true, token, user: { id: user.id, email: user.email } });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post("/login", validateRequest(loginSchema), async (req, res) => {
    try {
        const user = await UserService.authenticateUser(req.body.email, req.body.password);
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.AUTH_SECRET as string,
            { expiresIn: "7d" }
        );
        res.json({ success: true, token, user });
    } catch (error: any) {
        res.status(401).json({ success: false, error: error.message });
    }
});

router.get("/me", authenticateToken, (req: AuthRequest, res) => {
    res.json({ user: req.user });
});

export default router;
