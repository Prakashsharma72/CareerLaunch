import api from "./api";

/**
 * Company API service
 * API key is NEVER exposed here — all Google Places calls go through the backend.
 */

/**
 * Search companies via Google Places (proxied through backend)
 * GET /api/companies/search?keyword=...&city=...
 */
export const searchCompanies = (keyword, city) =>
  api.get("/companies/search", { params: { keyword, city } });

/**
 * Get all persisted companies
 * GET /api/companies
 */
export const getAllCompanies = () => api.get("/companies");

/**
 * Save a company for the current user
 * POST /api/saved-companies
 */
export const saveCompany = (companyId) =>
  api.post("/saved-companies", { companyId });

/**
 * Get saved companies for the current user
 * GET /api/saved-companies
 */
export const getSavedCompanies = () => api.get("/saved-companies");

/**
 * Remove a saved company by saved-record id
 * DELETE /api/saved-companies/:savedId
 */
export const removeSavedCompany = (savedId) =>
  api.delete(`/saved-companies/${savedId}`);
