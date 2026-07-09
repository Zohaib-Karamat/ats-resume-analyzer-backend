import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerificationOtp,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-otp", resendVerificationOtp);
router.post("/login", login);
router.get("/me", verifyJWT, getMe);
router.patch("/me", verifyJWT, updateProfile);
router.post("/logout", verifyJWT, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", verifyJWT, changePassword);

export default router;
