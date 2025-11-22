import express from "express";
import { registerUser, loginUser, getProfile, updateUserProfile } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateUserProfile);
// router.post("/google", googleLogin);

export default router;
