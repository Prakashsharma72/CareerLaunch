import api from "./api";

/**
 * GET /api/jobs  — live jobs from external APIs
 * params: { search, location, jobType, lat, lon, radius, includeRemote, page, limit }
 */
export const getAllJobs = (params = {}) => api.get("/jobs", { params });

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
