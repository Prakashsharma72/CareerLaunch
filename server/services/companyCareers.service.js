/**
 * companyCareers.service.js
 *
 * Fetches nearby software companies from Google Places, verifies career pages
 * on official websites, caches results in DB for 24 h, and returns only
 * companies with a validated careers/jobs page.
 */
import axios from "axios";
import { Op } from "sequelize";
import Company from "../models/company.model.js";
import {
  getNearbyCompanies,
  searchCompaniesByCity,
} from "./places.service.js";

const TAG = "[companyCareers]";
const log = (msg, d) => console.log(`${new Date().toISOString()} ${TAG} ${msg}`, d ?? "");

const CACHE_TTL_MS    = 24 * 60 * 60 * 1000;
const GET_TIMEOUT     = 5000;
const HEAD_TIMEOUT    = 2500;
const CONCURRENCY     = 10;
const USER_AGENT      = "CareerLaunchAI/2.0 CareerBot (+https://careerlaunch.ai)";

const CAREER_PATHS = [
  "/career",
  "/careers",
  "/jobs",
  "/job",
  "/join-us",
  "/work-with-us",
  "/opportunities",
  "/careers.html",
  "/career.html",
];

const CAREER_KEYWORDS = [
  "career", "careers", "job opening", "job openings", "open positions",
  "we are hiring", "join our team", "join us", "work with us",
  "apply now", "current openings", "vacancy", "vacancies", "opportunities",
  "employment", "recruitment", "hiring",
];

/* ─── Concurrency pool ─────────────────────────────────────────────────── */
async function mapPool(items, worker, limit = CONCURRENCY) {
  const results = new Array(items.length);
  let cursor = 0;

  async function runWorker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => runWorker())
  );
  return results;
}

/* ─── URL helpers ──────────────────────────────────────────────────────── */
function normalizeWebsite(website) {
  if (!website?.trim()) return null;
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`);
    return `${url.protocol}//${url.hostname}`;
  } catch {
    return null;
  }
}

function homepagePath(urlStr) {
  try {
    const u = new URL(urlStr);
    const path = u.pathname.replace(/\/$/, "") || "/";
    return { hostname: u.hostname, path };
  } catch {
    return null;
  }
}

function isRedirectToHomepage(finalUrl, baseUrl) {
  const final = homepagePath(finalUrl);
  const base  = homepagePath(baseUrl);
  if (!final || !base) return true;
  if (final.hostname !== base.hostname) return false;
  return final.path === "/" || final.path === "";
}

function hasCareerContent(html = "") {
  if (!html || html.replace(/\s/g, "").length < 80) return false;
  const sample = html.toLowerCase().slice(0, 80000);
  const hits = CAREER_KEYWORDS.filter(kw => sample.includes(kw)).length;
  return hits >= 2 || (hits >= 1 && /<form|apply|submit resume|upload cv/i.test(sample));
}

function stripHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ─── HTTP probe ───────────────────────────────────────────────────────── */
async function fetchGet(url) {
  const response = await axios.get(url, {
    timeout: GET_TIMEOUT,
    maxRedirects: 5,
    validateStatus: () => true,
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    maxContentLength: 512 * 1024,
    responseType: "text",
  });
  const finalUrl = response.request?.res?.responseUrl || response.config?.url || url;
  return { response, finalUrl };
}

async function probeCareerPath(baseUrl, path) {
  const targetUrl = `${baseUrl.replace(/\/$/, "")}${path}`;

  try {
    // HEAD first — fast reject on 404/403/500
    try {
      const head = await axios.head(targetUrl, {
        timeout: HEAD_TIMEOUT,
        maxRedirects: 3,
        validateStatus: () => true,
        headers: { "User-Agent": USER_AGENT },
      });
      if ([404, 403, 500, 502, 503].includes(head.status)) return null;
      if (head.status !== 200 && head.status !== 405 && head.status !== 501) return null;
    } catch {
      // HEAD unsupported or timed out — fall through to GET
    }

    const { response, finalUrl } = await fetchGet(targetUrl);
    if (response.status !== 200) return null;
    if (isRedirectToHomepage(finalUrl, baseUrl)) return null;

    const body = typeof response.data === "string" ? response.data : "";
    if (!hasCareerContent(body) && !hasCareerContent(stripHtml(body))) return null;

    return finalUrl;
  } catch {
    return null;
  }
}

async function verifyCareerPage(website) {
  const base = normalizeWebsite(website);
  if (!base) return null;

  // Try all paths in parallel — first valid wins
  const probes = CAREER_PATHS.map(path =>
    probeCareerPath(base, path).then(url => {
      if (!url) throw new Error("miss");
      return url;
    })
  );

  try {
    return await Promise.any(probes);
  } catch {
    return null;
  }
}

/* ─── DB cache ─────────────────────────────────────────────────────────── */
function isCacheFresh(checkedAt) {
  if (!checkedAt) return false;
  return Date.now() - new Date(checkedAt).getTime() < CACHE_TTL_MS;
}

function readCachedRow(row) {
  if (!row?.careerCheckedAt || !isCacheFresh(row.careerCheckedAt)) return undefined;
  return {
    valid:     row.careerValid === true,
    careerUrl: row.careerPage || null,
  };
}

async function preloadCareerCache(placeIds) {
  if (!placeIds.length) return new Map();
  const rows = await Company.findAll({
    where: { placeId: { [Op.in]: placeIds } },
    attributes: ["placeId", "careerPage", "careerValid", "careerCheckedAt"],
  });
  return new Map(rows.map(r => [r.placeId, r]));
}

async function writeCareerCache(place, careerUrl) {
  const valid = !!careerUrl;
  try {
    await Company.upsert({
      placeId:         place.placeId,
      companyName:     place.companyName,
      website:         place.website || null,
      careerPage:      careerUrl,
      careerValid:     valid,
      careerCheckedAt: new Date(),
      address:         place.address || null,
      phone:           place.phone || null,
      logo:            place.logo || null,
      latitude:        place.latitude ?? null,
      longitude:       place.longitude ?? null,
      rating:          place.rating ?? null,
      reviewCount:     place.reviewCount ?? null,
      mapsUrl:         place.mapsUrl || null,
      industry:        place.industry || null,
      city:            place.city || null,
      keyword:         place.keyword || null,
    });
  } catch (e) {
    log(`Cache write failed for ${place.companyName}`, e.message);
  }
}

async function resolveCareerForCompany(company, cacheMap) {
  if (!company.website) return null;

  const cached = readCachedRow(cacheMap.get(company.placeId));
  if (cached !== undefined) {
    return cached.valid ? { ...company, careerUrl: cached.careerUrl } : null;
  }

  const careerUrl = await verifyCareerPage(company.website);
  await writeCareerCache(company, careerUrl);

  cacheMap.set(company.placeId, {
    placeId:         company.placeId,
    careerPage:      careerUrl,
    careerValid:     !!careerUrl,
    careerCheckedAt: new Date(),
  });

  return careerUrl ? { ...company, careerUrl } : null;
}

function toResponseItem(company) {
  return {
    placeId:     company.placeId,
    companyName: company.companyName,
    website:     company.website || null,
    careerUrl:   company.careerUrl,
    logo:        company.logo || null,
    address:     company.address || null,
    phone:       company.phone || null,
    distance:    company.distanceText || null,
    distanceKm:  company.distanceKm ?? null,
    rating:      company.rating ?? null,
    industry:    company.industry || null,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   PUBLIC
═══════════════════════════════════════════════════════════════════════ */

export async function getCompaniesWithCareers({
  lat,
  lon,
  radius = 15,
  keyword = "software company",
  city,
}) {
  let payload;

  if (lat != null && lon != null) {
    payload = await getNearbyCompanies({
      lat, lon, radius, keyword,
      skipCareerProbe: true,
    });
  } else if (city?.trim()) {
    payload = await searchCompaniesByCity({
      keyword, city: city.trim(), userLat: lat, userLon: lon,
      skipCareerProbe: true,
    });
  } else {
    throw new Error("lat/lon or city is required");
  }

  const companies = (payload.companies || []).filter(c => c.website);
  const cacheMap  = await preloadCareerCache(companies.map(c => c.placeId));
  const cacheHits = companies.filter(c => readCachedRow(cacheMap.get(c.placeId)) !== undefined).length;

  log(`Verifying ${companies.length} companies (${cacheHits} cache hits, ${companies.length - cacheHits} to check)`);

  const verified    = await mapPool(companies, c => resolveCareerForCompany(c, cacheMap));
  const withCareers = verified.filter(Boolean).map(toResponseItem);

  log(`Returning ${withCareers.length} companies with verified career pages`);
  return {
    companies: withCareers,
    total:     withCareers.length,
    source:    "company_careers",
  };
}
