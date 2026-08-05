/**
 * job.service.js  (rebuilt — Google Places only)
 *
 * The Jobs page now shows nearby software companies from Google Places API.
 * There are no external job boards, no seed jobs, no remote job APIs.
 *
 * Architecture:
 *   GET /api/jobs          → delegates to places.service.getNearbyCompanies
 *                            or searchCompaniesByCity, returns company objects
 *                            shaped as "job cards" so the existing Redux slice works.
 *   Saved jobs CRUD        → still stored in MySQL saved_jobs table (unchanged).
 */
import SavedJob from "../models/savedJob.model.js";
import {
  getNearbyCompanies,
  searchCompaniesByCity,
} from "./places.service.js";

const LOG = "[job.service]";
const log = (msg, d) =>
  console.log(`${new Date().toISOString()} ${LOG} ${msg}`, d ?? "");

/* ═══════════════════════════════════════════════════════════════════════
   GET COMPANIES (jobs page data source)
═══════════════════════════════════════════════════════════════════════ */
/**
 * getCompaniesForJobsPage({ lat, lon, radius, keyword, city })
 *
 * Returns { companies, total, source }.
 * When lat/lon are provided uses GPS-based search.
 * Falls back to city-based search when city is given.
 * Returns empty list when neither is available.
 */
export async function getCompaniesForJobsPage({
  lat,
  lon,
  radius = 15,
  keyword = "software company",
  city,
} = {}) {
  const hasCoords = lat != null && lon != null && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon));
  const hasCity   = city?.trim();

  if (hasCoords) {
    return getNearbyCompanies({
      lat:     parseFloat(lat),
      lon:     parseFloat(lon),
      radius:  parseFloat(radius) || 15,
      keyword: keyword || "software company",
    });
  }

  if (hasCity) {
    return searchCompaniesByCity({
      keyword: keyword || "software company",
      city:    city.trim(),
    });
  }

  // No location at all — return empty so the UI shows the location prompt
  return { companies: [], total: 0, source: "no_location" };
}

/* ═══════════════════════════════════════════════════════════════════════
   SAVED JOBS CRUD  (unchanged — still uses MySQL saved_jobs table)
═══════════════════════════════════════════════════════════════════════ */

export async function saveJobForUser(userId, jobData) {
  if (!jobData.externalJobId) {
    const e = new Error("externalJobId is required");
    e.status = 400;
    throw e;
  }

  const [row, created] = await SavedJob.findOrCreate({
    where:    { userId, externalJobId: jobData.externalJobId },
    defaults: { userId, ...jobData },
  });

  if (!created) {
    log(`Job ${jobData.externalJobId} already saved by user ${userId}`);
  }

  return { savedId: row.id, created };
}

export async function unsaveJob(userId, savedId) {
  const row = await SavedJob.findOne({ where: { id: savedId, userId } });
  if (!row) {
    const e = new Error("Saved job not found");
    e.status = 404;
    throw e;
  }
  await row.destroy();
  return { deleted: true };
}

export async function getSavedJobs(userId) {
  const rows = await SavedJob.findAll({
    where:  { userId },
    order:  [["savedAt", "DESC"]],
  });
  return rows.map(r => ({ ...r.toJSON(), savedId: r.id }));
}
