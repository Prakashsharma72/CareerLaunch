import api from "./api";
import {
  CACHE_KEYS,
  fetchWithCache,
  getCacheKey,
  normalizeResourceList,
} from "../utils/cache";

const RESOURCE_CACHE = {
  freshnessMs: 10 * 60 * 1000,
  staleMs: 3 * 60 * 60 * 1000,
  maxBytes: 180000,
};

const runCachedRequest = async ({ key, request }) => {
  const result = await fetchWithCache({
    key,
    scope: CACHE_KEYS.resources,
    request,
    freshnessMs: RESOURCE_CACHE.freshnessMs,
    staleMs: RESOURCE_CACHE.staleMs,
    maxBytes: RESOURCE_CACHE.maxBytes,
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
 * Learning resources APIs
 */
export const getResources = async () => {
  const key = getCacheKey(CACHE_KEYS.resources, { endpoint: "/resources" });
  const response = await runCachedRequest({
    key,
    request: () => api.get("/resources"),
  });

  return {
    ...response,
    data: normalizeResourceList(response?.data ?? []),
  };
};

export const getAdminResources = async () => {
  const key = getCacheKey(CACHE_KEYS.resources, { endpoint: "/resources/admin" });
  const response = await runCachedRequest({
    key,
    request: () => api.get("/resources/admin"),
  });

  return {
    ...response,
    data: normalizeResourceList(response?.data ?? []),
  };
};

const toFormData = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === "file") return;
    if (value !== undefined && value !== null && value !== "") formData.append(key, value);
  });
  if (data.file) formData.append("file", data.file);
  return formData;
};

const notifyResourceChange = () => {
  localStorage.setItem("resources:last-change", String(Date.now()));
  window.dispatchEvent(new Event("resources:changed"));
};

export const addResource = async (data) => {
  const response = await api.post("/resources", toFormData(data));
  notifyResourceChange();
  return response;
};

export const updateResource = async (id, data) => {
  const response = await api.put(`/resources/${id}`, toFormData(data));
  notifyResourceChange();
  return response;
};

export const deleteResource = async (id) => {
  const response = await api.delete(`/resources/${id}`);
  notifyResourceChange();
  return response;
};