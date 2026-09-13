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
import { Op } from "sequelize";
import Company from "../models/company.model.js";
import { invalidatePublicSnapshot } from "./publicSnapshot.service.js";

/* ─── Logging ─────────────────────────────────────────────────────────── */
const TAG = "[places.service]";
const log  = (msg, d)  => console.log(`${new Date().toISOString()} ${TAG} ${msg}`, d != null ? d : "");
const err  = (msg, e)  => console.error(`${new Date().toISOString()} ${TAG} ERROR ${msg}`, e?.message || e);

/* ─── In-memory cache (6 h TTL) ──────────────────────────────────────── */
const MEM_CACHE     = new Map();
const CACHE_TTL_MS  = 24 * 60 * 60 * 1000;  // 24 hours (conserve daily quota)
const MAX_RESULTS    = 60;
const GOOGLE_PAGE_SIZE = 20;
const PROVIDER_TIMEOUT_MS = Number(process.env.GOOGLE_PLACES_TIMEOUT_MS || 7000);
const PROVIDER_RETRIES = 1;
const PROVIDER_COOLDOWN_MS = Number(process.env.GOOGLE_PLACES_COOLDOWN_MS || 5 * 60 * 1000);
let providerBlockedUntil = 0;

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

function providerAvailable() {
  if (Date.now() < providerBlockedUntil) {
    throw Object.assign(new Error("Google Places is temporarily unavailable"), { code: "PROVIDER_COOLDOWN" });
  }
}

function noteProviderFailure() {
  providerBlockedUntil = Date.now() + PROVIDER_COOLDOWN_MS;
}

function noteProviderSuccess() {
  providerBlockedUntil = 0;
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
  "nextPageToken",
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
 * Fetches provider pages until Google has no more results or 60 results have
 * been collected. Google accepts a maximum page size of 20.
 */
async function googleTextSearch({ textQuery, lat, lon, radiusMeters = 15000, pageToken = null }) {
  const apiKey = getApiKey();
  providerAvailable();

  const baseBody = {
    textQuery,
    maxResultCount: GOOGLE_PAGE_SIZE,
    ...(lat != null && lon != null && {
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lon },
          radius: radiusMeters,
        },
      },
    }),
  };

  log(`Google Text Search → "${textQuery}"`, { lat, lon, radiusMeters, hasPageToken: Boolean(pageToken) });

  let nextToken = pageToken;
  let allPlaces = [];
  let pageCount = 0;
  const seenTokens = new Set();

  while (allPlaces.length < MAX_RESULTS) {
    pageCount++;
    const body = nextToken ? { ...baseBody, pageToken: nextToken } : baseBody;
    let data;
    try {
      for (let attempt = 0; attempt <= PROVIDER_RETRIES; attempt++) {
        try {
          ({ data } = await axios.post(
            "https://places.googleapis.com/v1/places:searchText",
            body,
            {
              headers: {
                "Content-Type":   "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": SEARCH_FIELDS,
              },
              timeout: PROVIDER_TIMEOUT_MS,
            }
          ));
          break;
        } catch (requestError) {
          if (attempt === PROVIDER_RETRIES) throw requestError;
        }
      }
    } catch (error) {
      if (allPlaces.length > 0) {
        log(`Google Text Search stopped after ${allPlaces.length} results`, error.message);
        break;
      }
      throw error;
    }

    const pagePlaces = (data.places || []).map(normalisePlace);
    allPlaces = allPlaces.concat(pagePlaces);
    const providerToken = data.nextPageToken || null;
    log(`Google Text Search page ← ${pagePlaces.length} results`, {
      totalSoFar: allPlaces.length,
      hasNextPage: Boolean(providerToken),
    });

    if (!providerToken || seenTokens.has(providerToken) || pagePlaces.length === 0) break;
    seenTokens.add(providerToken);
    nextToken = providerToken;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  log(`Google Text Search complete — ${pageCount} provider page(s), ${allPlaces.length} results`);
  return { places: allPlaces.slice(0, MAX_RESULTS), nextPageToken: null };
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
    const existing = await Company.findOne({ where: { placeId: place.placeId } });
    const now = new Date();
    const payload = {
      companyName:      place.companyName,
      website:          place.website          || null,
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
      source:           "google_places",
      fetchedAt:        now,
      expiresAt:        new Date(now.getTime() + CACHE_TTL_MS),
      ...extras,
    };

    if (careerPage !== undefined) {
      payload.careerPage = careerPage || null;
    }

    if (existing?.adminManaged) {
      await existing.update({ source: "google_places", fetchedAt: now, expiresAt: payload.expiresAt });
      return { row: existing, created: false };
    }
    const [row, created] = await Company.upsert({ placeId: place.placeId, ...payload });
    await invalidatePublicSnapshot("companies");
    return { row, created };
  } catch (e) {
    err(`DB upsert "${place.companyName}"`, e);
    return { row: null, created: false };
  }
}

function normalized(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function validCoordinate(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
}

function matchesKeyword(row, keyword) {
  const terms = normalized(keyword).split(" ").filter(term => term.length > 2);
  if (!terms.length) return true;
  const haystack = normalized([row.companyName, row.industry, row.keyword, row.address, row.types].join(" "));
  return terms.every(term => haystack.includes(term));
}

function storedCompanyResponse(row, { userLat, userLon, city, keyword }) {
  const json = row.toJSON ? row.toJSON() : row;
  let distanceKm = null;
  if (validCoordinate(userLat, -90, 90) && validCoordinate(userLon, -180, 180)
    && validCoordinate(json.latitude, -90, 90) && validCoordinate(json.longitude, -180, 180)) {
    distanceKm = haversineKm(Number(userLat), Number(userLon), Number(json.latitude), Number(json.longitude));
  }
  return {
    ...json,
    placeId: json.placeId,
    source: "database_fallback",
    recordSource: json.source || "unknown",
    attribution: "Stored company record",
    freshness: json.fetchedAt ? (Date.now() - new Date(json.fetchedAt).getTime() < CACHE_TTL_MS ? "stored" : "stale") : "unknown",
    fetchedAt: json.fetchedAt || null,
    expiresAt: json.expiresAt || null,
    distanceKm,
    distanceText: fmtDistance(distanceKm),
    // Stored hours are not a live opening-status signal.
    isOpenNow: null,
    city: json.city || city || null,
    keyword: json.keyword || keyword || null,
  };
}

async function findStoredCompanies({ city, keyword, userLat, userLon, radius }) {
  const rows = await Company.findAll({
    where: city?.trim() ? { city: { [Op.like]: `%${city.trim()}%` } } : {},
    order: [["updatedAt", "DESC"]],
    limit: 500,
  });
  const cityKey = normalized(city);
  return rows
    .filter(row => matchesKeyword(row, keyword))
    .map(row => storedCompanyResponse(row, { userLat, userLon, city, keyword }))
    .filter(company => {
      if (cityKey && normalized(company.city) !== cityKey) return false;
      if (userLat == null || userLon == null) return true;
      return company.distanceKm != null && company.distanceKm <= radius;
    })
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    .slice(0, MAX_RESULTS);
}

async function fallbackPayload(options, error) {
  try {
    const companies = await findStoredCompanies(options);
    return {
      companies,
      total: companies.length,
      nextPageToken: null,
      batchIndex: options.batchIndex || 0,
      hasMoreBatches: false,
      source: "database_fallback",
      freshness: companies.length ? "stored" : "none",
      providerError: error?.code || error?.response?.data?.error?.status || "PROVIDER_ERROR",
    };
  } catch (dbError) {
    err("Database fallback failed", dbError);
    throw error;
  }
}

/* ─── Enrich result list: career page + distance + DB save ───────────── */
async function enrichPlaces(places, { userLat, userLon, city, keyword, skipCareerProbe = false } = {}) {
  const enriched = await Promise.allSettled(
    places.map(async (p) => {
      // Parallel: career page probe (skipped when caller runs full verification)
      const careerPage = skipCareerProbe
        ? null
        : await detectCareerPage(p.website).catch(() => null);

      // DB upsert — preserve career cache when skipping probe
      await upsertToDb(p, skipCareerProbe ? undefined : careerPage, { city: city || null, keyword: keyword || null });

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
 *
 * QUOTA NOTE: Google Places Text Search free tier = 100 req/day.
 * Each variant × maxPages = API calls consumed per user search.
 * Keep variants at 1 to stay well within daily quota.
 */
function buildQueryVariants(keyword = "software company") {
  return [
    keyword,
    `${keyword} development`,
    `${keyword} technology`,
    `${keyword} services`,
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
    for (const place of r.value.places || []) {
      if (seen.has(place.placeId)) continue;
      seen.add(place.placeId);
      out.push(place);
    }
  }
  return out;
}

function filterByRadius(places, userLat, userLon, radiusKm) {
  if (userLat == null || userLon == null) return places;
  return places.filter(place => {
    if (place.latitude == null || place.longitude == null) return true;
    return haversineKm(userLat, userLon, place.latitude, place.longitude) <= radiusKm;
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   PUBLIC EXPORTS
═══════════════════════════════════════════════════════════════════════ */

/**
 * getNearbyCompanies({ lat, lon, radius, keyword })
 * Runs the configured query variants for one provider page; the cursor enables
 * subsequent pages without losing the provider's pagination state.
 */
export async function getNearbyCompanies({ lat, lon, radius = 15, keyword = "software company", pageToken = null, batchIndex = 0, skipCareerProbe = false }) {
  if (lat == null || lon == null) throw new Error("lat/lon required");

  const cacheKey = `places-v4:nearby:${Math.round(lat * 100)}:${Math.round(lon * 100)}:${radius}:${keyword}:${batchIndex}:${pageToken || "first"}`;
  const cached   = memGet(cacheKey);
  if (cached) return cached;

  const radiusM   = Math.min(radius * 1000, 50000);

  // Fetch all provider pages available for this query, capped at 60 results.
  const queryVariants = buildQueryVariants(keyword);
  const query = queryVariants[batchIndex];
  if (!query) return { companies: [], total: 0, nextPageToken: null, hasMoreBatches: false, source: "google_places" };

  log(`getNearbyCompanies: batch ${batchIndex + 1}/${queryVariants.length}, radius=${radius}km`);

  // Fetch all query variants in parallel (one page per query).
  const allFetches = await Promise.allSettled(
    [query].map(q => googleTextSearch({
      textQuery:    `${q} near me`,
      lat, lon,
      radiusMeters: radiusM,
      pageToken,
    }))
  );

  if (allFetches.every(result => result.status === "rejected")) {
    noteProviderFailure();
    return fallbackPayload({ userLat: lat, userLon: lon, radius, keyword, batchIndex }, allFetches[0].reason);
  }
  noteProviderSuccess();

  const merged = filterByRadius(mergeAndDedup(allFetches), lat, lon, radius).slice(0, MAX_RESULTS);
  log(`getNearbyCompanies: ${merged.length} unique companies after dedup`);

  // If all fetches failed, surface the first error so the controller can return a proper error response
  const result = await enrichPlaces(merged, { userLat: lat, userLon: lon, keyword, skipCareerProbe });

  const nextPageToken = allFetches.find(r => r.status === "fulfilled")?.value?.nextPageToken || null;
  const payload = { companies: result, total: result.length, nextPageToken, batchIndex, hasMoreBatches: batchIndex < queryVariants.length - 1, source: "google_places", freshness: "live", attribution: "Google Maps" };
  memSet(cacheKey, payload);
  return payload;
}

/**
 * searchCompaniesByCity({ keyword, city, userLat, userLon })
 * Runs multiple parallel queries to maximise result count.
 */
export async function searchCompaniesByCity({ keyword = "software company", city, userLat, userLon, radius = 50, pageToken = null, batchIndex = 0, skipCareerProbe = false }) {
  if (!city?.trim()) throw new Error("city is required");

  const cacheKey = `places-v4:city:${city.toLowerCase().trim()}:${keyword.toLowerCase().trim()}:${radius}:${batchIndex}:${pageToken || "first"}`;
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

  const queryVariants = buildQueryVariants(keyword);
  const query = queryVariants[batchIndex];
  if (!query) return { companies: [], total: 0, nextPageToken: null, hasMoreBatches: false, source: "google_places" };
  log(`searchCompaniesByCity "${city}": batch ${batchIndex + 1}/${queryVariants.length}`);

  const allFetches = await Promise.allSettled(
    [query].map(q => googleTextSearch({
      textQuery:    `${q} in ${city}`,
      lat, lon,
      radiusMeters: Math.min(radius * 1000, 50000),
      pageToken,
    }))
  );

  if (allFetches.every(result => result.status === "rejected")) {
    noteProviderFailure();
    return fallbackPayload({ city, userLat: lat, userLon: lon, radius, keyword, batchIndex }, allFetches[0].reason);
  }
  noteProviderSuccess();

  const merged = filterByRadius(mergeAndDedup(allFetches), lat, lon, radius).slice(0, MAX_RESULTS);
  log(`searchCompaniesByCity: ${merged.length} unique companies for "${city}"`);

  // If all fetches failed, surface the first error
  const result = await enrichPlaces(merged, { userLat: lat, userLon: lon, city, keyword, skipCareerProbe });

  const nextPageToken = allFetches.find(r => r.status === "fulfilled")?.value?.nextPageToken || null;
  const payload = { companies: result, total: result.length, nextPageToken, batchIndex, hasMoreBatches: batchIndex < queryVariants.length - 1, source: "google_places", freshness: "live", attribution: "Google Maps" };
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
  let existing = null;
  try {
    existing = await Company.findOne({ where: { placeId } });
  } catch (dbError) {
    err(`DB lookup failed for ${placeId}`, dbError);
  }

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
      source: "google_places",
      freshness: "live",
      attribution: "Google Maps",
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
        source:         "database_fallback",
        freshness:      existing.fetchedAt ? "stored" : "unknown",
        fetchedAt:      existing.fetchedAt || null,
        expiresAt:      existing.expiresAt || null,
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
