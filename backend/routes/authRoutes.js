import express from "express";
import { register, verifyEmail, login, getProfile, forgotPassword, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
// router.get("/verify", verifyEmail);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.post("/forgot-password", forgotPassword);  // ✅ Forgot Password
router.post("/reset-password/:token", resetPassword);  // ✅ Reset Password

export default router;
