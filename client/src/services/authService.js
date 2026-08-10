import api from "./api";

/**
 * POST /api/auth/register
 * Sends OTP to user's email — does NOT return a JWT.
 */
export const registerUser = (data) => api.post("/auth/register", data);

/**
 * POST /api/auth/verify-otp
 * Verifies the 6-digit OTP and returns { user, token } on success.
 */
export const verifyOtpApi = (data) => api.post("/auth/verify-otp", data);

/**
 * POST /api/auth/resend-otp
 * Generates a new OTP and resends it to the email.
 */
export const resendOtpApi = (data) => api.post("/auth/resend-otp", data);

/**
 * POST /api/auth/login
 */
export const loginUser = (data) => api.post("/auth/login", data);

/**
 * POST /api/auth/forgot-password
 */
export const forgotPasswordApi = (data) => api.post("/auth/forgot-password", data);

/**
 * POST /api/auth/reset-password
 */
export const resetPasswordApi = (data) => api.post("/auth/reset-password", data);

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
