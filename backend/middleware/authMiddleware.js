import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
// Middleware for role-based access
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (req.user.role === "admin") return next(); // admins can access everything
        if (!roles.includes(req.user.role)) {
            return res
                .status(403)
                .json({ message: `Access denied: Role '${req.user.role}' is not authorized` });
        }
        next();
    };

};

