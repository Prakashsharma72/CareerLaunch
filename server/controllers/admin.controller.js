/**
 * admin.controller.js
 * 
 * Admin dashboard statistics and activities
 */
import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Resource from "../models/resource.model.js";
import { Op } from "sequelize";

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
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "created_at"],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(`${TAG} Error fetching users:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
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
