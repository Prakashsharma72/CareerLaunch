import api from "./api";
import {
  CACHE_KEYS,
  fetchWithCache,
  getCacheKey,
} from "../utils/cache";

const JOB_CACHE = {
  freshnessMs: 5 * 60 * 1000,
  staleMs: 2 * 60 * 60 * 1000,
  maxBytes: 180000,
};

const runCachedRequest = async ({ key, request }) => {
  const result = await fetchWithCache({
    key,
    scope: CACHE_KEYS.jobs,
    request,
    freshnessMs: JOB_CACHE.freshnessMs,
    staleMs: JOB_CACHE.staleMs,
    maxBytes: JOB_CACHE.maxBytes,
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
 * GET /api/jobs  — live jobs from external APIs
 * params: { search, location, jobType, lat, lon, radius, includeRemote, page, limit }
 */
export const getAllJobs = async (params = {}) => {
  const key = getCacheKey(CACHE_KEYS.jobs, {
    endpoint: "/jobs",
    params,
  });

  return runCachedRequest({
    key,
    request: () => api.get("/jobs", { params }),
  });
};

/**
 * GET /api/jobs/:id  — single live job by externalJobId
 */
export const getJobById = (id) => api.get(`/jobs/${id}`);

/**
 * POST /api/jobs/save  — bookmark a job (stores full payload in MySQL)
 * Pass the complete job object — the backend stores it inline, no FK.
 */
export const saveJobBookmark = (jobPayload) =>
  api.post("/jobs/save", jobPayload);

/**
 * DELETE /api/jobs/save/:savedId  — remove a bookmark by saved_jobs.id
 */
export const removeSavedJob = (savedId) =>
  api.delete(`/jobs/save/${savedId}`);

/**
 * GET /api/jobs/saved/list  — get the logged-in user's saved bookmarks
 */
export const getSavedJobs = () => api.get("/jobs/saved/list");

/* Legacy alias — some components may still call this */
export const saveJob = saveJobBookmark;
