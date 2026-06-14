import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  applyJob,
} from "../controllers/job.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * JOB ROUTES
 */

// Public routes
router.get("/", getJobs);
router.get("/:id", getJobById);

// Protected routes
router.post("/", verifyToken, createJob);
router.post("/apply/:id", verifyToken, applyJob);

export default router;