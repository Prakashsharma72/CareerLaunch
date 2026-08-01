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
} from "../controllers/job.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/* ── Public ── */
router.get("/",          getAllJobs);
router.get("/:id",       getJob);

/* ── Saved jobs (auth required) ── */
router.get(  "/saved/list",  verifyToken, fetchSavedJobs);
router.post( "/save",        verifyToken, saveJob);
router.delete("/save/:id",   verifyToken, removeSavedJob);

/* ── Apply (auth required) ── */
router.post("/apply/:id", verifyToken, applyJob);

/* ── Admin (auth required) ── */
router.post(  "/",          verifyToken, addJob);
router.put(   "/:id",       verifyToken, editJob);
router.delete("/:id",       verifyToken, removeJob);
router.post(  "/import",    verifyToken, bulkImportJobs);

export default router;
