import express from "express";
import { listCompanyCareers } from "../controllers/companyCareers.controller.js";

const router = express.Router();

/**
 * GET /api/company-careers — companies with verified career pages
 * Query: lat, lon, radius, keyword, city
 */
router.get("/", listCompanyCareers);

export default router;
