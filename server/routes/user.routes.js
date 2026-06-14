import express from "express";
import {
  getProfile,
  updateProfile,
} from "../controllers/user.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * USER ROUTES (Protected)
 */
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

export default router;