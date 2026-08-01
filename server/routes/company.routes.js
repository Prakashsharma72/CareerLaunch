import express from "express";
import {
  searchCompaniesHandler,
  getAllCompanies,
} from "../controllers/company.controller.js";

const router = express.Router();

/**
 * COMPANY ROUTES
 * All routes are public (search doesn't require login).
 * The API key is kept server-side — never exposed to the frontend.
 */

// GET /api/companies/search?keyword=software company&city=Pune
router.get("/search", searchCompaniesHandler);

// GET /api/companies  — all persisted companies
router.get("/", getAllCompanies);

export default router;
