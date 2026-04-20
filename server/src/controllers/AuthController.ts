import { Request, Response } from "express";
import { userService } from "../config/container";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/authMiddleware";

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const user = await userService.registerUser(req.body);
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.AUTH_SECRET as string,
                { expiresIn: "7d" }
            );
            res.json({ success: true, token, user: { id: user.id, email: user.email } });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const user = await userService.authenticateUser(req.body.email, req.body.password);
            const token = jwt.sign(
                { id: user.id, email: user.email, name: user.name },
                process.env.AUTH_SECRET as string,
                { expiresIn: "7d" }
            );
            res.json({ success: true, token, user });
        } catch (error: any) {
            res.status(401).json({ success: false, error: error.message });
        }
    }

    static getMe(req: AuthRequest, res: Response) {
        res.json({ user: req.user });
    }
}
