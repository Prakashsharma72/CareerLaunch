import api from "./api";

export const getUserNotifications = (params = {}) => api.get("/notifications", { params });
export const getUserNotificationUnreadCount = () => api.get("/notifications/unread-count");
export const markUserNotificationRead = id => api.post(`/notifications/${id}/read`);
export const dismissUserNotification = id => api.post(`/notifications/${id}/dismiss`);
export const markAllUserNotificationsRead = () => api.post("/notifications/mark-all-read");
export const getUserNotificationPreferences = () => api.get("/notifications/preferences");
export const updateUserNotificationPreferences = values => api.put("/notifications/preferences", values);
