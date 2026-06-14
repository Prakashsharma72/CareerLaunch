import express from "express";
import { chatWithAI } from "../controllers/ai.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * AI ROUTES
 */

// Chat with AI (protected)
router.post("/chat", verifyToken, chatWithAI);

export default router;