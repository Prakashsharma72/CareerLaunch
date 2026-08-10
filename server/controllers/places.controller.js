/**
 * places.controller.js
 *
 * POST /api/places/nearby   — search by GPS coords
 * GET  /api/places/search   — search by city name
 * GET  /api/places/:placeId — full company details (photos, reviews, hours)
 */
import {
  getNearbyCompanies,
  searchCompaniesByCity,
  getCompanyDetails,
} from "../services/places.service.js";

const TAG = "[places.ctrl]";
const log = (msg, d) => console.log(`${new Date().toISOString()} ${TAG} ${msg}`, d ?? "");

/* ── helpers ────────────────────────────────────────────────────────────── */
function send400(res, reason, hint = "") {
  return res.status(400).json({ success: false, error: "BAD_REQUEST", reason, hint });
}

function errorResponse(res, e) {
  log("Error:", e.message);
  if (e.code === "API_KEY_INVALID") {
    return res.status(503).json({
      success: false,
      error:   "API_KEY_INVALID",
      reason:  "Google Maps API key is missing or invalid.",
      hint:    "Set GOOGLE_MAPS_API_KEY in server/.env",
    });
  }
  if (e.response?.data) {
    const gErr   = e.response.data.error;
    const status = e.response.status;

    // 429 — daily quota exhausted
    if (status === 429 || gErr?.status === "RESOURCE_EXHAUSTED") {
      return res.status(429).json({
        success: false,
        error:   "QUOTA_EXCEEDED",
        reason:  "Google Places daily search quota has been reached.",
        hint:    "The free tier allows 100 searches/day. Quota resets at midnight Pacific Time. Try again tomorrow or upgrade your Google Cloud billing plan.",
      });
    }

    return res.status(502).json({
      success:  false,
      error:    gErr?.status || "GOOGLE_API_ERROR",
      reason:   gErr?.message || "Google Places API returned an error.",
      hint:     "Check your API key permissions in Google Cloud Console.",
    });
  }
  return res.status(500).json({
    success: false,
    error:   "INTERNAL_ERROR",
    reason:  e.message || "An unexpected error occurred.",
  });
}

/* ── POST /api/places/nearby ─────────────────────────────────────────────
   Body: { lat, lon, radius?, keyword? }
   Returns companies sorted nearest-first.
─────────────────────────────────────────────────────────────────────────── */
export async function nearbyCompanies(req, res) {
  const { lat, lon, radius, keyword } = req.body;

  if (lat == null || lon == null) return send400(res, "lat and lon are required in the request body.");

  const userLat = parseFloat(lat);
  const userLon = parseFloat(lon);
  if (isNaN(userLat) || isNaN(userLon)) return send400(res, "lat and lon must be valid numbers.");

  const radiusKm  = radius ? Math.min(parseFloat(radius) || 15, 50) : 15;
  const searchKw  = keyword?.trim() || "software company";

  log(`POST /nearby lat=${userLat} lon=${userLon} radius=${radiusKm}km keyword="${searchKw}"`);

  try {
    const result = await getNearbyCompanies({ lat: userLat, lon: userLon, radius: radiusKm, keyword: searchKw });
    log(`Returning ${result.companies.length} companies`);
    return res.status(200).json({ success: true, ...result });
  } catch (e) {
    return errorResponse(res, e);
  }
}

/* ── GET /api/places/search?keyword=...&city=...&lat=...&lon=... ─────────
   For city-based search (no GPS or explicit city override).
─────────────────────────────────────────────────────────────────────────── */
export async function searchByCity(req, res) {
  const { keyword, city, lat, lon } = req.query;

  if (!city?.trim()) return send400(res, "city is required.", "Add ?city=Pune");

  const searchKw = keyword?.trim() || "software company";
  const userLat  = lat ? parseFloat(lat) : null;
  const userLon  = lon ? parseFloat(lon) : null;

  log(`GET /search keyword="${searchKw}" city="${city}" lat=${userLat ?? "–"} lon=${userLon ?? "–"}`);

  try {
    const result = await searchCompaniesByCity({ keyword: searchKw, city: city.trim(), userLat, userLon });
    log(`Returning ${result.companies.length} companies for city "${city}"`);
    return res.status(200).json({ success: true, ...result });
  } catch (e) {
    return errorResponse(res, e);
  }
}

/* ── GET /api/places/:placeId ─────────────────────────────────────────────
   Full company detail: photos, reviews, opening hours, career page.
─────────────────────────────────────────────────────────────────────────── */
export async function companyDetails(req, res) {
  const { placeId } = req.params;
  if (!placeId?.trim()) return send400(res, "placeId URL param is required.");

  log(`GET /details/${placeId}`);

  try {
    const details = await getCompanyDetails(placeId);
    return res.status(200).json({ success: true, company: details });
  } catch (e) {
    return errorResponse(res, e);
  }
}
