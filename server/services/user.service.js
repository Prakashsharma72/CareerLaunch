import User from "../models/user.model.js";

/** Fields that are safe to return to the client (never include password). */
const SAFE_ATTRS = {
  exclude: ["password"],
};

/**
 * Fetch a user's full profile by primary key.
 * Throws a 404-like error if not found.
 */
export async function getUserById(id) {
  const user = await User.findByPk(id, { attributes: SAFE_ATTRS });
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user;
}

/**
 * Update allowed profile fields for a user.
 * Returns the updated user (without password).
 */
export async function updateUserProfile(id, body) {
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  // Whitelist of updatable fields — never let clients change id, email (via profile), or password here
  const ALLOWED = [
    "name", "phone", "location", "bio", "profileImage",
    "dob", "gender", "college", "degree", "branch", "gradYear",
    "education", "skills", "experience", "languages",
    "resumeUrl", "github", "linkedin", "portfolio",
  ];

  const updates = {};
  for (const key of ALLOWED) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      updates[key] = body[key];
    }
  }

  await user.update(updates);

  return await User.findByPk(id, { attributes: SAFE_ATTRS });
}

/**
 * Get dashboard stats for a user:
 * - saved jobs count
 * - saved companies count
 * - interview sessions count
 * - roadmaps count
 */
export async function getUserStats(userId) {
  const { default: db } = await import("../config/db.js");

  const [[stats]] = await db.query(
    `SELECT
       (SELECT COUNT(*) FROM saved_jobs      WHERE user_id = :uid) AS saved_jobs,
       (SELECT COUNT(*) FROM saved_companies WHERE user_id = :uid) AS saved_companies,
       (SELECT COUNT(*) FROM interview_sessions WHERE user_id = :uid) AS interviews,
       (SELECT COUNT(*) FROM roadmaps        WHERE user_id = :uid) AS roadmaps`,
    { replacements: { uid: userId } }
  );

  return {
    savedJobs:        Number(stats.saved_jobs      || 0),
    savedCompanies:   Number(stats.saved_companies || 0),
    interviews:       Number(stats.interviews      || 0),
    roadmaps:         Number(stats.roadmaps        || 0),
  };
}
