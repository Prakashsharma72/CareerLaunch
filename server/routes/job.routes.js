import express from "express";
import {
  getAllJobs,
  getJob,
  addJob,
  editJob,
  removeJob,
  bulkImportJobs,
  applyJob,
  saveJob,
  removeSavedJob,
  fetchSavedJobs,
  seedJobs,
} from "../controllers/job.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/* ── Public ── */
router.get("/", getAllJobs);

/* ── Specific named routes — MUST come before /:id ── */
router.get(   "/saved/list", verifyToken, fetchSavedJobs);
router.post(  "/save",       verifyToken, saveJob);
router.delete("/save/:id",   verifyToken, removeSavedJob);
router.post(  "/apply/:id",  verifyToken, applyJob);
router.post(  "/import",     verifyToken, bulkImportJobs);
router.post(  "/seed",       seedJobs);         // public — triggers background seed
router.post(  "/",           verifyToken, addJob);

/* ── Wildcard :id routes last ── */
router.get(   "/:id", getJob);
router.put(   "/:id", verifyToken, editJob);
router.delete("/:id", verifyToken, removeJob);

export default router;
