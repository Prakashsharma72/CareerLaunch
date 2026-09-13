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
import Job from "../models/job.model.js";
import { Op } from "sequelize";
import {
  getNearbyCompanies,
  searchCompaniesByCity,
} from "./places.service.js";

const LOG = "[job.service]";
const log = (msg, d) =>
  console.log(`${new Date().toISOString()} ${LOG} ${msg}`, d ?? "");


function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function hasValidCoordinate(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const radians = value => (value * Math.PI) / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function keywordMatches(job, keyword) {
  const terms = normalize(keyword).split(" ").filter(term => term.length > 2);
  if (!terms.length) return true;
  const haystack = normalize([job.title, job.company, job.skillsRequired, job.description].join(" "));
  return terms.every(term => haystack.includes(term));
}

function locationMatches(job, city) {
  if (!city?.trim()) return true;
  return normalize(job.location).includes(normalize(city));
}

function mapStoredJob(job, { lat, lon, city }) {
  const item = job.toJSON();
  const hasDistance = hasValidCoordinate(lat, -90, 90) && hasValidCoordinate(lon, -180, 180)
    && hasValidCoordinate(item.latitude, -90, 90) && hasValidCoordinate(item.longitude, -180, 180);
  const computedDistanceKm = hasDistance
    ? distanceKm(Number(lat), Number(lon), Number(item.latitude), Number(item.longitude))
    : null;
  return {
    ...item,
    source: "database_jobs",
    recordType: "job",
    requestedCity: city || null,
    distanceKm: computedDistanceKm,
    _distKm: computedDistanceKm,
    freshness: item.updatedAt || item.createdAt || null,
  };
}

export async function getStoredJobsFallback({ city, keyword, lat, lon, radius = 50 } = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await Job.findAll({
    where: {
      status: { [Op.in]: ["active", "published"] },
      [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gte]: today } }],
    },
    order: [["postedDate", "DESC"], ["updatedAt", "DESC"]],
  });

  const matchingJobs = rows
    .filter(job => locationMatches(job, city) && keywordMatches(job, keyword))
    .map(job => mapStoredJob(job, { lat, lon, city }))
    .filter(job => job.distanceKm == null || job.distanceKm <= Number(radius || 50))
  const jobs = matchingJobs;

  return {
    jobs,
    companies: [],
    total: jobs.length,
    source: "database_jobs",
    recordType: "job",
    freshness: jobs.reduce((latest, job) => latest && latest > job.freshness ? latest : job.freshness, null),
    location: city || null,
    keyword: keyword || null,
    nextPageToken: null,
  };
}

export async function getStoredJobByIdentifier(identifier) {
  const where = Number.isInteger(Number(identifier))
    ? { [Op.or]: [{ id: Number(identifier) }, { externalJobId: String(identifier) }] }
    : { externalJobId: String(identifier) };
  return Job.findOne({ where });
}

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
