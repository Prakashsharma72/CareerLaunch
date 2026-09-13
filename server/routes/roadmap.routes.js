import express from "express";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";
import {
  getRoadmaps,
  createRoadmap,
  getRoadmap,
  listAdminRoadmaps,
  updateRoadmap,
  publishRoadmap,
  unpublishRoadmap,
  deleteRoadmap,
  updateProgress,
  uploadRoadmapResourceFile,
  getRoadmapResourceContent,
  getRoadmapPdf,
} from "../controllers/roadmap.controller.js";
import { uploadRoadmapFiles, uploadRoadmapResource } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getRoadmaps);
router.get("/admin", verifyToken, requireAdmin, listAdminRoadmaps);
router.get("/admin/:id", verifyToken, requireAdmin, getRoadmap);
router.get("/resource/:resourceId/content", verifyToken, getRoadmapResourceContent);
router.get("/:id/pdf", verifyToken, getRoadmapPdf);
router.get("/:id", verifyToken, getRoadmap);
router.get("/", verifyToken, getRoadmaps);
router.post(
  "/resource-upload",
  verifyToken,
  requireAdmin,
  uploadRoadmapResource.single("file"),
  uploadRoadmapResourceFile
);
router.post(
  "/",
  verifyToken,
  requireAdmin,
  uploadRoadmapFiles.fields([{ name: "cover", maxCount: 1 }, { name: "pdf", maxCount: 1 }]),
  createRoadmap
);
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  uploadRoadmapFiles.fields([{ name: "cover", maxCount: 1 }, { name: "pdf", maxCount: 1 }]),
  updateRoadmap
);
router.post("/:id/publish", verifyToken, requireAdmin, publishRoadmap);
router.post("/:id/unpublish", verifyToken, requireAdmin, unpublishRoadmap);
router.delete("/:id", verifyToken, requireAdmin, deleteRoadmap);
router.patch("/:roadmapId/progress/:stepId", verifyToken, updateProgress);

export default router;
