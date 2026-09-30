import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  getUserNotifications,
  getUserUnreadCount,
  readUserNotification,
  dismissUserNotificationController,
  readAllUserNotifications,
  getUserPreferences,
  updateUserPreferences,
} from "../controllers/userNotification.controller.js";

const router = express.Router();
router.use(verifyToken);
router.get("/unread-count", getUserUnreadCount);
router.get("/preferences", getUserPreferences);
router.put("/preferences", updateUserPreferences);
router.get("/", getUserNotifications);
router.post("/mark-all-read", readAllUserNotifications);
router.post("/:id/read", readUserNotification);
router.post("/:id/dismiss", dismissUserNotificationController);

export default router;
