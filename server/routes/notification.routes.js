import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  getNotificationUnreadCount,
  readNotification,
  readAllNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();
router.use(authenticateToken, requireAdmin);
router.get("/unread-count", getNotificationUnreadCount);
router.get("/", getNotifications);
router.patch("/read-all", readAllNotifications);
router.post("/mark-all-read", readAllNotifications);
router.patch("/:id/read", readNotification);
router.post("/:id/read", readNotification);

export default router;
