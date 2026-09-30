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
  readBrowserCache,
  writeBrowserCache,
} from "../utils/cache";

const COMPANY_CAREERS_CACHE = {
  freshnessMs: 5 * 60 * 1000,
  staleMs: 2 * 60 * 60 * 1000,
  maxBytes: 180000,
};
const LAST_KNOWN_COMPANIES_KEY = getCacheKey(CACHE_KEYS.companies, {
  endpoint: "company-careers:last-known",
});

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
  const hasLocation = Boolean(city?.trim()) || (lat != null && lon != null);
  const lastKnown = hasLocation
    ? null
    : readBrowserCache(LAST_KNOWN_COMPANIES_KEY, CACHE_KEYS.companies);
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

  try {
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
    const companies = normalizeCompanyList(payload.companies || []);

    if (hasLocation) {
      const verifiedCompanies = companies.filter(company => company.careerVerified);
      if (verifiedCompanies.length) {
        writeBrowserCache(
          LAST_KNOWN_COMPANIES_KEY,
          { companies: verifiedCompanies },
          CACHE_KEYS.companies,
          COMPANY_CAREERS_CACHE,
        );
      }
    }

    const cachedCompanies = normalizeCompanyList(lastKnown?.data?.companies || []);
    const combinedCompanies = new Map();
    [...cachedCompanies, ...companies].forEach(company => {
      const id = company.placeId || company.careerUrl || company.companyName;
      if (id && company.careerVerified) combinedCompanies.set(id, company);
    });
    const resolvedCompanies = hasLocation ? companies : [...combinedCompanies.values()];
    const source = !hasLocation && !companies.length && resolvedCompanies.length
      ? "browser_cache"
      : payload.source;

    return {
      ...response,
      data: {
        ...payload,
        companies: resolvedCompanies,
        total: Math.max(Number(payload.total) || 0, resolvedCompanies.length),
        verifiedCareerCount: resolvedCompanies.filter(company => company.careerVerified).length,
        source,
      },
    };
  } catch (error) {
    const cachedCompanies = normalizeCompanyList(lastKnown?.data?.companies || []);
    if (hasLocation || !cachedCompanies.length) throw error;

    return {
      cacheHit: true,
      stale: true,
      data: {
        companies: cachedCompanies.filter(company => company.careerVerified),
        total: cachedCompanies.length,
        verifiedCareerCount: cachedCompanies.length,
        nextPageToken: null,
        source: "browser_cache",
        recordType: "company",
        location: null,
        freshness: lastKnown.updatedAt ? new Date(lastKnown.updatedAt).toISOString() : null,
      },
    };
  }
};
