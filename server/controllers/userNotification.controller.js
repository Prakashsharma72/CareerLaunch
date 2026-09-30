import {
  refreshUserNotifications,
  listUserNotifications,
  getUserUnreadCount as countUserNotifications,
  markUserNotificationRead,
  dismissUserNotification,
  markAllUserNotificationsRead,
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
} from "../services/userNotification.service.js";

export async function getUserNotifications(req, res) {
  try {
    await refreshUserNotifications(req.user.id);
    return res.json({ success: true, ...(await listUserNotifications({ userId: req.user.id, ...req.query })) });
  } catch (error) {
    console.error("[user-notifications] list failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load notifications." });
  }
}

export async function getUserUnreadCount(req, res) {
  try {
    await refreshUserNotifications(req.user.id);
    return res.json({ success: true, unreadCount: await countUserNotifications(req.user.id) });
  } catch (error) {
    console.error("[user-notifications] count failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load notification count." });
  }
}

export async function readUserNotification(req, res) {
  const changed = await markUserNotificationRead(req.user.id, Number(req.params.id));
  return res.status(changed ? 200 : 404).json({ success: changed });
}

export async function dismissUserNotificationController(req, res) {
  const changed = await dismissUserNotification(req.user.id, Number(req.params.id));
  return res.status(changed ? 200 : 404).json({ success: changed });
}

export async function readAllUserNotifications(req, res) {
  await markAllUserNotificationsRead(req.user.id);
  return res.json({ success: true });
}

export async function getUserPreferences(req, res) {
  return res.json({ success: true, preferences: await getUserNotificationPreferences(req.user.id) });
}

export async function updateUserPreferences(req, res) {
  return res.json({ success: true, preferences: await updateUserNotificationPreferences(req.user.id, req.body || {}) });
}
