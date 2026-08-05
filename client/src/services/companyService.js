/**
 * companyService.js
 *
 * All company data now comes from Google Places via /api/places/*.
 * This file re-exports placesService for backward compat and adds
 * saved-company CRUD (still stored in saved_companies table).
 */
import api from "./api";

/* ── Re-export places functions used by components ─────────────────── */
export {
  getNearbyCompanies,
  searchCompaniesByCity,
  getCompanyDetails,
} from "./placesService";

/* ── Saved companies CRUD ───────────────────────────────────────────── */

/**
 * POST /api/saved-companies
 * Stores an inline snapshot of the company at bookmark time.
 */
export const saveCompanyBookmark = (companyPayload) =>
  api.post("/saved-companies", companyPayload);

/** GET /api/saved-companies — logged-in user's bookmarks */
export const getSavedCompanies = () => api.get("/saved-companies");

/** DELETE /api/saved-companies/:savedId */
export const removeSavedCompany = (savedId) =>
  api.delete(`/saved-companies/${savedId}`);

/* Legacy aliases */
export const saveCompany         = saveCompanyBookmark;
export const searchCompanies     = (keyword, city, lat, lon) => {
  // Backward-compat shim — delegates to the new places endpoint
  const params = { keyword, city };
  if (lat != null) params.lat = lat;
  if (lon != null) params.lon = lon;
  return api.get("/places/search", { params });
};
