/**
 * places.service.js
 *
 * Single source of truth for all company / location data.
 * Data pipeline:
 *   1. In-memory cache (6-hour TTL per query key)
 *   2. DB cache (companies table — keyed by place_id)
 *   3. Google Places API v2 (POST /v1/places:searchText)
 *   4. Google Places Details (GET /v1/places/:id) for rich detail
 *
 * Exposed:
 *   getNearbyCompanies({ lat, lon, radius, keyword, type })
 *   getCompanyDetails(placeId)
 *   searchCompaniesByCity({ keyword, city })
 */
import axios   from "axios";
import Company from "../models/company.model.js";

/* ─── Logging ─────────────────────────────────────────────────────────── */
const TAG = "[places.service]";
const log  = (msg, d)  => console.log(`${new Date().toISOString()} ${TAG} ${msg}`, d != null ? d : "");
const err  = (msg, e)  => console.error(`${new Date().toISOString()} ${TAG} ERROR ${msg}`, e?.message || e);

/* ─── In-memory cache (6 h TTL) ──────────────────────────────────────── */
const MEM_CACHE     = new Map();
const CACHE_TTL_MS  = 6 * 60 * 60 * 1000;   // 6 hours

function memGet(key) {
  const e = MEM_CACHE.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) { MEM_CACHE.delete(key); return null; }
  log(`Cache HIT: ${key}`);
  return e.data;
}
function memSet(key, data) {
  MEM_CACHE.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

/* ─── Haversine ───────────────────────────────────────────────────────── */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R  = 6371;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dN = ((lon2 - lon1) * Math.PI) / 180;
  const a  = Math.sin(dL / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dN / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function fmtDistance(km) {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}

/* ─── Geocode city via Nominatim ──────────────────────────────────────── */
async function geocodeCity(city) {
  const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
    params:  { q: city, format: "json", limit: 1 },
    headers: { "User-Agent": "CareerLaunchAI/2.0" },
    timeout: 8000,
  });
  if (!data?.length) throw new Error(`Cannot geocode "${city}"`);
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

/* ─── Google API Key validation ───────────────────────────────────────── */
function getApiKey() {
  const key = (process.env.GOOGLE_MAPS_API_KEY || "").trim();
  if (!key || key === "YOUR_GOOGLE_MAPS_API_KEY_HERE" || !key.startsWith("AIza")) {
    throw Object.assign(new Error("Google Maps API key is invalid or not configured"), { code: "API_KEY_INVALID" });
  }
  return key;
}

/* ─── Field masks ─────────────────────────────────────────────────────── */
const SEARCH_FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.rating",
  "places.userRatingCount",
  "places.location",
  "places.googleMapsUri",
  "places.businessStatus",
  "places.regularOpeningHours",
  "places.types",
  "places.primaryTypeDisplayName",
  "places.photos",
  "places.iconMaskBaseUri",
  "places.currentOpeningHours",
].join(",");

const DETAIL_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "websiteUri",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "rating",
  "userRatingCount",
  "location",
  "googleMapsUri",
  "businessStatus",
  "regularOpeningHours",
  "currentOpeningHours",
  "types",
  "primaryTypeDisplayName",
  "photos",
  "reviews",
  "iconMaskBaseUri",
  "shortFormattedAddress",
  "editorialSummary",
  "priceLevel",
].join(",");

/* ─── Normalise a Google Place object (search result) ────────────────── */
function normalisePlace(p) {
  const photoRefs = (p.photos || []).slice(0, 6).map(ph => ph.name);
  return {
    placeId:          p.id,
    companyName:      p.displayName?.text  || "Unknown",
    address:          p.formattedAddress   || null,
    shortAddress:     p.shortFormattedAddress || null,
    website:          p.websiteUri         || null,
    phone:            p.nationalPhoneNumber || p.internationalPhoneNumber || null,
    rating:           p.rating             ?? null,
    reviewCount:      p.userRatingCount    ?? null,
    latitude:         p.location?.latitude  ?? null,
    longitude:        p.location?.longitude ?? null,
    mapsUrl:          p.googleMapsUri       || null,
    businessStatus:   p.businessStatus      || null,
    openingHours:     p.regularOpeningHours?.weekdayDescriptions || p.currentOpeningHours?.weekdayDescriptions || null,
    isOpenNow:        p.regularOpeningHours?.openNow ?? p.currentOpeningHours?.openNow ?? null,
    types:            p.types               || [],
    industry:         p.primaryTypeDisplayName?.text || null,
    photoRefs,
    editorialSummary: p.editorialSummary?.text || null,
    logo:             p.iconMaskBaseUri ? `${p.iconMaskBaseUri}.png` : null,
  };
}

/* ─── Build photo URL from a photo resource name ─────────────────────── */
export function buildPhotoUrl(photoRef, maxWidth = 400) {
  if (!photoRef) return null;
  const key = getApiKey();
  // photoRef is like "places/ChIJ.../photos/..."
  return `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=${maxWidth}&key=${key}`;
}

/* ─── Google Places Text Search (with pagination) ────────────────────── */
/**
 * Fetches up to `maxPages` pages of results (20 per page) using nextPageToken.
 * Google allows max 3 pages = 60 results per query.
 */
async function googleTextSearch({ textQuery, lat, lon, radiusMeters = 15000, maxPages = 3 }) {
  const apiKey = getApiKey();

  const baseBody = {
    textQuery,
    maxResultCount: 20,
    ...(lat != null && lon != null && {
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lon },
          radius: radiusMeters,
        },
      },
    }),
  };

  log(`Google Text Search → "${textQuery}"`, { lat, lon, radiusMeters, maxPages });

  let allResults = [];
  let pageToken  = null;
  let pageNum    = 0;

  do {
    pageNum++;
    const body = pageToken
      ? { ...baseBody, pageToken }
      : baseBody;

    const { data } = await axios.post(
      "https://places.googleapis.com/v1/places:searchText",
      body,
      {
        headers: {
          "Content-Type":   "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": SEARCH_FIELDS,
        },
        timeout: 15000,
      }
    );

    const pageResults = (data.places || []).map(normalisePlace);
    allResults = allResults.concat(pageResults);
    pageToken  = data.nextPageToken || null;

    log(`Google Text Search page ${pageNum} ← ${pageResults.length} results (total so far: ${allResults.length})`);

    // Small delay between paginated requests (Google recommends ~2s between pages)
    if (pageToken && pageNum < maxPages) {
      await new Promise(r => setTimeout(r, 2000));
    }

  } while (pageToken && pageNum < maxPages);

  log(`Google Text Search complete — ${allResults.length} total results across ${pageNum} page(s)`);
  return allResults;
}

/* ─── Google Places Details ───────────────────────────────────────────── */
async function googlePlaceDetails(placeId) {
  const apiKey = getApiKey();
  log(`Google Place Details → ${placeId}`);
  const { data } = await axios.get(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": DETAIL_FIELDS,
      },
      timeout: 12000,
    }
  );
  return normalisePlace(data);
}

/* ─── Career page detector (fast, capped at 1 s) ─────────────────────── */
const CAREER_PATHS = ["/careers", "/jobs", "/career", "/hiring", "/work-with-us", "/join-us"];

async function detectCareerPage(website) {
  if (!website) return null;
  const base = website.replace(/\/$/, "");
  const probe = (path) =>
    axios.head(`${base}${path}`, { timeout: 1000, maxRedirects: 2, validateStatus: s => s < 400 })
      .then(() => `${base}${path}`)
      .catch(() => null);

  return Promise.race([
    Promise.any(CAREER_PATHS.map(probe)).catch(() => null),
    new Promise(r => setTimeout(() => r(null), 1200)),
  ]);
}

/* ─── Reviews normaliser ──────────────────────────────────────────────── */
function normaliseReviews(raw = []) {
  return raw.slice(0, 5).map(r => ({
    author:   r.authorAttribution?.displayName || "Anonymous",
    rating:   r.rating ?? null,
    text:     r.text?.text || "",
    time:     r.relativePublishTimeDescription || null,
    photoUrl: r.authorAttribution?.photoUri    || null,
    url:      r.authorAttribution?.uri         || null,
  }));
}

/* ─── DB upsert  ──────────────────────────────────────────────────────── */
async function upsertToDb(place, careerPage, extras = {}) {
  try {
    const payload = {
      companyName:      place.companyName,
      website:          place.website          || null,
      careerPage:       careerPage             || null,
      address:          place.address          || null,
      shortAddress:     place.shortAddress     || null,
      phone:            place.phone            || null,
      rating:           place.rating           ?? null,
      reviewCount:      place.reviewCount      ?? null,
      latitude:         place.latitude         ?? null,
      longitude:        place.longitude        ?? null,
      mapsUrl:          place.mapsUrl          || null,
      businessStatus:   place.businessStatus   || null,
      openingHours:     place.openingHours      || null,
      isOpenNow:        place.isOpenNow         ?? null,
      types:            place.types            || null,
      industry:         place.industry         || null,
      logo:             place.logo             || null,
      editorialSummary: place.editorialSummary || null,
      photoRefs:        place.photoRefs        || null,
      ...extras,
    };

    const [row, created] = await Company.upsert({ placeId: place.placeId, ...payload });
    return { row, created };
  } catch (e) {
    err(`DB upsert "${place.companyName}"`, e);
    return { row: null, created: false };
  }
}

/* ─── Enrich result list: career page + distance + DB save ───────────── */
async function enrichPlaces(places, { userLat, userLon, city, keyword } = {}) {
  const enriched = await Promise.allSettled(
    places.map(async (p) => {
      // Parallel: career page probe
      const careerPage = await detectCareerPage(p.website).catch(() => null);

      // DB upsert
      await upsertToDb(p, careerPage, { city: city || null, keyword: keyword || null });

      // Distance
      let distanceKm   = null;
      let distanceText = null;
      if (userLat != null && p.latitude) {
        distanceKm   = haversineKm(userLat, userLon, p.latitude, p.longitude);
        distanceText = fmtDistance(distanceKm);
      }

      return {
        ...p,
        careerPage,
        distanceKm,
        distanceText,
        city:    city    || null,
        keyword: keyword || null,
      };
    })
  );

  return enriched
    .filter(r => r.status === "fulfilled")
    .map(r => r.value)
    .sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
}

/* ═══════════════════════════════════════════════════════════════════════
   PUBLIC EXPORTS
═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════
   QUERY HELPERS
═══════════════════════════════════════════════════════════════════════ */

/**
 * buildQueryVariants(keyword)
 * Returns an array of search queries to run in parallel.
 * Covers both the user's keyword and common related terms so we get
 * the broadest possible coverage from Google Places.
 */
function buildQueryVariants(keyword = "software company") {
  const base = keyword.toLowerCase().trim();

  // If the user typed a specific company name (not a generic term), just use it
  const GENERIC = ["software company", "it company", "tech company", "technology company",
                   "software", "it", "tech", "startup", "company"];
  if (!GENERIC.includes(base)) {
    return [keyword];  // specific query — no need to expand
  }

  // Generic term — run multiple overlapping queries for maximum coverage
  return [
    "software company",
    "IT company",
    "technology company",
    "tech startup",
    "software development company",
  ];
}

/**
 * mergeAndDedup(settledResults)
 * Merges fulfilled promises from Promise.allSettled and deduplicates by placeId.
 */
function mergeAndDedup(settledResults) {
  const seen = new Set();
  const out  = [];
  for (const r of settledResults) {
    if (r.status !== "fulfilled") continue;
    for (const place of r.value) {
      if (seen.has(place.placeId)) continue;
      seen.add(place.placeId);
      out.push(place);
    }
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════
   PUBLIC EXPORTS
═══════════════════════════════════════════════════════════════════════ */

/**
 * getNearbyCompanies({ lat, lon, radius, keyword })
 * Runs 5 parallel query variants, 3 pages each → up to 300 raw results → deduplicated.
 */
export async function getNearbyCompanies({ lat, lon, radius = 15, keyword = "software company" }) {
  if (lat == null || lon == null) throw new Error("lat/lon required");

  const cacheKey = `nearby:${Math.round(lat * 100)}:${Math.round(lon * 100)}:${radius}:${keyword}`;
  const cached   = memGet(cacheKey);
  if (cached) return cached;

  const radiusM   = Math.min(radius * 1000, 50000);

  // Build query variants to maximise coverage
  const queries = buildQueryVariants(keyword);

  log(`getNearbyCompanies: running ${queries.length} parallel queries, radius=${radius}km`);

  // Fetch all query variants in parallel (each can return up to 60 via pagination)
  const allFetches = await Promise.allSettled(
    queries.map(q => googleTextSearch({
      textQuery:    `${q} near me`,
      lat, lon,
      radiusMeters: radiusM,
      maxPages:     3,
    }))
  );

  const merged = mergeAndDedup(allFetches);
  log(`getNearbyCompanies: ${merged.length} unique companies after dedup`);

  const result = await enrichPlaces(merged, { userLat: lat, userLon: lon, keyword });

  const payload = { companies: result, total: result.length, source: "google_places" };
  memSet(cacheKey, payload);
  return payload;
}

/**
 * searchCompaniesByCity({ keyword, city, userLat, userLon })
 * Runs multiple parallel queries to maximise result count.
 */
export async function searchCompaniesByCity({ keyword = "software company", city, userLat, userLon }) {
  if (!city?.trim()) throw new Error("city is required");

  const cacheKey = `city:${city.toLowerCase().trim()}:${keyword.toLowerCase().trim()}`;
  const cached   = memGet(cacheKey);
  if (cached) {
    if (userLat != null && cached.companies) {
      const withDist = cached.companies.map(c => {
        if (!c.latitude) return c;
        const km = haversineKm(userLat, userLon, c.latitude, c.longitude);
        return { ...c, distanceKm: km, distanceText: fmtDistance(km) };
      });
      return { ...cached, companies: withDist };
    }
    return cached;
  }

  // Geocode city for locationBias
  let lat = userLat, lon = userLon;
  if (lat == null) {
    try { const g = await geocodeCity(city); lat = g.lat; lon = g.lon; }
    catch { log(`Geocode failed for "${city}", continuing without bias`); }
  }

  const queries = buildQueryVariants(keyword);
  log(`searchCompaniesByCity "${city}": running ${queries.length} parallel queries`);

  const allFetches = await Promise.allSettled(
    queries.map(q => googleTextSearch({
      textQuery:    `${q} in ${city}`,
      lat, lon,
      radiusMeters: 30000,
      maxPages:     3,
    }))
  );

  const merged = mergeAndDedup(allFetches);
  log(`searchCompaniesByCity: ${merged.length} unique companies for "${city}"`);

  const result = await enrichPlaces(merged, { userLat: lat, userLon: lon, city, keyword });

  const payload = { companies: result, total: result.length, source: "google_places" };
  memSet(cacheKey, payload);
  return payload;
}

/**
 * getCompanyDetails(placeId)
 * Fetches full detail including photos and reviews.
 */
export async function getCompanyDetails(placeId) {
  if (!placeId) throw new Error("placeId required");

  const cacheKey = `details:${placeId}`;
  const cached   = memGet(cacheKey);
  if (cached) return cached;

  // Check DB first
  const existing = await Company.findOne({ where: { placeId } });

  let details;
  try {
    const raw   = await googlePlaceDetails(placeId);
    const apiKey = getApiKey();

    // Build photo URLs
    const photos = raw.photoRefs.map(ref => buildPhotoUrl(ref, 800));

    // Reviews come back in the raw API response, need special handling
    // Re-fetch with reviews in mask
    const { data: fullData } = await axios.get(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": DETAIL_FIELDS,
        },
        timeout: 12000,
      }
    );

    const reviews = normaliseReviews(fullData.reviews || []);

    const careerPage = await detectCareerPage(raw.website).catch(() => null);

    // Update DB
    await upsertToDb(raw, careerPage);

    details = {
      ...raw,
      photos,
      reviews,
      careerPage,
      editorialSummary: fullData.editorialSummary?.text || raw.editorialSummary || null,
    };
  } catch (e) {
    // Fallback to DB data if Google API fails
    if (existing) {
      log(`Google API failed for ${placeId}, serving from DB`);
      details = {
        placeId:        existing.placeId,
        companyName:    existing.companyName,
        address:        existing.address,
        website:        existing.website,
        phone:          existing.phone,
        rating:         existing.rating,
        mapsUrl:        existing.mapsUrl,
        businessStatus: existing.businessStatus,
        openingHours:   existing.openingHours,
        types:          existing.types,
        industry:       existing.industry,
        logo:           existing.logo,
        careerPage:     existing.careerPage,
        photos:         [],
        reviews:        [],
        latitude:       existing.latitude,
        longitude:      existing.longitude,
      };
    } else {
      throw e;
    }
  }

  memSet(cacheKey, details);
  return details;
}
