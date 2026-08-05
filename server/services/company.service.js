/**
 * company.service.js
 *
 * Search pipeline:
 *   1. Google Places API v2  (POST /v1/places:searchText)
 *   2. Fallback → OpenStreetMap Overpass + Nominatim (free, no key)
 *
 * Features:
 *   • Accepts lat/lon directly → skips geocoding, faster & more accurate
 *   • Haversine distance calculation + sort nearest-first
 *   • Radius expansion fallback (25 → 50 → 100 km)
 *   • Career-page detector
 *   • DB upsert by place_id (no duplicates)
 *   • 30-min in-memory cache
 */
import axios from "axios";
import Company from "../models/company.model.js";

/* ─────────────────────────────────────────────────────────────────────────
   LOGGING
───────────────────────────────────────────────────────────────────────── */
const P = "[company.service]";
function log(level, msg, data = {}) {
  const line = `${new Date().toISOString()} ${P} [${level.toUpperCase()}] ${msg}`;
  if (Object.keys(data).length)
    console[level === "error" ? "error" : "log"](line, JSON.stringify(data));
  else
    console[level === "error" ? "error" : "log"](line);
}

/* ─────────────────────────────────────────────────────────────────────────
   HAVERSINE DISTANCE  (returns km)
───────────────────────────────────────────────────────────────────────── */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R  = 6371;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dN = ((lon2 - lon1) * Math.PI) / 180;
  const a  =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dN / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDistance(km) {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}

/* ─────────────────────────────────────────────────────────────────────────
   IN-MEMORY CACHE  (30 min TTL)
───────────────────────────────────────────────────────────────────────── */
const cache     = new Map();
const CACHE_TTL = 30 * 60 * 1000;

function getCached(key) {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) { cache.delete(key); return null; }
  log("info", `Cache HIT: ${key}`);
  return e.data;
}
function setCache(key, data) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
  log("info", `Cache SET: ${key}, items=${data.length}`);
}

/* ─────────────────────────────────────────────────────────────────────────
   CAREER PAGE DETECTOR
   Hard cap: 800 ms total. If the site doesn't respond in time we return
   null rather than blocking the entire enrichment pipeline.
───────────────────────────────────────────────────────────────────────── */
const CAREER_PATHS = ["/careers", "/jobs", "/career", "/hiring"];  // reduced from 7 → 4

async function detectCareerPage(website) {
  if (!website) return null;
  const base = website.replace(/\/$/, "");

  // Race all probes against a 800 ms hard deadline
  const probe = (path) =>
    axios.head(`${base}${path}`, {
      timeout: 800,
      maxRedirects: 2,
      validateStatus: s => s < 400,
    })
      .then(() => `${base}${path}`)
      .catch(() => null);

  const deadline = new Promise(resolve => setTimeout(() => resolve(null), 800));

  const result = await Promise.race([
    Promise.any(CAREER_PATHS.map(probe)).catch(() => null),
    deadline,
  ]);

  return result ?? null;
}

/* ─────────────────────────────────────────────────────────────────────────
   DB UPSERT  (idempotent by place_id)
───────────────────────────────────────────────────────────────────────── */
async function upsertCompany(details, careerPage, city, keyword) {
  try {
    const existing = await Company.findOne({ where: { placeId: details.placeId } });
    const payload  = {
      companyName: details.companyName, website: details.website || null,
      address: details.address || null, phone: details.phone || null,
      rating: details.rating || null,   latitude: details.latitude || null,
      longitude: details.longitude || null, mapsUrl: details.mapsUrl || null,
      businessStatus: details.businessStatus || null,
      openingHours: details.openingHours || null, types: details.types || null,
      careerPage: careerPage || null, city: city.trim(), keyword: keyword.trim(),
      logo: details.logo || null, industry: details.industry || null,
    };
    if (existing) { await existing.update(payload); return existing; }
    return await Company.create({ placeId: details.placeId, ...payload });
  } catch (err) {
    log("error", `DB upsert failed for "${details.companyName}"`, { error: err.message });
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   GOOGLE KEY VALIDATION
   A minimal synchronous check before we waste a round-trip.
   Returns { valid: bool, reason: string|null }
───────────────────────────────────────────────────────────────────────── */
function validateGoogleKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string") {
    return { valid: false, reason: "GOOGLE_MAPS_API_KEY is not set" };
  }
  const trimmed = apiKey.trim();
  if (trimmed === "" || trimmed === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    return { valid: false, reason: "GOOGLE_MAPS_API_KEY is a placeholder — replace it with a real key" };
  }
  // Google API keys are 39 chars, start with "AIza"
  if (!trimmed.startsWith("AIza") || trimmed.length < 35) {
    return { valid: false, reason: `API key looks malformed (got: "${trimmed.slice(0, 8)}…")` };
  }
  return { valid: true, reason: null };
}
const SEARCH_FIELD_MASK = [
  "places.id","places.displayName","places.formattedAddress",
  "places.websiteUri","places.nationalPhoneNumber","places.rating",
  "places.location","places.googleMapsUri","places.businessStatus",
  "places.regularOpeningHours","places.types","places.primaryTypeDisplayName",
  "places.iconMaskBaseUri",
].join(",");

function normaliseGooglePlace(p) {
  return {
    placeId:        p.id || `google_${Date.now()}_${Math.random()}`,
    companyName:    p.displayName?.text || "Unknown",
    website:        p.websiteUri || null,
    address:        p.formattedAddress || null,
    phone:          p.nationalPhoneNumber || null,
    rating:         p.rating ?? null,
    latitude:       p.location?.latitude ?? null,
    longitude:      p.location?.longitude ?? null,
    mapsUrl:        p.googleMapsUri || null,
    businessStatus: p.businessStatus || null,
    openingHours:   p.regularOpeningHours?.weekdayDescriptions || null,
    types:          p.types || null,
    industry:       p.primaryTypeDisplayName?.text || null,
    logo:           p.iconMaskBaseUri ? `${p.iconMaskBaseUri}.png` : null,
    source:         "google_v2",
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   GOOGLE PLACES API v2
───────────────────────────────────────────────────────────────────────── */
async function searchViaGoogle(textQuery, apiKey) {
  log("info", "Google Places v2 → REQUEST", { textQuery });
  const { data, status } = await axios.post(
    "https://places.googleapis.com/v1/places:searchText",
    { textQuery, maxResultCount: 20 },
    { headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": SEARCH_FIELD_MASK }, timeout: 15000 }
  );
  log("info", "Google Places v2 → RESPONSE", { httpStatus: status, count: data.places?.length ?? 0 });
  return (data.places || []).map(normaliseGooglePlace);
}

/* ─────────────────────────────────────────────────────────────────────────
   GEOCODE CITY  (only needed when lat/lon not provided)
───────────────────────────────────────────────────────────────────────── */
async function geocodeCity(city) {
  log("info", "Nominatim geocode →", { city });
  const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: { q: city, format: "json", limit: 1, addressdetails: 1 },
    headers: { "User-Agent": "CareerLaunchAI/1.0" },
    timeout: 8000,
  });
  if (!data?.length) throw new Error(`Cannot geocode city "${city}"`);
  const result = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  log("info", "Nominatim geocode ← ", result);
  return result;
}

/* ─────────────────────────────────────────────────────────────────────────
   OVERPASS QUERY  (with configurable radius + mirror fallback + 429 retry)
───────────────────────────────────────────────────────────────────────── */
// Two endpoints — primary + mirror. If primary 429s we try the mirror.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

async function queryOverpass(keyword, lat, lon, radiusM) {
  const kw1      = keyword.split(" ")[0];
  const timeoutS = Math.min(25, Math.ceil(radiusM / 1000) + 5);
  const qstr = [
    `[out:json][timeout:${timeoutS}];`,
    `(`,
    `  node["office"](around:${radiusM},${lat},${lon});`,
    `  node["name"~"${kw1}",i](around:${radiusM},${lat},${lon});`,
    `);`,
    `out body;`,
  ].join("");

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const url = `${endpoint}?data=${encodeURIComponent(qstr)}`;
    log("info", "Overpass →", { endpoint: endpoint.replace("https://",""), radiusKm: radiusM / 1000 });
    try {
      const { data } = await axios.get(url, {
        headers: { "User-Agent": "CareerLaunchAI/1.0", "Accept": "application/json" },
        timeout: (timeoutS + 5) * 1000,
      });
      log("info", "Overpass ←", { elements: data.elements?.length ?? 0 });
      return data.elements || [];
    } catch (e) {
      const is429 = e.response?.status === 429;
      const isTimeout = e.code === "ECONNABORTED";
      log("error", `Overpass ${endpoint.includes("kumi") ? "mirror" : "primary"} failed: ${e.message}`, {
        status: e.response?.status, is429, isTimeout,
      });
      if (is429 && endpoint === OVERPASS_ENDPOINTS[0]) {
        log("info", "Primary rate-limited (429) — trying mirror endpoint…");
        continue; // try mirror
      }
      throw e; // non-429 error, don't retry
    }
  }
  return [];
}

/* ─────────────────────────────────────────────────────────────────────────
   NOMINATIM NAME SEARCH  (last-resort fallback)
───────────────────────────────────────────────────────────────────────── */
async function nominatimSearch(keyword, city) {
  log("info", "Nominatim name search →", { q: `${keyword} ${city}` });
  const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: { q: `${keyword} ${city}`, format: "json", limit: 20, addressdetails: 1, extratags: 1, namedetails: 1 },
    headers: { "User-Agent": "CareerLaunchAI/1.0" },
    timeout: 10000,
  });
  log("info", "Nominatim name search ←", { count: data.length });
  return data.filter(r => r.display_name).map(r => ({
    placeId:        `osm_nom_${r.osm_type}_${r.osm_id}`,
    companyName:    r.namedetails?.name || r.display_name.split(",")[0] || "Unknown",
    website:        r.extratags?.website || null,
    address:        r.display_name,
    phone:          r.extratags?.phone || null,
    rating:         null,
    latitude:       parseFloat(r.lat),
    longitude:      parseFloat(r.lon),
    mapsUrl:        `https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lon}`,
    businessStatus: "OPERATIONAL",
    openingHours:   null,
    types:          [r.type],
    industry:       r.type || null,
    logo:           null,
    source:         "nominatim",
  }));
}

/* ─────────────────────────────────────────────────────────────────────────
   NORMALISE OSM ELEMENT
───────────────────────────────────────────────────────────────────────── */
function normaliseOsm(el, city, keyword) {
  const t   = el.tags || {};
  const lat = el.lat ?? el.center?.lat ?? null;
  const lon = el.lon ?? el.center?.lon ?? null;
  const address = [t["addr:housenumber"], t["addr:street"], t["addr:city"] || city, t["addr:state"]]
    .filter(Boolean).join(", ") || null;
  return {
    placeId:        `osm_${el.type}_${el.id}`,
    companyName:    t.name || t["name:en"] || "Unknown",
    website:        t.website || t["contact:website"] || null,
    address,
    phone:          t.phone || t["contact:phone"] || null,
    rating:         null,
    latitude:       lat,
    longitude:      lon,
    mapsUrl:        lat && lon ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}` : null,
    businessStatus: "OPERATIONAL",
    openingHours:   t.opening_hours ? [t.opening_hours] : null,
    types:          [t.office || t.amenity || "company"].filter(Boolean),
    industry:       t.office || t.amenity || null,
    logo:           null,
    source:         "openstreetmap",
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   LOCAL COMPANY FALLBACK
   Used when both Google Places and Overpass are unavailable.
   Covers major software companies in Pune / Hinjawadi / Marunji belt.
───────────────────────────────────────────────────────────────────────── */
const PUNE_SOFTWARE_COMPANIES = [
  { name:"Infosys BPM",          address:"Hinjawadi Phase 1, Pune 411057",   lat:18.5987, lon:73.7382, website:"https://www.infosysbpm.com",        phone:null,           rating:4.1 },
  { name:"Wipro Technologies",   address:"Marunji Road, Hinjawadi, Pune",    lat:18.5980, lon:73.7270, website:"https://www.wipro.com",              phone:"+91-20-6667-4000", rating:4.0 },
  { name:"Persistent Systems",   address:"Bhageerath IT Park, Senapati Bapat Road, Pune", lat:18.5279, lon:73.8529, website:"https://www.persistent.com", phone:"+91-20-6703-0000", rating:4.2 },
  { name:"Tech Mahindra",        address:"Plot 1, Phase 3, Rajiv Gandhi IT Park, Hinjawadi", lat:18.5987, lon:73.7420, website:"https://www.techmahindra.com", phone:null, rating:3.9 },
  { name:"Cognizant",            address:"SEZ Tower, Magarpatta City, Hadapsar, Pune", lat:18.5018, lon:73.9260, website:"https://www.cognizant.com", phone:null, rating:4.0 },
  { name:"Capgemini",            address:"Prestige Shantiniketan, Pune 411057", lat:18.5980, lon:73.7390, website:"https://www.capgemini.com",        phone:null,           rating:4.0 },
  { name:"Xoriant Solutions",    address:"Hinjawadi Phase 1, Pune 411057",   lat:18.5992, lon:73.7360, website:"https://www.xoriant.com",            phone:"+91-20-6646-6000", rating:4.1 },
  { name:"Zensar Technologies",  address:"Zensar Knowledge Park, Kothrud, Pune", lat:18.5074, lon:73.8057, website:"https://www.zensar.com",         phone:"+91-20-6606-4000", rating:4.0 },
  { name:"Cyient",               address:"Magarpatta City, Hadapsar, Pune",  lat:18.5030, lon:73.9250, website:"https://www.cyient.com",             phone:null,           rating:4.0 },
  { name:"EPAM Systems",         address:"Wakad, Pune 411057",               lat:18.6070, lon:73.7601, website:"https://www.epam.com",               phone:null,           rating:4.2 },
  { name:"Syntel (Atos)",        address:"Baner Road, Pune 411045",          lat:18.5590, lon:73.7868, website:"https://atos.net",                   phone:null,           rating:3.8 },
  { name:"Mphasis",              address:"Embassy Tech Zone, Hinjawadi, Pune", lat:18.5990, lon:73.7350, website:"https://www.mphasis.com",          phone:null,           rating:3.9 },
  { name:"Accenture",            address:"Pune SEZ, Hinjawadi Phase 2",      lat:18.5985, lon:73.7400, website:"https://www.accenture.com",          phone:null,           rating:4.1 },
  { name:"HCL Technologies",     address:"Pune 411057",                      lat:18.5930, lon:73.7350, website:"https://www.hcltech.com",            phone:null,           rating:3.9 },
  { name:"TCS",                  address:"Rajiv Gandhi IT Park, Hinjawadi",  lat:18.5975, lon:73.7430, website:"https://www.tcs.com",                phone:null,           rating:3.9 },
];

function buildLocalFallback(city, keyword) {
  const cityKey = (city || "").toLowerCase();
  const kwKey   = (keyword || "").toLowerCase();
  return PUNE_SOFTWARE_COMPANIES
    .filter(c =>
      // Only show for Pune / Hinjawadi / Marunji searches
      ["pune","hinjawadi","marunji","wakad","baner","pimpri","kothrud","hadapsar"].some(k => cityKey.includes(k))
    )
    .map((c, i) => ({
      placeId:        `local_pune_${i}_${c.name.replace(/\s+/g,"_").toLowerCase()}`,
      companyName:    c.name,
      website:        c.website,
      address:        c.address,
      phone:          c.phone,
      rating:         c.rating,
      latitude:       c.lat,
      longitude:      c.lon,
      mapsUrl:        `https://www.openstreetmap.org/?mlat=${c.lat}&mlon=${c.lon}`,
      businessStatus: "OPERATIONAL",
      openingHours:   null,
      types:          ["software_company"],
      industry:       "Software",
      logo:           null,
      source:         "local_fallback",
    }));
}
async function searchViaOSM(keyword, city, userLat, userLon) {
  // Step 1 — get centre coords (use user coords if available)
  let lat = userLat, lon = userLon;
  if (lat == null || lon == null) {
    const geo = await geocodeCity(city);
    lat = geo.lat; lon = geo.lon;
  }

  // Step 2 — Overpass with small-to-large radius expansion
  // Start small (2 km) to avoid 504 on dense urban areas,
  // expand progressively until we get results.
  const RADII_M = [2000, 5000, 10000, 15000, 25000];
  let elements = [];
  for (const r of RADII_M) {
    try {
      elements = await queryOverpass(keyword, lat, lon, r);
      if (elements.length > 0) {
        log("info", `Overpass found ${elements.length} results at ${r / 1000} km`);
        break;
      }
      log("info", `Overpass: 0 results at ${r / 1000} km, expanding…`);
    } catch (e) {
      log("error", `Overpass ${r / 1000}km failed: ${e.message}`);
    }
  }

  if (elements.length > 0) {
    return elements.map(el => normaliseOsm(el, city, keyword));
  }

  // Step 3 — Nominatim name search as last resort
  log("info", "Overpass returned 0 across all radii — trying Nominatim name search");
  return nominatimSearch(keyword, city);
}

/* ─────────────────────────────────────────────────────────────────────────
   ENRICH RESULTS  (career page + DB upsert + distance)
───────────────────────────────────────────────────────────────────────── */
async function enrichResults(places, city, keyword, source, userLat, userLon) {
  const enriched = await Promise.allSettled(
    places.map(async p => {
      let careerPage = null;
      if (p.website) careerPage = await detectCareerPage(p.website).catch(() => null);

      const saved = await upsertCompany(p, careerPage, city, keyword);
      const dbId  = saved?.id ?? null;

      let distanceKm   = null;
      let distanceText = null;
      if (userLat != null && userLon != null && p.latitude && p.longitude) {
        distanceKm   = haversineKm(userLat, userLon, p.latitude, p.longitude);
        distanceText = fmtDistance(distanceKm);
      }

      return {
        id: dbId, placeId: p.placeId, companyName: p.companyName,
        website: p.website, address: p.address, phone: p.phone,
        rating: p.rating, latitude: p.latitude, longitude: p.longitude,
        mapsUrl: p.mapsUrl, businessStatus: p.businessStatus,
        openingHours: p.openingHours, types: p.types, industry: p.industry,
        logo: p.logo, careerPage, city: city.trim(), keyword: keyword.trim(),
        dataSource: source, distanceKm, distanceText,
      };
    })
  );

  let results = enriched.filter(r => r.status === "fulfilled").map(r => r.value);

  // Sort nearest-first when distance is available
  if (userLat != null) {
    results.sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }

  return results;
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
   searchCompanies({ keyword, city, lat, lon })
   lat/lon optional — pass user coords for nearest-first results.
───────────────────────────────────────────────────────────────────────── */
export async function searchCompanies({ keyword, city, lat: userLat, lon: userLon }) {
  const query    = `${keyword} in ${city}`;
  const cacheKey = `search:${query.toLowerCase()}:${userLat ? Math.round(userLat * 100) : "x"}`;

  const cached = getCached(cacheKey);
  if (cached) return { companies: cached, source: "cache", total: cached.length, googleError: null };

  const apiKey   = (process.env.GOOGLE_MAPS_API_KEY || "").trim();
  const keyCheck = validateGoogleKey(apiKey);

  log("info", `searchCompanies: keyword="${keyword}" city="${city}" lat=${userLat ?? "none"} lon=${userLon ?? "none"}`);
  log("info", `Google key (${apiKey.length} chars) valid: ${keyCheck.valid}${keyCheck.reason ? ` — ${keyCheck.reason}` : ""}`);

  let places      = [];
  let source      = "unknown";
  let googleError = null;

  /* 1 ── Google Places v2 (only if key passes validation) */
  if (keyCheck.valid) {
    try {
      log("info", `Google Places v2 for: "${query}"`);
      places = await searchViaGoogle(query, apiKey);
      source = "google_v2";
      log("info", `Google returned ${places.length} results`);
    } catch (err) {
      googleError = {
        status:     err.response?.data?.error?.status || (err.code === "ECONNABORTED" ? "TIMEOUT" : "UNKNOWN"),
        message:    err.response?.data?.error?.message || err.message,
        httpStatus: err.response?.status || 0,
      };
      log("error", "Google failed → falling back to OSM", googleError);
    }
  } else {
    googleError = {
      status:  "INVALID_KEY",
      message: keyCheck.reason,
      httpStatus: 0,
    };
    log("warn", `Skipping Google Places: ${keyCheck.reason}`);
  }

  /* 2 ── OSM fallback */
  if (places.length === 0) {
    try {
      log("info", `OSM fallback for: "${query}"`);
      places = await searchViaOSM(keyword, city, userLat, userLon);
      source = "openstreetmap";
      log("info", `OSM returned ${places.length} results`);
    } catch (osmErr) {
      log("error", "OSM also failed", { error: osmErr.message });
      // Don't throw yet — try local fallback first
    }
  }

  /* 3 ── Local curated fallback (Pune software companies) */
  if (places.length === 0) {
    const localFallback = buildLocalFallback(city, keyword);
    if (localFallback.length > 0) {
      log("info", `Using local curated fallback: ${localFallback.length} companies for "${city}"`);
      places = localFallback;
      source = "local_fallback";
    } else {
      // Truly nothing available — throw structured error
      throw {
        success: false, source: "Google + OSM + Local",
        googleError,
        error: googleError?.status || "SEARCH_FAILED",
        reason: "No results from Google Places, Overpass, or local fallback.",
        suggestion: "Check your internet connection, or try a major city like Pune or Bangalore.",
      };
    }
  }

  /* 3 ── Enrich + sort */
  const companies = await enrichResults(places, city, keyword, source, userLat, userLon);
  log("info", `Enriched ${companies.length} companies, source=${source}`);
  setCache(cacheKey, companies);

  return {
    companies,
    source,
    googleWarning: googleError ? {
      message:    googleError.message,
      suggestion: buildGoogleErrorReason(googleError.status),
    } : null,
    total: companies.length,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────── */
function buildGoogleErrorReason(status) {
  const m = {
    INVALID_ARGUMENT:  "API key is invalid or malformed",
    REQUEST_DENIED:    "Billing disabled or Places API not enabled",
    PERMISSION_DENIED: "API key lacks Places API permission",
    OVER_QUERY_LIMIT:  "API quota exceeded",
    API_KEY_MISSING:   "GOOGLE_MAPS_API_KEY not set",
  };
  return m[status] || `Google error: ${status}`;
}
