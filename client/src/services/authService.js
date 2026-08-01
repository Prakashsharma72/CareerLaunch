import api from "./api";

/**
 * POST /api/auth/register
 */
export const registerUser = (data) => api.post("/auth/register", data);

/**
 * POST /api/auth/login
 */
export const loginUser = (data) => api.post("/auth/login", data);

/**
 * GET /api/users/profile
 * Always fetches fresh profile from MySQL — call this on app start
 * and whenever the user object needs to be trusted.
 */
export const fetchProfile = () => api.get("/users/profile");

/**
 * PUT /api/users/profile
 */
export const updateProfile = (data) => api.put("/users/profile", data);

/**
 * GET /api/users/stats
 * Dashboard stats: appliedJobs, savedJobs, interviews, resumeScore …
 */
export const fetchStats = () => api.get("/users/stats");
