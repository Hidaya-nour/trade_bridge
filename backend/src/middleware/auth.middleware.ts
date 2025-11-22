import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../models/user.model";

// Extend Express Request to include user property
export interface AuthRequest extends Request {
    user?: IUser;
}

// Protect middleware: checks for JWT and attaches user
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const token = authHeader.split(" ")[1];

        // Decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & { id: string };

        if (!decoded.id) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Attach user to request
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Role-based authorization middleware
type UserRole = IUser["role"]; // "shop" | "distributor" | "factory" | "admin"

export const authorizeRoles = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Admin can access everything
        if (req.user.role === "admin") return next();

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied: Role '${req.user.role}' is not authorized`,
            });
        }

        next();
    };
};
