import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notification.service.js";
import AdminNotification from "../models/adminNotification.model.js";

export async function getNotifications(req, res) {
  try {
    const [data, unreadCount] = await Promise.all([
      listNotifications({ adminId: req.user.id, ...req.query }),
      getUnreadCount(req.user.id),
    ]);
    return res.json({
      success: true,
      notifications: data.notifications,
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      },
      unreadCount,
    });
  } catch (error) {
    console.error("[notifications] list failed:", error.message);
    return res.status(error.status || 500).json({ success: false, message: error.status === 400 ? error.message : "Unable to load notifications." });
  }
}

export async function getNotificationUnreadCount(req, res) {
  try {
    return res.json({ success: true, unreadCount: await getUnreadCount(req.user.id) });
  } catch (error) {
    console.error("[notifications] unread count failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load notification count." });
  }
}

export async function readNotification(req, res) {
  try {
    const notificationId = Number(req.params.id);
    if (!Number.isSafeInteger(notificationId) || notificationId < 1) {
      return res.status(400).json({ success: false, message: "Invalid notification ID." });
    }
    const notification = await AdminNotification.findByPk(notificationId, { attributes: ["id"] });
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found." });
    const isRead = req.method === "POST" ? true : req.body?.isRead;
    if (typeof isRead !== "boolean") {
      return res.status(400).json({ success: false, message: "isRead must be a boolean." });
    }
    await markNotificationRead(notificationId, req.user.id, isRead);
    return res.json({ success: true, isRead, unreadCount: await getUnreadCount(req.user.id) });
  } catch (error) {
    console.error("[notifications] mark read failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to mark notification as read." });
  }
}

export async function readAllNotifications(req, res) {
  try {
    await markAllNotificationsRead(req.user.id);
    return res.json({ success: true, unreadCount: await getUnreadCount(req.user.id) });
  } catch (error) {
    console.error("[notifications] mark all read failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to mark notifications as read." });
  }
}
