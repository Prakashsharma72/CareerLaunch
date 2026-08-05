import express from "express";
import {
  nearbyCompanies,
  searchByCity,
  companyDetails,
} from "../controllers/places.controller.js";

const router = express.Router();

/**
 * POST /api/places/nearby          — GPS-based company search
 * GET  /api/places/search           — City-based search
 * GET  /api/places/:placeId         — Full company details
 *
 * All public (no auth required — read-only Google Places data).
 * Named routes MUST come before :placeId wildcard.
 */
router.post("/nearby", nearbyCompanies);
router.get( "/search", searchByCity);
router.get( "/:placeId", companyDetails);

export default router;
