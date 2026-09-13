/**
 * job.controller.js  (rebuilt — Google Places only)
 *
 * GET  /api/jobs            — nearby software companies (from Google Places)
 * GET  /api/jobs/saved/list — user's saved bookmarks from DB
 * POST /api/jobs/save       — bookmark a company/job
 * DELETE /api/jobs/save/:id — remove a bookmark
 */
import {
  getCompaniesForJobsPage,
  saveJobForUser,
  unsaveJob,
  getSavedJobs,
  getStoredJobByIdentifier,
  getStoredJobsFallback,
} from "../services/job.service.js";

const LOG = "[job.ctrl]";
const log = (msg, d) =>
  console.log(`${new Date().toISOString()} ${LOG} ${msg}`, d ?? "");

/* ── GET /api/jobs ───────────────────────────────────────────────────────
   Params: lat, lon, radius, keyword, city
─────────────────────────────────────────────────────────────────────────── */
export const getAllJobs = async (req, res) => {
  try {
    const { lat, lon, radius, keyword, city, source, page, limit } = req.query;
    log(`GET /jobs lat=${lat ?? "–"} lon=${lon ?? "–"} city="${city ?? "–"}" keyword="${keyword ?? "–"}"`);

    if (source === "database") {
      const stored = await getStoredJobsFallback({ city, keyword, lat, lon, radius });
      const pageNumber = Math.max(1, Number(page) || 1);
      const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
      const start = (pageNumber - 1) * pageSize;
      const jobs = stored.jobs.slice(start, start + pageSize);
      return res.status(200).json({
        success: true,
        ...stored,
        jobs,
        total: stored.jobs.length,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.max(1, Math.ceil(stored.jobs.length / pageSize)),
      });
    }

    const result = await getCompaniesForJobsPage({ lat, lon, radius, keyword, city });
    log(`Returning ${result.companies.length} companies`);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    log("getAllJobs error:", err.message);
    if (err.code === "API_KEY_INVALID") {
      return res.status(503).json({
        success: false,
        error:   "API_KEY_INVALID",
        reason:  "Google Maps API key is missing or invalid.",
        hint:    "Set GOOGLE_MAPS_API_KEY in server/.env",
      });
    }
    if (err.response?.data) {
      const gErr = err.response.data.error;
      return res.status(502).json({
        success: false,
        error:   gErr?.status || "GOOGLE_API_ERROR",
        reason:  gErr?.message || "Google Places API returned an error.",
      });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ── Saved bookmarks ─────────────────────────────────────────────────────── */

export const saveJob = async (req, res) => {
  try {
    if (!req.body.externalJobId) {
      return res.status(400).json({ message: "externalJobId is required" });
    }
    const result = await saveJobForUser(req.user.id, req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const removeSavedJob = async (req, res) => {
  try {
    const result = await unsaveJob(req.user.id, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const fetchSavedJobs = async (req, res) => {
  try {
    const jobs = await getSavedJobs(req.user.id);
    log(`Saved jobs for user ${req.user.id}: ${jobs.length}`);
    return res.status(200).json(jobs);
  } catch (err) {
    log("fetchSavedJobs error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

/* ── Stubs for routes that no longer apply ──────────────────────────────── */
export const getJob          = async (req, res) => {
  try {
    const job = await getStoredJobByIdentifier(req.params.id);
    if (!job || !["active", "published"].includes(job.status) || (job.expiresAt && new Date(job.expiresAt) < new Date())) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.json({ success: true, job: { ...job.toJSON(), recordType: "job", source: job.source || "database_jobs" } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const addJob          = (_req, res) => res.status(501).json({ message: "Jobs are sourced from Google Places API." });
export const editJob         = (_req, res) => res.status(501).json({ message: "Jobs are sourced from Google Places API." });
export const removeJob       = (_req, res) => res.status(501).json({ message: "Jobs are sourced from Google Places API." });
export const bulkImportJobs  = (_req, res) => res.status(501).json({ message: "Jobs are sourced from Google Places API." });
export const applyJob        = (_req, res) => res.status(501).json({ message: "Use the company's career page to apply." });
export const seedJobs        = (_req, res) => res.status(501).json({ message: "Seeding disabled — data comes from Google Places." });
