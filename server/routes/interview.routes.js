import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  startInterview,
  submitAnswer,
  skipQuestion,
  endInterview,
  getInterviewHistory,
  getSessionById,
} from "../controllers/interview.controller.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.post  ("/start",              startInterview);
router.post  ("/:sessionId/answer",  submitAnswer);
router.post  ("/:sessionId/skip",    skipQuestion);
router.post  ("/:sessionId/end",     endInterview);
router.get   ("/history",            getInterviewHistory);
router.get   ("/:sessionId",         getSessionById);

export default router;
