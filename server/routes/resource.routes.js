import express from "express";
import {
  addResource,
  getAdminResources,
  getResources,
  updateResource,
  deleteResource,
} from "../controllers/resource.controller.js";

import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";
import { uploadResource } from "../middleware/upload.middleware.js";

const router = express.Router();

/**
 * RESOURCE ROUTES
 */

// Public
router.get("/", getResources);

router.get("/admin", verifyToken, requireAdmin, getAdminResources);

// Admin only (you can extend role middleware later)
router.post("/", verifyToken, requireAdmin, uploadResource.single("file"), addResource);
router.put("/:id", verifyToken, requireAdmin, uploadResource.single("file"), updateResource);
router.delete("/:id", verifyToken, requireAdmin, deleteResource);

export default router;