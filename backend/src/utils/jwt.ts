import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { UserRole } from "../models/user.model";

interface TokenPayload {
    user_id: string;
    role: UserRole;
}

export const signAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET as Secret,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        } as SignOptions
    );
};
