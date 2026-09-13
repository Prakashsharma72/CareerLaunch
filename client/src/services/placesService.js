/**
 * placesService.js
 *
 * Client-side wrapper for the /api/places backend endpoints.
 *
 * getNearbyCompanies(lat, lon, radius, keyword)
 *   POST /api/places/nearby
 *
 * searchCompaniesByCity({ keyword, city, radius })
 *   GET  /api/places/search?keyword=...&city=...&radius=...
 *
 * getCompanyDetails(placeId)
 *   GET  /api/places/:placeId
 */
import api from "./api";
import {
  CACHE_KEYS,
  fetchWithCache,
  getCacheKey,
  normalizeCompanyList,
} from "../utils/cache";

const COMPANY_CACHE = {
  freshnessMs: 5 * 60 * 1000,
  staleMs: 2 * 60 * 60 * 1000,
  maxBytes: 180000,
};

const runCachedRequest = async ({ key, request }) => {
  const result = await fetchWithCache({
    key,
    scope: CACHE_KEYS.companies,
    request,
    freshnessMs: COMPANY_CACHE.freshnessMs,
    staleMs: COMPANY_CACHE.staleMs,
    maxBytes: COMPANY_CACHE.maxBytes,
  });

  if (result.data !== null && result.data !== undefined) {
    return {
      ...result,
      data: result.data,
    };
  }

  const response = await result.refreshPromise;
  return {
    data: response?.data ?? response,
    cacheHit: false,
    stale: false,
    refreshPromise: Promise.resolve(response),
  };
};

/**
 * GPS-based search — returns companies sorted nearest-first.
 * @param {number}  lat
 * @param {number}  lon
 * @param {number}  [radius=15]   km radius
 * @param {string}  [keyword]     default "software company"
 */
export const getNearbyCompanies = async (lat, lon, radius = 15, keyword = "software company", batchIndex = 0) => {
  const key = getCacheKey(CACHE_KEYS.companies, {
    endpoint: "places/nearby",
    lat,
    lon,
    radius,
    keyword,
    batchIndex,
  });

  const response = await runCachedRequest({
    key,
    request: () => api.post("/places/nearby", { lat, lon, radius, keyword, batchIndex }),
  });

  const payload = response?.data ?? { companies: [], total: 0, source: "no_location" };
  const normalized = {
    ...payload,
    companies: normalizeCompanyList(payload.companies || []),
  };

  return {
    ...response,
    data: normalized,
  };
};

/**
 * City text search — geocodes the city then searches Google Places.
 * @param {string}  keyword
 * @param {string}  city
 * @param {number}  [lat]   optional user coords (improves distance display)
 * @param {number}  [lon]
 */
export const searchCompaniesByCity = async ({ keyword = "software company", city, radius = 15, batchIndex = 0 }) => {
  const key = getCacheKey(CACHE_KEYS.companies, {
    endpoint: "places/search",
    keyword,
    city,
    radius,
    batchIndex,
  });

  const response = await runCachedRequest({
    key,
    request: () => api.get("/places/search", {
      params: {
        keyword,
        city,
        radius,
        batchIndex,
      },
    }),
  });

  const payload = response?.data ?? { companies: [], total: 0, source: "no_location" };
  const normalized = {
    ...payload,
    companies: normalizeCompanyList(payload.companies || []),
  };

  return {
    ...response,
    data: normalized,
  };
};

/**
 * Full company details including photos, reviews, opening hours.
 * @param {string} placeId  Google place_id
 */
export const getCompanyDetails = (placeId) =>
  api.get(`/places/${encodeURIComponent(placeId)}`);
