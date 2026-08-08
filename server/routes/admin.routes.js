/**
 * admin.routes.js
 * 
 * Admin-specific routes for dashboard stats and platform management
 */
import express from "express";
import { getDashboardStats, getRecentActivities } from "../controllers/admin.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Get dashboard statistics (total users, jobs, resources)
 */
router.get("/stats", getDashboardStats);

/**
 * GET /api/admin/activities
 * Get recent platform activities
 */
router.get("/activities", getRecentActivities);

export default router;
