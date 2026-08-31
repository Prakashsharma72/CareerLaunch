/**
 * adminService.js
 * 
 * API calls for admin dashboard and management
 */
import api from "./api";

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

/**
 * Get recent platform activities
 */
export const getRecentActivities = async (limit = 10) => {
  const response = await api.get("/admin/activities", {
    params: { limit },
  });
  return response.data;
};

const adminService = {
  getDashboardStats,
  getRecentActivities,
};

export default adminService;
