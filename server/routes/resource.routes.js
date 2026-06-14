import express from "express";
import {
  addResource,
  getResources,
  deleteResource,
} from "../controllers/resource.controller.js";

import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * RESOURCE ROUTES
 */

// Public
router.get("/", getResources);

// Admin only (you can extend role middleware later)
router.post("/", verifyToken, addResource);
router.delete("/:id", verifyToken, deleteResource);

export default router;