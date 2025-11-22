import { Request, Response } from "express";
import User, { IUser } from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client, TokenPayload } from "google-auth-library";

// Extend Express Request to include user property
interface AuthRequest extends Request {
    user?: {
        id?: string;
        _id?: string | import('mongoose').Types.ObjectId; // support ObjectId
        email?: string;
        role?: string;
    };
}

// Generate JWT token

const generateToken = (id: string, role: string): string => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};

// @desc Register a new user
// @route POST /api/auth/register
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, location, contactNumber } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser: IUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            location,
            contactNumber,
        });

        const token = generateToken(String(newUser._id), newUser.role);

        res.status(201).json({
            success: true,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
            token,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Login user
// @route POST /api/auth/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user: IUser | null = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        const token = generateToken(String(user._id), user.role);

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Google OAuth2 Client
const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

// // @desc Google Login
// export const googleLogin = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { token } = req.body;

//         const ticket = await client.verifyIdToken({
//             idToken: token,
//             audience: process.env.VITE_GOOGLE_CLIENT_ID,
//         });

//         const payload: TokenPayload | undefined = ticket.getPayload();
//         if (!payload) {
//             res.status(400).json({ message: "Invalid Google token" });
//             return;
//         }

//         const { name, email, picture, sub } = payload;

//         let user: IUser | null = await User.findOne({ email });
//         if (!user) {
//             user = await User.create({
//                 name,
//                 email,
//                 password: sub, // placeholder
//                 profileImage: picture,
//             });
//         }

//         const userToken = jwt.sign(
//             { id: user._id.toString(), email: user.email },
//             process.env.JWT_SECRET as string,
//             { expiresIn: "7d" }
//         );

//         res.status(200).json({ token: userToken, user });
//     } catch (error: any) {
//         console.error(error);
//         res.status(400).json({ message: "Google login failed", error: error.message });
//     }
// };

// @desc Get user profile
// @route GET /api/auth/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update user profile
// @route PUT /api/auth/profile
export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.location = req.body.location || user.location;
        user.contactNumber = req.body.contactNumber || user.contactNumber;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            location: updatedUser.location,
            contactNumber: updatedUser.contactNumber,
            updatedAt: updatedUser.updatedAt ?? Date.now(),
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: "Error updating profile" });
    }
};

export default { registerUser, loginUser, getProfile, updateUserProfile };
