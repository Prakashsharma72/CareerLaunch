import api from "./api";

/**
 * GET /api/jobs  — paginated, filterable
 * params: { search, location, jobType, page, limit }
 */
export const getAllJobs = (params = {}) => api.get("/jobs", { params });

/**
 * GET /api/jobs/:id
 */
export const getJobById = (id) => api.get(`/jobs/${id}`);

/**
 * POST /api/jobs  (admin)
 */
export const createJob = (data) => api.post("/jobs", data);

/**
 * PUT /api/jobs/:id  (admin)
 */
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data);

/**
 * DELETE /api/jobs/:id  (admin)
 */
export const deleteJob = (id) => api.delete(`/jobs/${id}`);

/**
 * POST /api/jobs/apply/:id
 */
export const applyJob = (jobId) => api.post(`/jobs/apply/${jobId}`);

/**
 * POST /api/jobs/save  — { jobId }
 */
export const saveJob = (jobId) => api.post("/jobs/save", { jobId });

/**
 * DELETE /api/jobs/save/:savedId
 */
export const removeSavedJob = (savedId) => api.delete(`/jobs/save/${savedId}`);

/**
 * GET /api/jobs/saved/list
 */
export const getSavedJobs = () => api.get("/jobs/saved/list");

/**
 * POST /api/jobs/import  (admin)  — { jobs: [...] }
 */
export const importJobs = (jobs) => api.post("/jobs/import", { jobs });
