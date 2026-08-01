import { getUserById, updateUserProfile, getUserStats } from "../services/user.service.js";

/**
 * GET /api/users/profile
 * Returns the full authenticated user profile from MySQL.
 */
export const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

/**
 * PUT /api/users/profile
 * Updates allowed profile fields for the authenticated user.
 */
export const updateProfile = async (req, res) => {
  try {
    const updated = await updateUserProfile(req.user.id, req.body);
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

/**
 * GET /api/users/stats
 * Returns dashboard stats (applied, saved, interviews, resume score…)
 */
export const getStats = async (req, res) => {
  try {
    const stats = await getUserStats(req.user.id);
    return res.status(200).json(stats);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};
