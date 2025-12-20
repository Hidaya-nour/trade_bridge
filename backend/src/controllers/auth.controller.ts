import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const result = await AuthService.register(req.body);
            return res.status(201).json(result);
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            return res.json(result);
        } catch (error: any) {
            return res.status(401).json({ message: error.message });
        }
    }

    static async getMe(req: AuthRequest, res: Response) {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        res.json({ user: req.user });
    };

}
