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

export const getAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users", { params });
  return response.data;
};

export const updateAdminUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};

export const deleteAdminUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
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

export const getNotifications = async (params = {}) => {
  const normalizedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "" && value !== "all"),
  );
  const response = await api.get("/admin/notifications", { params: normalizedParams });
  return response.data;
};

export const getNotificationUnreadCount = async () => {
  const response = await api.get("/admin/notifications/unread-count");
  return response.data;
};

export const markNotificationRead = async (id, isRead = true) => {
  const response = await api.patch(`/admin/notifications/${id}/read`, { isRead });
  window.dispatchEvent(new CustomEvent("admin-notifications-updated"));
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.patch("/admin/notifications/read-all");
  window.dispatchEvent(new CustomEvent("admin-notifications-updated"));
  return response.data;
};

const adminService = {
  getDashboardStats,
  getAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
  getRecentActivities,
  getNotifications,
  getNotificationUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
};

export default adminService;
