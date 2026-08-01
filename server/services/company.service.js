import axios from "axios";
import Company from "../models/company.model.js";

/* ── In-memory cache (30 min TTL) ──────────────────────────────────────── */
const cache     = new Map();
const CACHE_TTL = 30 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}
function setCache(key, data) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

/* ── Career page detector ───────────────────────────────────────────────── */
const CAREER_PATHS = ["/careers", "/jobs", "/career", "/work-with-us", "/join-us"];

async function detectCareerPage(website) {
  if (!website) return null;
  const base = website.replace(/\/$/, "");
  for (const path of CAREER_PATHS) {
    try {
      const res = await axios.head(`${base}${path}`, {
        timeout: 3000,
        maxRedirects: 3,
        validateStatus: (s) => s < 400,
      });
      if (res.status < 400) return `${base}${path}`;
    } catch { /* try next */ }
  }
  return null;
}

/* ── Google Place Details ───────────────────────────────────────────────── */
async function fetchPlaceDetails(placeId, apiKey) {
  const fields = [
    "name", "website", "formatted_address", "formatted_phone_number",
    "rating", "geometry", "url", "business_status", "opening_hours", "types",
  ].join(",");

  const { data } = await axios.get(
    "https://maps.googleapis.com/maps/api/place/details/json",
    { params: { place_id: placeId, fields, key: apiKey }, timeout: 10000 }
  );

  if (data.status !== "OK") {
    throw new Error(`Place Details API error: ${data.status}`);
  }

  const r = data.result;
  return {
    placeId,
    companyName:    r.name                           || "",
    website:        r.website                        || null,
    address:        r.formatted_address              || null,
    phone:          r.formatted_phone_number         || null,
    rating:         r.rating                         || null,
    latitude:       r.geometry?.location?.lat        || null,
    longitude:      r.geometry?.location?.lng        || null,
    mapsUrl:        r.url                            || null,
    businessStatus: r.business_status                || null,
    openingHours:   r.opening_hours?.weekday_text    || null,
    types:          r.types                          || null,
  };
}

/* ── Safe DB upsert: findOne → update or create ─────────────────────────── */
async function upsertCompany(details, careerPage, city, keyword) {
  const existing = await Company.findOne({ where: { placeId: details.placeId } });

  const payload = {
    companyName:    details.companyName,
    website:        details.website,
    address:        details.address,
    phone:          details.phone,
    rating:         details.rating,
    latitude:       details.latitude,
    longitude:      details.longitude,
    mapsUrl:        details.mapsUrl,
    businessStatus: details.businessStatus,
    openingHours:   details.openingHours,
    types:          details.types,
    careerPage:     careerPage || null,
    city:           city.trim(),
    keyword:        keyword.trim(),
  };

  if (existing) {
    await existing.update(payload);
    return existing;
  }

  return await Company.create({ placeId: details.placeId, ...payload });
}

/* ── Main export ────────────────────────────────────────────────────────── */
export async function searchCompanies({ keyword, city }) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured on the server.");
  }

  const query    = `${keyword} in ${city}`;
  const cacheKey = `search:${query.toLowerCase()}`;

  const cached = getCached(cacheKey);
  if (cached) return cached;

  /* ── Step 1: Text Search ─────────────────────────────────────────────── */
  const { data: searchData } = await axios.get(
    "https://maps.googleapis.com/maps/api/place/textsearch/json",
    { params: { query, key: apiKey }, timeout: 10000 }
  );

  if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places Text Search failed: ${searchData.status}`);
  }

  const places = searchData.results || [];
  if (places.length === 0) {
    setCache(cacheKey, []);
    return [];
  }

  /* ── Step 2: Parallel Place Details ─────────────────────────────────── */
  const detailsResults = await Promise.allSettled(
    places.map((p) => fetchPlaceDetails(p.place_id, apiKey))
  );

  const companies = [];

  for (const result of detailsResults) {
    if (result.status !== "fulfilled") continue;
    const details = result.value;

    // Always include every result in the response
    let dbId       = null;
    let careerPage = null;

    if (details.website) {
      try {
        careerPage  = await detectCareerPage(details.website).catch(() => null);
        const saved = await upsertCompany(details, careerPage, city, keyword);
        dbId = saved.id;
      } catch (dbErr) {
        // DB failure should never block the response
        console.error(`[company.service] DB upsert failed for "${details.companyName}":`, dbErr.message);
      }
    }

    companies.push({
      id:             dbId,
      placeId:        details.placeId,
      companyName:    details.companyName,
      website:        details.website,
      address:        details.address,
      phone:          details.phone,
      rating:         details.rating,
      latitude:       details.latitude,
      longitude:      details.longitude,
      mapsUrl:        details.mapsUrl,
      businessStatus: details.businessStatus,
      openingHours:   details.openingHours,
      types:          details.types,
      careerPage,
      city:           city.trim(),
      keyword:        keyword.trim(),
    });
  }

  setCache(cacheKey, companies);
  return companies;
}
