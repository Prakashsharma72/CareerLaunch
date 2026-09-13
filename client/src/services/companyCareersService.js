/**
 * companyCareersService.js
 *
 * GET /api/company-careers — software companies with optional career enrichment
 */
import api from "./api";
import {
  CACHE_KEYS,
  fetchWithCache,
  getCacheKey,
  normalizeCompanyList,
} from "../utils/cache";

const COMPANY_CAREERS_CACHE = {
  freshnessMs: 5 * 60 * 1000,
  staleMs: 2 * 60 * 60 * 1000,
  maxBytes: 180000,
};

const runCachedRequest = async ({ key, request }) => {
  const result = await fetchWithCache({
    key,
    scope: CACHE_KEYS.companies,
    request,
    freshnessMs: COMPANY_CAREERS_CACHE.freshnessMs,
    staleMs: COMPANY_CAREERS_CACHE.staleMs,
    maxBytes: COMPANY_CAREERS_CACHE.maxBytes,
  });

  if (result.data !== null && result.data !== undefined) {
    return result;
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
 * @param {object} params
 * @param {number} [params.lat]
 * @param {number} [params.lon]
 * @param {number} [params.radius=15]
 * @param {string} [params.keyword="software company"]
 * @param {string} [params.city]
 * @param {string} [params.pageToken]
 */
export const getCompanyCareers = async ({ lat, lon, radius = 15, keyword = "software company", city, pageToken, page = 1, limit = 12 }) => {
  const key = getCacheKey(CACHE_KEYS.companies, {
    endpoint: "company-careers",
    lat,
    lon,
    radius,
    keyword,
    city: city?.trim() || null,
    pageToken: pageToken || null,
    page,
    limit,
  });

  const response = await runCachedRequest({
    key,
    request: () => api.get("/company-careers", {
      params: {
        ...(lat != null && { lat }),
        ...(lon != null && { lon }),
        radius,
        keyword,
        ...(city?.trim() && { city: city.trim() }),
        ...(pageToken && { pageToken }),
        page,
        limit,
      },
      timeout: 20000,
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
