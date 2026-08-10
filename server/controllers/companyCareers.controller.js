/**
 * companyCareers.controller.js
 *
 * GET /api/company-careers — nearby companies with verified career pages
 */
import { getCompaniesWithCareers } from "../services/companyCareers.service.js";

const TAG = "[companyCareers.ctrl]";
const log = (msg, d) => console.log(`${new Date().toISOString()} ${TAG} ${msg}`, d ?? "");

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
    const gErr = e.response.data.error;
    return res.status(502).json({
      success:  false,
      error:    gErr?.status || "GOOGLE_API_ERROR",
      reason:   gErr?.message || "Google Places API returned an error.",
    });
  }
  return res.status(500).json({
    success: false,
    error:   "INTERNAL_ERROR",
    reason:  e.message || "An unexpected error occurred.",
  });
}

/**
 * GET /api/company-careers?lat=&lon=&radius=&keyword=&city=
 */
export async function listCompanyCareers(req, res) {
  const { lat, lon, radius, keyword, city } = req.query;

  const userLat = lat ? parseFloat(lat) : null;
  const userLon = lon ? parseFloat(lon) : null;
  const radiusKm = radius ? Math.min(parseFloat(radius) || 15, 50) : 15;
  const searchKw = keyword?.trim() || "software company";

  if ((userLat == null || userLon == null) && !city?.trim()) {
    return send400(res, "Provide lat/lon or city.", "Add ?lat=...&lon=... or ?city=Pune");
  }

  log(`GET /company-careers lat=${userLat ?? "–"} lon=${userLon ?? "–"} city="${city ?? ""}"`);

  try {
    const result = await getCompaniesWithCareers({
      lat:     userLat,
      lon:     userLon,
      radius:  radiusKm,
      keyword: searchKw,
      city:    city?.trim() || null,
    });

    return res.status(200).json(result.companies);
  } catch (e) {
    return errorResponse(res, e);
  }
}
