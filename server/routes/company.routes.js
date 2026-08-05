import express from "express";
import {
  searchCompaniesHandler,
  getAllCompanies,
  triggerSeed,
} from "../controllers/company.controller.js";

const router = express.Router();

/**
 * GET  /api/companies/search?keyword=...&city=...   live Google → OSM search
 * GET  /api/companies?q=...&city=...&industry=...   read from DB
 * POST /api/companies/seed                          background re-seed
 *
 * Specific routes MUST be registered before the wildcard "/".
 */
router.get( "/search", searchCompaniesHandler);
router.post("/seed",   triggerSeed);
router.get( "/",       getAllCompanies);

export default router;
