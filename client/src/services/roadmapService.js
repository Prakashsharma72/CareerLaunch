import api from "./api";
import {
  CACHE_KEYS,
  fetchWithCache,
  getCacheKey,
  normalizeRoadmapList,
} from "../utils/cache";

const ROADMAP_CACHE = {
  freshnessMs: 10 * 60 * 1000,
  staleMs: 3 * 60 * 60 * 1000,
  maxBytes: 180000,
};

const runCachedRequest = async ({ key, request }) => {
  const result = await fetchWithCache({
    key,
    scope: CACHE_KEYS.roadmaps,
    request,
    freshnessMs: ROADMAP_CACHE.freshnessMs,
    staleMs: ROADMAP_CACHE.staleMs,
    maxBytes: ROADMAP_CACHE.maxBytes,
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

export const getRoadmaps = async (params = {}) => {
  const { limit, page, ...rest } = params || {};
  const key = getCacheKey(CACHE_KEYS.roadmaps, {
    endpoint: "/roadmaps",
    limit,
    page,
    ...rest,
  });

  const response = await runCachedRequest({
    key,
    request: () => api.get("/roadmaps", { params }),
  });

  const payload = response?.data ?? { data: [], pagination: { total: 0, pages: 1 } };

  return {
    ...response,
    data: {
      ...payload,
      data: normalizeRoadmapList(payload.data || []),
    },
  };
};

export const getRoadmap = async (id, preview = false) => {
  const response = await api.get(`${preview ? "/roadmaps/admin" : "/roadmaps"}/${id}`);
  return response.data;
};

export const updateRoadmapProgress = async (roadmapId, stepId, completed) => {
  const response = await api.patch(`/roadmaps/${roadmapId}/progress/${stepId}`, { completed });
  return response.data;
};

export const createRoadmap = async ({ title, targetRole, roadmapContent }) => {
  const response = await api.post("/roadmaps", {
    title,
    targetRole,
    roadmapContent,
  });
  return response.data;
};

const roadmapService = {
  getRoadmaps,
  getRoadmap,
  updateRoadmapProgress,
  createRoadmap,
};

export default roadmapService;
