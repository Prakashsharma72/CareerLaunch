import express from "express";
import { getProfile, updateProfile, getStats } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * All user routes are protected — JWT required.
 */
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.get("/stats",   verifyToken, getStats);

export default router;
