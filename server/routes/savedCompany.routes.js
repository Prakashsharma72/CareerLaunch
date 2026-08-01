import express from "express";
import {
  saveCompany,
  getSavedCompanies,
  removeSavedCompany,
} from "../controllers/savedCompany.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * SAVED COMPANIES ROUTES
 * All routes require authentication.
 */

// POST   /api/saved-companies          — save a company
router.post("/", verifyToken, saveCompany);

// GET    /api/saved-companies          — get all saved companies for user
router.get("/", verifyToken, getSavedCompanies);

// DELETE /api/saved-companies/:id      — remove a saved company
router.delete("/:id", verifyToken, removeSavedCompany);

export default router;
