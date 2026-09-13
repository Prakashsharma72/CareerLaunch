/**
 * company.controller.js
 *
 * GET /api/companies/search?keyword=...&city=...   — live search (Google → OSM)
 * GET /api/companies?city=...&industry=...&q=...   — read from DB with filters
 * POST /api/companies/seed                         — trigger background seed
 */

import { Op }              from "sequelize";
import { searchCompanies } from "../services/company.service.js";
import { seedCompaniesIfEmpty } from "../services/companySeeder.service.js";
import Company             from "../models/company.model.js";

const LOG = "[company.ctrl]";
const log = (msg, data) =>
  console.log(`${new Date().toISOString()} ${LOG} ${msg}`, data ?? "");

/* ── Live search (Google Places v2 → OSM fallback) ────────────────────── */

export const searchCompaniesHandler = async (req, res) => {
  const { keyword, city, lat, lon } = req.query;

  if (!keyword?.trim()) {
    return res.status(400).json({
      success: false, error: "MISSING_PARAM",
      reason: "keyword query param is required.",
      suggestion: "Add ?keyword=software+company&city=Pune",
    });
  }
  if (!city?.trim()) {
    return res.status(400).json({
      success: false, error: "MISSING_PARAM",
      reason: "city query param is required.",
      suggestion: "Add ?keyword=software+company&city=Pune",
    });
  }

  // Parse optional lat/lon (sent by client when geolocation is available)
  const userLat = lat ? parseFloat(lat) : undefined;
  const userLon = lon ? parseFloat(lon) : undefined;

  log(`Search: keyword="${keyword}" city="${city}" lat=${userLat ?? "–"} lon=${userLon ?? "–"}`);

  try {
    const result = await searchCompanies({
      keyword: keyword.trim(),
      city:    city.trim(),
      lat:     userLat,
      lon:     userLon,
    });

    const usedFallback = result.source !== "google_v2" && result.source !== "cache";

    log(`Search complete: ${result.total} companies (source: ${result.source})`);

    return res.status(200).json({
      success:      true,
      source:       result.source,
      total:        result.total ?? result.companies.length,
      companies:    result.companies,
      fallbackUsed: usedFallback,
      googleWarning: result.googleError
        ? {
            error:      result.googleError.status,
            message:    result.googleError.message,
            suggestion: buildSuggestion(result.googleError.status),
          }
        : null,
    });

  } catch (err) {
    if (err?.success === false) {
      log("Structured error", err.error);
      return res.status(pickHttpStatus(err.error)).json(err);
    }
    log("Unexpected error", err.message);
    return res.status(500).json({
      success: false, error: "INTERNAL_ERROR",
      reason: err?.message || "Unexpected error",
      suggestion: "Check server logs.",
    });
  }
};

/* ── Load companies from DB with optional filters ──────────────────────── */

export const getAllCompanies = async (req, res) => {
  try {
    const {
      q,        // free-text search in company_name
      city,
      industry,
      minRating,
      keyword,  // keyword used during import
      page      = 1,
      limit     = 50,
    } = req.query;

    const where = {};

    if (q?.trim()) {
      where.companyName = { [Op.like]: `%${q.trim()}%` };
    }
    if (city?.trim()) {
      where.city = { [Op.like]: `%${city.trim()}%` };
    }
    if (industry?.trim()) {
      where.industry = { [Op.like]: `%${industry.trim()}%` };
    }
    if (minRating) {
      where.rating = { [Op.gte]: parseFloat(minRating) };
    }
    if (keyword?.trim()) {
      where.keyword = { [Op.like]: `%${keyword.trim()}%` };
    }

    const offset      = (Number(page) - 1) * Number(limit);
    const { count, rows } = await Company.findAndCountAll({
      where,
      order:  [["createdAt", "DESC"]],
      limit:  Number(limit),
      offset,
    });

    log(`GET /companies → ${rows.length} of ${count} (page ${page})`);

    return res.status(200).json({
      success:    true,
      total:      count,
      page:       Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      companies:  rows,
    });
  } catch (err) {
    log("getAllCompanies error", err.message);
    return res.status(500).json({
      success: false, error: "DB_ERROR",
      reason: err.message,
      suggestion: "Check database connectivity.",
    });
  }
};

/* ── Manually trigger seed ─────────────────────────────────────────────── */

export const triggerSeed = async (req, res) => {
  // Respond immediately, run seed in background
  res.status(202).json({ success: true, message: "Company seed triggered in background." });
  try {
    await seedCompaniesIfEmpty();
  } catch (err) {
    log("triggerSeed error", err.message);
  }
};

const ADMIN_COMPANY_FIELDS = [
  "companyName", "website", "careerPage", "address", "shortAddress", "phone",
  "rating", "reviewCount", "latitude", "longitude", "mapsUrl", "businessStatus",
  "openingHours", "types", "city", "state", "country", "logo", "industry", "keyword",
];

function companyPayload(body = {}) {
  return Object.fromEntries(ADMIN_COMPANY_FIELDS
    .filter(field => body[field] !== undefined)
    .map(field => [field, body[field] === "" ? null : body[field]]));
}

export const getAdminCompanies = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const where = {};
    const search = req.query.search?.trim();
    const city = req.query.city?.trim();
    const source = req.query.source?.trim();
    const status = req.query.status?.trim();
    const searchConditions = search ? [
      { companyName: { [Op.like]: `%${search}%` } },
      { address: { [Op.like]: `%${search}%` } },
      { placeId: { [Op.like]: `%${search}%` } },
    ] : [];
    if (city) where.city = { [Op.like]: `%${city}%` };
    if (source && source !== "all") where.source = source;
    if (status === "admin") where.adminManaged = true;
    if (status === "expired") where.expiresAt = { [Op.lt]: new Date() };
    const andConditions = [];
    if (status === "active") andConditions.push({ [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gte]: new Date() } }] });
    if (searchConditions.length) andConditions.push({ [Op.or]: searchConditions });
    if (andConditions.length) where[Op.and] = andConditions;
    const { count, rows } = await Company.findAndCountAll({
      where, order: [["updatedAt", "DESC"]], limit, offset: (page - 1) * limit,
    });
    return res.json({ success: true, companies: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    return res.status(500).json({ success: false, error: "DB_ERROR", message: error.message });
  }
};

export const getAdminCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    return res.json({ success: true, company });
  } catch (error) {
    return res.status(500).json({ success: false, error: "DB_ERROR", message: error.message });
  }
};

export const createAdminCompany = async (req, res) => {
  try {
    const payload = companyPayload(req.body);
    if (!payload.companyName?.trim() || !payload.city?.trim()) {
      return res.status(400).json({ success: false, message: "companyName and city are required" });
    }
    const company = await Company.create({
      ...payload,
      placeId: req.body.placeId?.trim() || null,
      source: "admin",
      adminManaged: true,
      fetchedAt: new Date(),
      expiresAt: null,
    });
    return res.status(201).json({ success: true, company });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateAdminCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    await company.update({ ...companyPayload(req.body), adminManaged: true, source: company.source || "admin" });
    return res.json({ success: true, company });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ── helpers ─────────────────────────────────────────────────────────────── */

function pickHttpStatus(errorCode) {
  const map = {
    MISSING_PARAM: 400, INVALID_ARGUMENT: 400,
    REQUEST_DENIED: 502, PERMISSION_DENIED: 403,
    OVER_QUERY_LIMIT: 429, NETWORK_ERROR: 503,
    SEARCH_FAILED: 502, INTERNAL_ERROR: 500,
  };
  return map[errorCode] || 500;
}

function buildSuggestion(status) {
  const map = {
    INVALID_ARGUMENT:  "Your Google API key is invalid. Verify it in Google Cloud Console.",
    REQUEST_DENIED:    "Enable 'Places API (New)' and billing in Google Cloud Console.",
    PERMISSION_DENIED: "API key lacks Places API permissions.",
    OVER_QUERY_LIMIT:  "Google API quota exceeded.",
    API_KEY_MISSING:   "Set GOOGLE_MAPS_API_KEY in your .env file.",
  };
  return map[status] || "Check Google Cloud Console settings.";
}
