// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { UserRole } from "../models/user.model";

export interface AuthRequest extends Request {
    user?: {
        user_id: string;
        role: UserRole;
        email: string;
        full_name: string;
        status: string;
    };
}

interface TokenPayload extends JwtPayload {
    user_id: string;
    role: UserRole;
}

export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as TokenPayload;

        if (!decoded.user_id) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        const user = await User.findOne({
            where: { user_id: decoded.user_id },
            attributes: {
                exclude: ["password_hash", "deleted_at"],
            },
        });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                message: `Account is ${user.status}`,
            });
        }

        req.user = {
            user_id: user.user_id,
            role: user.role,
            email: user.email,
            full_name: user.full_name,
            status: user.status,
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Role-based authorization middleware
export const authorizeRoles = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        // Admin override
        if (req.user.role === "admin") {
            return next();
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied for role '${req.user.role}'`,
            });
        }

        next();
    };
};
