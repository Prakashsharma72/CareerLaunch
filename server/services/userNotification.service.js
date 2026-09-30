import { Op } from "sequelize";
import db from "../config/db.js";
import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import SavedJob from "../models/savedJob.model.js";
import SavedCompany from "../models/savedCompany.model.js";
import Resource from "../models/resource.model.js";
import Roadmap from "../models/roadmap.model.js";
import RoadmapProgress from "../models/roadmapProgress.model.js";
import InterviewSession from "../models/interviewSession.model.js";
import UserNotification from "../models/userNotification.model.js";
import UserNotificationPreference from "../models/userNotificationPreference.model.js";
import UserNotificationCursor from "../models/userNotificationCursor.model.js";

const SCAN_INTERVAL_MS = Number(process.env.USER_NOTIFICATION_SCAN_INTERVAL_MS || 5 * 60 * 1000);
const PROFILE_EVENT = "profile:incomplete:v1";
const OPTIONAL_TYPES = new Set(["job_match", "saved_company_job", "saved_job_deadline", "resource_update", "roadmap_update", "roadmap_milestone"]);

const normalize = value => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const terms = value => normalize(value).split(" ").filter(term => term.length > 2);
const dateValue = value => value ? new Date(value) : null;

function profileIncomplete(user) {
  return !user.resumeUrl || !user.education || !user.skills || !user.location;
}

function preferenceEnabled(preferences, type) {
  if (type === "job_match" || type === "saved_company_job" || type === "saved_job_deadline") return preferences.jobAlerts;
  if (type === "resource_update") return preferences.resourceUpdates;
  if (type === "roadmap_update" || type === "roadmap_milestone") return preferences.learningReminders;
  return true;
}

function jobMatchesUser(job, user) {
  const userTerms = [...terms(user.skills), ...terms(user.role), ...terms(user.location)];
  const haystack = normalize([job.title, job.company, job.skillsRequired, job.description, job.location, job.experienceLevel].join(" "));
  const skillMatch = userTerms.length === 0 || userTerms.some(term => haystack.includes(term));
  const locationMatch = !user.location || !job.location || normalize(job.location).includes(normalize(user.location));
  const experienceMatch = !user.experience || !job.experienceLevel || normalize(job.experience).includes(normalize(job.experienceLevel)) || normalize(job.experienceLevel).includes(normalize(user.experience));
  return skillMatch && (locationMatch || experienceMatch);
}

async function createNotification({ userId, eventKey, type, title, description, link, metadata, preferences }) {
  if (!preferenceEnabled(preferences, type)) return false;
  try {
    await UserNotification.create({ userId, eventKey, type, title, description, link, metadata });
    return true;
  } catch (error) {
    if (/duplicate|unique/i.test(error?.message || "")) return false;
    throw error;
  }
}

async function ensurePreferences(userId) {
  const [preferences] = await UserNotificationPreference.findOrCreate({ where: { userId }, defaults: { userId } });
  return preferences;
}

async function scanUser(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.role === "admin") return;
  const preferences = await ensurePreferences(userId);
  const now = new Date();
  const [cursor, cursorCreated] = await UserNotificationCursor.findOrCreate({
    where: { userId },
    defaults: { userId, initializedAt: now, lastScannedAt: now },
  });
  if (cursorCreated) {
    if (profileIncomplete(user)) await createNotification({ userId, eventKey: PROFILE_EVENT, type: "profile_reminder", title: "Complete your career profile", description: "Add your skills, education, location, and resume to improve recommendations.", link: "/student/profile", metadata: { missingProfile: true }, preferences });
    return;
  }

  const since = dateValue(cursor.lastScannedAt) || dateValue(cursor.initializedAt) || now;
  const jobs = await Job.findAll({ where: { createdAt: { [Op.gt]: since }, status: { [Op.in]: ["active", "published"] } }, order: [["createdAt", "ASC"]], limit: 250 });
  const matchingJobs = jobs.filter(job => jobMatchesUser(job, user));
  if (matchingJobs.length) {
    const newest = matchingJobs[matchingJobs.length - 1];
    await createNotification({ userId, eventKey: `job-match:${newest.id}:${newest.createdAt?.getTime() || now.getTime()}`, type: "job_match", title: `${matchingJobs.length} new job${matchingJobs.length === 1 ? "" : "s"} match your preferences`, description: matchingJobs.length === 1 ? newest.title : "New opportunities match your skills, role, location, or experience.", link: "/student/jobs", metadata: { jobIds: matchingJobs.map(job => job.id) }, preferences });
  }

  const savedCompanies = await SavedCompany.findAll({ where: { userId } });
  const companyIds = new Set(savedCompanies.map(company => company.externalCompanyId).filter(Boolean));
  const savedCompanyJobs = jobs.filter(job => job.googlePlaceId && companyIds.has(job.googlePlaceId));
  for (const job of savedCompanyJobs) await createNotification({ userId, eventKey: `saved-company-job:${job.id}:${job.createdAt?.getTime() || now.getTime()}`, type: "saved_company_job", title: "New job from a saved company", description: `${job.title} is available at a company you follow.`, link: `/student/jobs/${job.externalJobId || job.id}`, metadata: { jobId: job.id, googlePlaceId: job.googlePlaceId }, preferences });

  const savedJobs = await SavedJob.findAll({ where: { userId, externalJobId: { [Op.ne]: null } } });
  const savedExternalIds = savedJobs.map(savedJob => savedJob.externalJobId).filter(Boolean);
  if (savedExternalIds.length) {
    const deadlineJobs = await Job.findAll({ where: { externalJobId: { [Op.in]: savedExternalIds }, status: { [Op.in]: ["active", "published"] }, expiresAt: { [Op.gte]: now, [Op.lte]: new Date(now.getTime() + 24 * 60 * 60 * 1000) } } });
    for (const job of deadlineJobs) await createNotification({ userId, eventKey: `saved-job-deadline:${job.externalJobId}:${job.expiresAt}`, type: "saved_job_deadline", title: "Saved job deadline is approaching", description: `${job.title} closes soon.`, link: `/student/jobs/${job.externalJobId}`, metadata: { externalJobId: job.externalJobId, expiresAt: job.expiresAt }, preferences });
  }

  const resources = await Resource.findAll({ where: { status: "published", [Op.or]: [{ createdAt: { [Op.gt]: since } }, { updatedAt: { [Op.gt]: since } }] }, order: [["createdAt", "ASC"]], limit: 100 });
  const interestTerms = [...terms(user.skills), ...terms(user.role)];
  for (const resource of resources) {
    const relevant = !interestTerms.length || interestTerms.some(term => normalize([resource.title, resource.description, resource.category].join(" ")).includes(term));
    if (relevant) await createNotification({ userId, eventKey: `resource:${resource.id}:${resource.updatedAt?.getTime() || resource.createdAt?.getTime() || now.getTime()}`, type: "resource_update", title: "New learning resource for you", description: resource.title, link: "/student/resources", metadata: { resourceId: resource.id }, preferences });
  }

  const roadmaps = await Roadmap.findAll({ where: { userId, updatedAt: { [Op.gt]: since } }, limit: 100 });
  for (const roadmap of roadmaps) await createNotification({ userId, eventKey: `roadmap-update:${roadmap.id}:${roadmap.updatedAt?.getTime() || now.getTime()}`, type: "roadmap_update", title: "Your roadmap was updated", description: roadmap.title || "A roadmap you follow has meaningful updates.", link: `/student/roadmaps/${roadmap.id}`, metadata: { roadmapId: roadmap.id }, preferences });
  const milestones = await RoadmapProgress.findAll({ where: { userId, completedAt: { [Op.gt]: since } }, limit: 100 });
  for (const milestone of milestones) await createNotification({ userId, eventKey: `roadmap-milestone:${milestone.roadmapId}:${milestone.stepId}:${milestone.completedAt?.getTime() || now.getTime()}`, type: "roadmap_milestone", title: "Roadmap milestone completed", description: "You completed a tracked roadmap step.", link: `/student/roadmaps/${milestone.roadmapId}`, metadata: { roadmapId: milestone.roadmapId, stepId: milestone.stepId }, preferences });

  const interviews = await InterviewSession.findAll({ where: { userId, status: "completed", report: { [Op.ne]: null }, createdAt: { [Op.gt]: since } }, limit: 100 });
  for (const interview of interviews) await createNotification({ userId, eventKey: `interview-result:${interview.id}:${interview.createdAt?.getTime() || now.getTime()}`, type: "interview_result", title: "Your mock interview results are ready", description: `Feedback for your ${interview.role} interview is available.`, link: "/student/mock-interview", metadata: { sessionId: interview.id }, preferences });

  await cursor.update({ lastScannedAt: now });
}

export async function refreshUserNotifications(userId) {
  try { await scanUser(userId); } catch (error) { console.error("[user-notifications] scan failed:", error.message); }
}

export async function refreshAllUserNotifications() {
  const users = await User.findAll({ attributes: ["id"], where: { role: "student" } });
  await Promise.allSettled(users.map(user => refreshUserNotifications(user.id)));
}

export async function listUserNotifications({ userId, page = 1, limit = 20, type, unread }) {
  const where = { userId, dismissedAt: null };
  if (type && type !== "all") where.type = type;
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const safePage = Math.max(1, Number(page) || 1);
  const rows = unread === "true"
    ? { rows: await UserNotification.findAll({ where, order: [["createdAt", "DESC"]] }) }
    : await UserNotification.findAndCountAll({ where, order: [["createdAt", "DESC"]], limit: safeLimit, offset: (safePage - 1) * safeLimit });
  const filtered = unread === "true" ? rows.rows.filter(row => !row.readAt) : rows.rows;
  const total = unread === "true" ? filtered.length : rows.count;
  const notifications = unread === "true" ? filtered.slice((safePage - 1) * safeLimit, safePage * safeLimit) : filtered;
  return { notifications: notifications.map(row => ({ ...row.toJSON(), isRead: Boolean(row.readAt) })), total, page: safePage, limit: safeLimit, totalPages: Math.max(1, Math.ceil(total / safeLimit)) };
}

export async function getUserUnreadCount(userId) {
  return UserNotification.count({ where: { userId, readAt: null, dismissedAt: null } });
}

export async function markUserNotificationRead(userId, notificationId) {
  const [updated] = await UserNotification.update({ readAt: new Date() }, { where: { id: notificationId, userId, dismissedAt: null } });
  return updated > 0;
}

export async function dismissUserNotification(userId, notificationId) {
  const [updated] = await UserNotification.update({ dismissedAt: new Date(), readAt: new Date() }, { where: { id: notificationId, userId } });
  return updated > 0;
}

export async function markAllUserNotificationsRead(userId) {
  await UserNotification.update({ readAt: new Date() }, { where: { userId, dismissedAt: null, readAt: null } });
}

export async function getUserNotificationPreferences(userId) {
  return ensurePreferences(userId);
}

export async function updateUserNotificationPreferences(userId, values) {
  const preferences = await ensurePreferences(userId);
  const allowed = ["jobAlerts", "resourceUpdates", "learningReminders", "announcements"];
  await preferences.update(Object.fromEntries(allowed.filter(key => values[key] !== undefined).map(key => [key, values[key] === true || values[key] === "true"])));
  return preferences;
}

export function startUserNotificationScheduler() {
  const timer = setInterval(() => refreshAllUserNotifications().catch(error => console.error("[user-notifications] scheduler failed:", error.message)), SCAN_INTERVAL_MS);
  timer.unref?.();
  return timer;
}

export { OPTIONAL_TYPES, SCAN_INTERVAL_MS };
