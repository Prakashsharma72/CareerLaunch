import express from "express";
import {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  googleLogin,
  linkGoogleAccount,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register",       register);
router.post("/login",          login);
router.post("/google",         googleLogin);
router.post("/google/link",    verifyToken, linkGoogleAccount);
router.post("/verify-otp",     verifyOtp);
router.post("/resend-otp",     resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

export default router;
