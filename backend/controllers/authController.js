import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import e from "express";
import jwt from "jsonwebtoken";

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

export default { registerUser, loginUser, getProfile };