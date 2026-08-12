import express from "express";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";
import {
  getRoadmaps,
  createRoadmap,
} from "../controllers/roadmap.controller.js";

const router = express.Router();

router.get("/", verifyToken, getRoadmaps);
router.post("/", verifyToken, requireAdmin, createRoadmap);

export default router;
