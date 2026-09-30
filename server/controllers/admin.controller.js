/**
 * admin.controller.js
 * 
 * Admin dashboard statistics and activities
 */
import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Resource from "../models/resource.model.js";
import { Op } from "sequelize";
import { ROLES } from "../constants/roles.js";
import { recordUserActivity } from "../services/notification.service.js";

const TAG = "[admin]";
const log = (msg, data) =>
  console.log(
    `${new Date().toISOString()} ${TAG} ${msg}`,
    data !== undefined ? JSON.stringify(data) : ""
  );

/**
 * GET /api/admin/stats
 * Returns total counts for users, jobs, and resources
 */
export const getDashboardStats = async (req, res) => {
  try {
    log("Fetching dashboard stats");

    // Get counts in parallel
    const [totalUsers, totalJobs, totalResources] = await Promise.all([
      User.count(),
      Job.count({ where: { status: "active" } }),
      Resource.count(),
    ]);

    // Get growth data (comparing last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [
      recentUsers,
      previousUsers,
      recentJobs,
      previousJobs,
    ] = await Promise.all([
      User.count({ where: { created_at: { [Op.gte]: thirtyDaysAgo } } }),
      User.count({ 
        where: { 
          created_at: { 
            [Op.gte]: sixtyDaysAgo,
            [Op.lt]: thirtyDaysAgo 
          } 
        } 
      }),
      Job.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      Job.count({ 
        where: { 
          createdAt: { 
            [Op.gte]: sixtyDaysAgo,
            [Op.lt]: thirtyDaysAgo 
          } 
        } 
      }),
    ]);

    // Calculate growth percentages
    const calculateGrowth = (recent, previous) => {
      if (previous === 0) return recent > 0 ? 100 : 0;
      return Math.round(((recent - previous) / previous) * 100);
    };

    const usersGrowth = calculateGrowth(recentUsers, previousUsers);
    const jobsGrowth = calculateGrowth(recentJobs, previousJobs);

    const stats = {
      totalUsers,
      totalJobs,
      totalResources,
      growth: {
        users: {
          percentage: usersGrowth,
          recent: recentUsers,
          previous: previousUsers,
        },
        jobs: {
          percentage: jobsGrowth,
          recent: recentJobs,
          previous: previousJobs,
        },
      },
    };

    log("Stats fetched successfully", stats);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(`${TAG} Error fetching dashboard stats:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/activities
 * Returns recent platform activities (user registrations, job posts, resources)
 */
export const getAdminUsers = async (req, res) => {
  try {
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 20;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const role = typeof req.query.role === "string" ? req.query.role.trim() : "";

    if (role && !Object.values(ROLES).includes(role)) {
      return res.status(400).json({ message: "Invalid user role filter." });
    }

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;

    const total = await User.count({ where });
    const totalPages = Math.ceil(total / limit);
    const page = Math.min(
      Number.isInteger(requestedPage) ? Math.max(requestedPage, 1) : 1,
      Math.max(totalPages, 1),
    );
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "createdAt"],
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    return res.status(200).json({
      users,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error(`${TAG} Error fetching users:`, error);
    return res.status(500).json({ message: "Unable to load users right now." });
  }
};

export const updateAdminUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body || {};
  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({ message: "Invalid user role." });
  }
  if (String(req.user.id) === String(id) && role !== ROLES.ADMIN) {
    return res.status(400).json({ message: "You cannot remove your own admin access." });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found." });
    await user.update({ role });
    recordUserActivity(user, {
      type: "admin_activity",
      title: "User role changed",
      message: `An administrator changed ${user.name || user.email}'s role to ${role}.`,
      metadata: { action: "user_role_changed", changedByAdminId: req.user.id, role },
    }).catch(error => console.error(`${TAG} role activity notification failed:`, error.message));
    return res.status(200).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt } });
  } catch (error) {
    console.error(`${TAG} Error updating user role:`, error);
    return res.status(500).json({ message: "Unable to update the user role right now." });
  }
};

export const deleteAdminUser = async (req, res) => {
  const { id } = req.params;
  if (String(req.user.id) === String(id)) {
    return res.status(400).json({ message: "You cannot delete your own admin account." });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found." });
    await user.destroy();
    recordUserActivity(user, {
      type: "admin_activity",
      title: "User deleted",
      message: `An administrator deleted ${user.name || user.email}'s account.`,
      metadata: { action: "user_deleted", changedByAdminId: req.user.id },
    }).catch(error => console.error(`${TAG} deletion activity notification failed:`, error.message));
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(`${TAG} Error deleting user:`, error);
    return res.status(500).json({ message: "Unable to delete this user right now." });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    log("Fetching recent activities");

    const limit = parseInt(req.query.limit) || 10;

    // Fetch recent activities from different sources
    const [recentUsers, recentJobs, recentResources] = await Promise.all([
      User.findAll({
        attributes: ["id", "name", "email", "created_at"],
        order: [["created_at", "DESC"]],
        limit: 4,
      }),
      Job.findAll({
        attributes: ["id", "title", "company", "createdAt"],
        order: [["createdAt", "DESC"]],
        limit: 4,
      }),
      Resource.findAll({
        attributes: ["id", "title", "category", "created_at"],
        order: [["created_at", "DESC"]],
        limit: 3,
      }),
    ]);

    // Combine and format activities
    const activities = [];

    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        activity: `New user registered: ${user.name}`,
        time: formatTimeAgo(user.created_at),
        type: "user",
        timestamp: user.created_at,
      });
    });

    recentJobs.forEach(job => {
      activities.push({
        id: `job-${job.id}`,
        activity: `New job posted: ${job.title} at ${job.company}`,
        time: formatTimeAgo(job.createdAt),
        type: "job",
        timestamp: job.createdAt,
      });
    });

    recentResources.forEach(resource => {
      activities.push({
        id: `resource-${resource.id}`,
        activity: `New resource added: ${resource.title}${resource.category ? ` (${resource.category})` : ""}`,
        time: formatTimeAgo(resource.created_at),
        type: "resource",
        timestamp: resource.created_at,
      });
    });

    // Sort by timestamp (most recent first) and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, limit).map(({ timestamp, ...rest }) => rest);

    log(`Fetched ${limitedActivities.length} activities`);

    return res.status(200).json({
      success: true,
      data: limitedActivities,
    });
  } catch (error) {
    console.error(`${TAG} Error fetching activities:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent activities",
      error: error.message,
    });
  }
};

/**
 * Helper function to format timestamp as "X time ago"
 */
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
}
