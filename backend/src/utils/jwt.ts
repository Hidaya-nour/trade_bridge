import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ITokenPayload } from "../types/auth.types";

// Validate environment
const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_REFRESH_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

export const generateAccessToken = (payload: ITokenPayload): string => {
  // ensure the options object satisfies the jwt.sign overloads for TypeScript
  const signOptions = { expiresIn: JWT_EXPIRES_IN } as unknown as import("jsonwebtoken").SignOptions;
  return jwt.sign(payload, JWT_SECRET, signOptions);
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString("hex");
};

export const verifyAccessToken = (token: string): ITokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as ITokenPayload;
  } catch {
    return null;
  }
};

export const decodeToken = (token: string): ITokenPayload | null => {
  return jwt.decode(token) as ITokenPayload | null;
};

export const getRefreshTokenExpiry = (): Date => {
  return new Date(Date.now() + JWT_REFRESH_EXPIRES_IN);
};