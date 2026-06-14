import api from "./api";

/**
 * Job APIs
 */
export const getAllJobs = () => {
  return api.get("/jobs");
};

export const getJobById = (id) => {
  return api.get(`/jobs/${id}`);
};

export const createJob = (data) => {
  return api.post("/jobs", data);
};

export const applyJob = (jobId) => {
  return api.post(`/jobs/apply/${jobId}`);
};

export const deleteJob = (id) => {
  return api.delete(`/jobs/${id}`);
};