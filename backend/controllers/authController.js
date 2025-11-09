import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import e from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

//Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc Register a new user
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, location, contactNumber } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            location,
            contactNumber,
        });

        const token = generateToken(newUser._id, newUser.role);

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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Login user
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user._id, user.role);

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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc Continue with Google
// @route POST /api/auth/google
// @access Public
export const googleAuth = async (req, res) => {
    const { token } = req.body;

    try {
        // Verify token with Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            user = await User.create({
                name,
                email,
                password: null, // not needed for Google users
                role: "shop", // or default role
                profileImage: picture,
                isGoogleUser: true,
            });
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: jwtToken,
            profileImage: user.profileImage,
        });
    } catch (error) {
        console.error("Google auth error:", error);
        res.status(401).json({ message: "Invalid Google token" });
    }
};

// @desc Get user profile
// @route GET /api/auth/profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update allowed fields
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.location = req.body.location || user.location;
        user.contactNumber = req.body.contactNumber || user.contactNumber;

        // If password is being updated
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
            updatedAt: updatedUser.updatedAt || Date.now(),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating profile" });
    }
};

export default { registerUser, loginUser, getProfile };