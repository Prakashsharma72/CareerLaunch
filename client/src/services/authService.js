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
 * Dashboard stats: savedJobs, savedCompanies, interviews, roadmaps
 */
export const fetchStats = () => api.get("/users/stats");

/**
 * POST /api/upload/resume
 * Uploads a PDF to Cloudinary and saves the URL to users.resume_url
 * @param {File} file - PDF file object
 * @param {function} onProgress - optional (percent: number) => void
 */
export const uploadResumeFile = (file, onProgress) => {
  const fd = new FormData();
  fd.append("resume", file);
  return api.post("/upload/resume", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
      : undefined,
  });
};

/**
 * POST /api/upload/avatar
 * Uploads an image to Cloudinary and saves the URL to users.profile_image
 * @param {File} file - image file object
 * @param {function} onProgress - optional (percent: number) => void
 */
export const uploadAvatarFile = (file, onProgress) => {
  const fd = new FormData();
  fd.append("avatar", file);
  return api.post("/upload/avatar", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
      : undefined,
  });
};
