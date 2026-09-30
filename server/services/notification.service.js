import { Op } from "sequelize";
import db from "../config/db.js";
import ProviderIncident from "../models/providerIncident.model.js";
import ProviderIncidentState from "../models/providerIncidentState.model.js";
import AdminNotification from "../models/adminNotification.model.js";
import AdminNotificationRead from "../models/adminNotificationRead.model.js";
import NotificationOutbox from "../models/notificationOutbox.model.js";
import User from "../models/user.model.js";
import { sendAdminProviderFailureEmail } from "./email.service.js";

const ENVIRONMENT = process.env.NODE_ENV || "development";
const RECOVERY_THRESHOLD = Math.max(1, Number(process.env.PROVIDER_RECOVERY_THRESHOLD || 2));
const EMAIL_TYPE = "provider_failure";
let persistenceTail = Promise.resolve();

function providerGroup(integration = "company_search") {
  return {
    groupKey: `${ENVIRONMENT}:google:places_${integration}`,
    integration,
  };
}

function sanitizeReason(error) {
  const status = error?.response?.data?.error?.status || error?.response?.data?.error?.code;
  const httpStatus = error?.response?.status;
  const code = error?.code || status || (httpStatus ? `HTTP_${httpStatus}` : "PROVIDER_ERROR");
  let category = "provider error";
  if (["API_KEY_INVALID", "REQUEST_DENIED", "PERMISSION_DENIED", "UNAUTHENTICATED"].includes(code) || [401, 403].includes(httpStatus)) category = "authentication or configuration error";
  else if (["RESOURCE_EXHAUSTED", "OVER_QUERY_LIMIT", "QUOTA_EXCEEDED"].includes(code) || httpStatus === 429) category = "quota or rate limit error";
  else if (["ECONNRESET", "ECONNREFUSED", "ENETUNREACH", "EAI_AGAIN", "NETWORK_ERROR"].includes(code)) category = "network error";
  else if (httpStatus >= 500 || ["INTERNAL", "UNAVAILABLE", "UNKNOWN"].includes(code)) category = "Google server error";
  const severity = category === "authentication or configuration error" || category === "quota or rate limit error" ? "critical" : "high";
  return { code: String(code).slice(0, 64), reason: `Google Places ${category}`, severity };
}

function failureMetadata(error, fallbackAvailable, request = {}) {
  const normalized = sanitizeReason(error);
  return {
    errorCode: normalized.code,
    reason: normalized.reason,
    severity: normalized.severity,
    fallbackAvailable: Boolean(fallbackAvailable),
    request: {
      city: request.city ? String(request.city).slice(0, 100) : null,
      keyword: request.keyword ? String(request.keyword).slice(0, 100) : null,
    },
  };
}

function geminiFailureDetails(error) {
  const code = String(error?.code || "GEMINI_PROVIDER_ERROR").slice(0, 64);
  let reason = "Gemini provider error";
  let severity = "high";
  if (["RATE_LIMIT"].includes(code) || error?.status === 429) {
    reason = "Gemini quota or rate limit error";
    severity = "critical";
  } else if (["NO_API_KEY", "INVALID_KEY", "PERMISSION_DENIED"].includes(code)) {
    reason = "Gemini authentication or configuration error";
    severity = "critical";
  } else if (code === "AI_TIMEOUT") {
    reason = "Gemini request timeout";
  } else if (code === "AI_BLOCKED") {
    reason = "Gemini response blocked by safety policy";
  } else if (code === "MODEL_UNAVAILABLE") {
    reason = "Gemini model unavailable";
    severity = "critical";
  }
  return { code, reason, severity };
}

async function withRetry(work) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      return await work();
    } catch (error) {
      if (attempt === 7 || !/deadlock|lock wait|database is locked|SQLITE_BUSY|duplicate|unique/i.test(error?.message || "")) throw error;
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
}

function serializePersistence(work) {
  const next = persistenceTail.then(work, work);
  persistenceTail = next.catch(() => undefined);
  return next;
}

if (!AdminNotification.associations.readStates) {
  AdminNotification.hasMany(AdminNotificationRead, {
    as: "readStates",
    foreignKey: "notificationId",
    constraints: false,
  });
}

function safeMetadata(value, depth = 0) {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { return null; }
  }
  if (!value || typeof value !== "object" || Array.isArray(value) || depth > 1) return null;

  const safe = {};
  for (const [key, item] of Object.entries(value)) {
    if (/password|otp|token|secret|credential|authorization|resume|email|url/i.test(key)) continue;
    if (typeof item === "string") safe[key] = item.slice(0, 500);
    else if (typeof item === "number" || typeof item === "boolean" || item === null) safe[key] = item;
    else if (depth === 0 && item && typeof item === "object" && !Array.isArray(item)) {
      safe[key] = safeMetadata(item, depth + 1);
    }
  }
  return safe;
}

export async function createAdminNotification({
  type, title, message, severity = "info", user = null, userId = null,
  userName = null, userEmail = null, link = null, eventKey = null,
  incidentId = null, resolved = false, metadata = null, transaction = null,
}) {
  const actorId = Number(user?.id ?? userId);
  const safeUserId = Number.isSafeInteger(actorId) && actorId > 0 ? actorId : null;
  const options = transaction ? { transaction } : {};
  const values = {
    type: String(type || "system_activity").slice(0, 64),
    title: String(title || "Platform activity").slice(0, 255),
    message: String(message || "An activity was recorded.").slice(0, 5000),
    severity: ["critical", "high", "warning", "info"].includes(String(severity).toLowerCase())
      ? String(severity).toLowerCase()
      : "info",
    userId: safeUserId,
    userName: String(user?.name ?? userName ?? "").slice(0, 255) || null,
    userEmail: String(user?.email ?? userEmail ?? "").slice(0, 255) || null,
    link: link ? String(link).slice(0, 512) : null,
    eventKey: eventKey ? String(eventKey).slice(0, 191) : null,
    incidentId: incidentId || null,
    resolved: Boolean(resolved),
    metadata: safeMetadata(metadata),
  };
  if (values.eventKey) {
    const [notification] = await AdminNotification.findOrCreate({
      where: { eventKey: values.eventKey },
      defaults: values,
      ...options,
    });
    return notification;
  }
  return AdminNotification.create(values, options);
}

export function recordUserActivity(user, activity) {
  if (!user?.id || !activity) return Promise.resolve(null);
  return createAdminNotification({ ...activity, user });
}

export function recordSystemActivity(activity) {
  return createAdminNotification(activity);
}

export async function backfillHistoricalActivityNotifications() {
  const mysql = db.getDialect() === "mysql";
  const insert = mysql ? "INSERT IGNORE" : "INSERT OR IGNORE";
  const registrationKey = mysql
    ? "CONCAT('user-registration:', registered_user.id)"
    : "'user-registration:' || registered_user.id";
  const registrationMessage = mysql
    ? "CONCAT(registered_user.name, ' created a CareerLaunch account.')"
    : "registered_user.name || ' created a CareerLaunch account.'";
  const interviewKey = mysql
    ? "CONCAT('mock-interview-start:', interview.id)"
    : "'mock-interview-start:' || interview.id";
  const interviewMessage = mysql
    ? "CONCAT(registered_user.name, ' started a ', COALESCE(interview.difficulty, 'general'), ' interview for ', COALESCE(interview.role, 'a role'), '.')"
    : "registered_user.name || ' started a ' || COALESCE(interview.difficulty, 'general') || ' interview for ' || COALESCE(interview.role, 'a role') || '.'";

  const [registrations] = await db.query(`${insert} INTO admin_notifications
    (type, severity, title, message, link, user_id, user_name, user_email, event_key, resolved, created_at, updated_at)
    SELECT 'user_registration', 'info', 'New user registered', ${registrationMessage}, '/admin/users',
      registered_user.id, registered_user.name, registered_user.email, ${registrationKey}, 0, registered_user.created_at, registered_user.created_at
    FROM users AS registered_user
    LEFT JOIN admin_notifications AS existing ON existing.event_key = ${registrationKey}
    WHERE existing.id IS NULL`);

  const [interviews] = await db.query(`${insert} INTO admin_notifications
    (type, severity, title, message, user_id, user_name, user_email, event_key, resolved, created_at, updated_at)
    SELECT 'mock_interview', 'info', 'Mock interview started', ${interviewMessage},
      registered_user.id, registered_user.name, registered_user.email, ${interviewKey}, 0, interview.started_at, interview.started_at
    FROM interview_sessions AS interview
    INNER JOIN users AS registered_user ON registered_user.id = interview.user_id
    LEFT JOIN admin_notifications AS existing ON existing.event_key = ${interviewKey}
    WHERE interview.started_at IS NOT NULL AND existing.id IS NULL`);

  return {
    registrationsInserted: registrations.affectedRows ?? 0,
    interviewStartsInserted: interviews.affectedRows ?? 0,
  };
}

export async function recordProviderFailure(error, { fallbackAvailable = false, request = {}, integration = "company_search" } = {}) {
  const details = failureMetadata(error, fallbackAvailable, request);
  const group = providerGroup(integration);
  let outboxId = null;
  await serializePersistence(() => withRetry(() => db.transaction(async (transaction) => {
    const now = new Date();
    const [state] = await ProviderIncidentState.findOrCreate({
      where: { groupKey: group.groupKey },
      defaults: { groupKey: group.groupKey, environment: ENVIRONMENT, provider: "google", integration: group.integration },
      transaction,
    });
    await state.reload({ transaction, lock: transaction.LOCK.UPDATE });

    let incident = state.currentIncidentId
      ? await ProviderIncident.findByPk(state.currentIncidentId, { transaction, lock: transaction.LOCK.UPDATE })
      : null;
    if (!incident || incident.status !== "open") {
      incident = await ProviderIncident.create({
        groupKey: group.groupKey, environment: ENVIRONMENT, provider: "google", integration: group.integration,
        status: "open", severity: details.severity, firstSeenAt: now, lastSeenAt: now,
        failureCount: 1, errorCode: details.errorCode, reason: details.reason,
        fallbackAvailable: details.fallbackAvailable, metadata: details,
      }, { transaction });
      state.currentIncidentId = incident.id;
      state.consecutiveSuccesses = 0;
      await state.save({ transaction });

      await createAdminNotification({
        type: "company_provider_failure", severity: details.severity,
        title: "Google Places company fetching failed",
        message: `${details.reason}. Company searches are using stored data when available.`,
        incidentId: incident.id, metadata: details, transaction,
      });
      const outbox = await NotificationOutbox.create({
        incidentId: incident.id, emailType: EMAIL_TYPE, status: "pending", attempts: 0,
        availableAt: now,
      }, { transaction });
      outboxId = outbox.id;
    } else {
      incident.lastSeenAt = now;
      incident.failureCount += 1;
      incident.errorCode = details.errorCode;
      incident.reason = details.reason;
      incident.severity = details.severity;
      incident.fallbackAvailable = details.fallbackAvailable;
      incident.metadata = details;
      incident.recoverySuccesses = 0;
      await incident.save({ transaction });
    }
  })));

  if (outboxId) processNotificationOutbox().catch(error => console.error("[notifications] outbox processing failed:", error.message));
}

export async function recordProviderRecovery(integration = "company_search") {
  const group = providerGroup(integration);
  await serializePersistence(() => withRetry(() => db.transaction(async (transaction) => {
    const state = await ProviderIncidentState.findOne({ where: { groupKey: group.groupKey }, transaction, lock: transaction.LOCK.UPDATE });
    if (!state?.currentIncidentId) return;
    const incident = await ProviderIncident.findByPk(state.currentIncidentId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!incident || incident.status !== "open") return;

    const now = new Date();
    state.consecutiveSuccesses += 1;
    state.lastSuccessAt = now;
    if (state.consecutiveSuccesses < RECOVERY_THRESHOLD) {
      await state.save({ transaction });
      return;
    }

    incident.status = "resolved";
    incident.resolvedAt = now;
    incident.recoverySuccesses = state.consecutiveSuccesses;
    incident.lastSeenAt = now;
    await incident.save({ transaction });
    state.currentIncidentId = null;
    state.consecutiveSuccesses = 0;
    await state.save({ transaction });
    await AdminNotification.update({ resolved: true }, { where: { incidentId: incident.id }, transaction });
    await createAdminNotification({
      type: "recovery", severity: "info", title: "Google Places company fetching recovered",
      message: "Live company results are available again.", incidentId: incident.id, resolved: true,
      metadata: { recoveredAt: now.toISOString() }, transaction,
    });
  })));
}

export async function recordUserRegistration(user) {
  if (!user?.id) return;
  try {
    await createAdminNotification({
      eventKey: `user-registration:${user.id}`,
      type: "user_registration",
      severity: "info",
      title: "New user registered",
      message: `${user.name || "A new user"} created a CareerLaunch account.`,
      link: "/admin/users",
      user,
      metadata: { role: user.role || "student" },
    });
  } catch (error) {
    const isDuplicate = error?.name === "SequelizeUniqueConstraintError"
      || error?.parent?.code === "ER_DUP_ENTRY"
      || error?.parent?.code === "SQLITE_CONSTRAINT";
    if (!isDuplicate) throw error;
  }
}

export function isGeminiProviderFailure(error) {
  return ["NO_API_KEY", "INVALID_KEY", "RATE_LIMIT", "AI_TIMEOUT", "PERMISSION_DENIED", "MODEL_UNAVAILABLE"].includes(error?.code)
    || error?.status === 429
    || error?.status >= 500;
}

export async function recordGeminiInterviewFailure(error, { operation = "interview" } = {}) {
  if (!isGeminiProviderFailure(error)) return;
  const details = geminiFailureDetails(error);
  const group = providerGroup("gemini_interview");
  let outboxId = null;
  await serializePersistence(() => withRetry(() => db.transaction(async (transaction) => {
    const now = new Date();
    const [state] = await ProviderIncidentState.findOrCreate({
      where: { groupKey: group.groupKey },
      defaults: { groupKey: group.groupKey, environment: ENVIRONMENT, provider: "gemini", integration: group.integration },
      transaction,
    });
    await state.reload({ transaction, lock: transaction.LOCK.UPDATE });
    let incident = state.currentIncidentId
      ? await ProviderIncident.findByPk(state.currentIncidentId, { transaction, lock: transaction.LOCK.UPDATE })
      : null;
    if (!incident || incident.status !== "open") {
      incident = await ProviderIncident.create({
        groupKey: group.groupKey, environment: ENVIRONMENT, provider: "gemini", integration: group.integration,
        status: "open", severity: details.severity, firstSeenAt: now, lastSeenAt: now,
        failureCount: 1, errorCode: details.code, reason: details.reason,
        fallbackAvailable: false, metadata: { code: details.code, operation },
      }, { transaction });
      state.currentIncidentId = incident.id;
      state.consecutiveSuccesses = 0;
      await state.save({ transaction });
      await createAdminNotification({
        type: "ai_provider_failure", severity: details.severity,
        title: "Gemini AI interview service failed",
        message: `${incident.reason}. Interview answers are preserved for retry.`,
        incidentId: incident.id, metadata: { operation, errorCode: details.code }, transaction,
      });
      const outbox = await NotificationOutbox.create({
        incidentId: incident.id, emailType: "ai_provider_failure", status: "pending", attempts: 0, availableAt: now,
      }, { transaction });
      outboxId = outbox.id;
    } else {
      incident.lastSeenAt = now;
      incident.failureCount += 1;
      incident.errorCode = details.code;
      incident.metadata = { code: details.code, operation };
      await incident.save({ transaction });
    }
  })));
  if (outboxId) processNotificationOutbox().catch(workerError => console.error("[notifications] Gemini outbox failed:", workerError.message));
}

const TYPE_GROUPS = {
  user: ["user_registration", "user_login", "admin_login", "user_logout", "profile_updated", "resume_uploaded"],
  company: ["company_saved", "company_viewed", "company_provider_failure"],
  job: ["job_saved", "job_application", "job_search", "job_provider_failure"],
  ai: ["ai_provider_failure", "mock_interview"],
  content: ["roadmap_activity", "roadmap_completed", "resource_activity"],
  system: ["company_provider_failure", "job_provider_failure", "ai_provider_failure", "recovery", "admin_activity", "api_error", "email_error", "database_error"],
};

export async function listNotifications({
  adminId, page = 1, limit = 20, type, severity, read, unread, resolved, incidentId, search,
}) {
  const where = {};
  if (type && type !== "all") where.type = TYPE_GROUPS[type] ? { [Op.in]: TYPE_GROUPS[type] } : type;
  if (severity && severity !== "all") {
    if (!["critical", "high", "warning", "info"].includes(severity)) {
      throw Object.assign(new Error("Invalid severity filter."), { status: 400 });
    }
    where.severity = severity;
  }
  if (resolved !== undefined && resolved !== "" && resolved !== "all") {
    if (!["true", "false"].includes(String(resolved))) {
      throw Object.assign(new Error("Invalid resolution filter."), { status: 400 });
    }
    where.resolved = String(resolved) === "true";
  }
  if (incidentId !== undefined && incidentId !== null && String(incidentId).trim() !== "") {
    const parsedIncidentId = Number(incidentId);
    if (!Number.isInteger(parsedIncidentId) || parsedIncidentId < 1) {
      throw Object.assign(new Error("Invalid incident filter."), { status: 400 });
    }
    where.incidentId = parsedIncidentId;
  }

  const query = typeof search === "string" ? search.trim().slice(0, 120) : "";
  if (query) {
    where[Op.or] = [
      { title: { [Op.like]: `%${query}%` } },
      { message: { [Op.like]: `%${query}%` } },
      { userName: { [Op.like]: `%${query}%` } },
      { userEmail: { [Op.like]: `%${query}%` } },
      { type: { [Op.like]: `%${query}%` } },
    ];
  }

  let readFilter = read;
  if (!readFilter && unread === "true") readFilter = "unread";
  if (readFilter === "true") readFilter = "read";
  if (readFilter === "false") readFilter = "unread";
  if (readFilter && !["all", "read", "unread"].includes(readFilter)) {
    throw Object.assign(new Error("Invalid read filter."), { status: 400 });
  }
  if (readFilter === "unread") where["$readStates.id$"] = { [Op.is]: null };

  const requestedPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const queryOptions = {
    where,
    include: [{
      model: AdminNotificationRead,
      as: "readStates",
      attributes: ["id"],
      where: { adminId },
      required: readFilter === "read",
    }],
    order: [["createdAt", "DESC"], ["id", "DESC"]],
    limit: safeLimit,
    offset: (requestedPage - 1) * safeLimit,
    distinct: true,
    subQuery: false,
  };
  const result = await AdminNotification.findAndCountAll(queryOptions);
  const total = Number(result.count) || 0;
  const totalPages = Math.ceil(total / safeLimit);
  const safePage = Math.min(requestedPage, Math.max(1, totalPages));
  const pageRows = safePage === requestedPage
    ? result.rows
    : await AdminNotification.findAll({ ...queryOptions, offset: (safePage - 1) * safeLimit });
  const incidentIds = pageRows.map(row => row.incidentId).filter(Boolean);
  const outboxRows = incidentIds.length
    ? await NotificationOutbox.findAll({ where: { incidentId: { [Op.in]: incidentIds } } })
    : [];
  const outboxByIncident = new Map(outboxRows.map(row => [row.incidentId, row]));
  const legacyUserIds = pageRows
    .filter(row => row.type === "user_registration" && (!row.userName || !row.userEmail))
    .map(row => safeMetadata(row.metadata)?.userId)
    .filter(id => Number.isSafeInteger(Number(id)) && Number(id) > 0)
    .map(Number);
  const legacyUsers = legacyUserIds.length
    ? await User.findAll({ where: { id: { [Op.in]: legacyUserIds } }, attributes: ["id", "name", "email"] })
    : [];
  const legacyUsersById = new Map(legacyUsers.map(user => [user.id, user]));
  const notifications = pageRows.map(row => {
    const value = row.toJSON();
    const isRead = Boolean(value.readStates?.length);
    delete value.readStates;
    const outbox = value.incidentId ? outboxByIncident.get(value.incidentId) : null;
    const fallbackUser = legacyUsersById.get(Number(value.userId || safeMetadata(value.metadata)?.userId));
    return {
      ...value,
      userId: value.userId || fallbackUser?.id || safeMetadata(value.metadata)?.userId || null,
      userName: value.userName || fallbackUser?.name || null,
      userEmail: value.userEmail || fallbackUser?.email || null,
      metadata: safeMetadata(value.metadata),
      isRead,
      emailStatus: outbox?.status || null,
      emailUncertain: Boolean(outbox?.uncertain),
    };
  });
  return { notifications, total, page: safePage, limit: safeLimit, totalPages };
}

export async function getUnreadCount(adminId) {
  const [total, read] = await Promise.all([
    AdminNotification.count(),
    AdminNotificationRead.count({ where: { adminId } }),
  ]);
  return Math.max(0, total - read);
}

export async function markNotificationRead(notificationId, adminId, isRead = true) {
  if (isRead) {
    await AdminNotificationRead.findOrCreate({
      where: { notificationId, adminId },
      defaults: { notificationId, adminId, readAt: new Date() },
    });
  } else {
    await AdminNotificationRead.destroy({ where: { notificationId, adminId } });
  }
}

export async function markAllNotificationsRead(adminId) {
  const insert = db.getDialect() === "mysql" ? "INSERT IGNORE" : "INSERT OR IGNORE";
  await db.query(`${insert} INTO admin_notification_reads (notification_id, admin_id, read_at)
    SELECT notifications.id, :adminId, CURRENT_TIMESTAMP
    FROM admin_notifications AS notifications
    LEFT JOIN admin_notification_reads AS notification_read
      ON notification_read.notification_id = notifications.id AND notification_read.admin_id = :adminId
    WHERE notification_read.id IS NULL`, { replacements: { adminId } });
}

async function claimOutbox() {
  return db.transaction(async (transaction) => {
    const row = await NotificationOutbox.findOne({ where: { status: "pending", availableAt: { [Op.lte]: new Date() } }, order: [["id", "ASC"]], transaction, lock: transaction.LOCK.UPDATE, skipLocked: true });
    if (!row) return null;
    row.status = "processing";
    row.claimedAt = new Date();
    row.attempts += 1;
    await row.save({ transaction });
    return row;
  });
}

export async function processNotificationOutbox() {
  const row = await claimOutbox();
  if (!row) return false;
  try {
    const incident = await ProviderIncident.findByPk(row.incidentId);
    await sendAdminProviderFailureEmail(incident);
    await withRetry(() => row.update({ status: "sent", sentAt: new Date(), uncertain: false, lastError: null }));
  } catch (error) {
    const ambiguous = ["ETIMEDOUT", "ESOCKETTIMEDOUT", "ECONNRESET", "ECONNREFUSED"].includes(error?.code);
    try {
      await withRetry(() => row.update({ status: ambiguous ? "uncertain" : "failed", uncertain: ambiguous, lastError: String(error?.message || "Email delivery failed").slice(0, 255) }));
    } catch (updateError) {
      console.error("[notifications] unable to persist outbox delivery status:", updateError.message);
    }
  }
  return true;
}

export function startNotificationOutboxWorker() {
  const timer = setInterval(() => processNotificationOutbox().catch(error => console.error("[notifications] worker failed:", error.message)), 15000);
  timer.unref?.();
  return timer;
}

export { sanitizeReason };
