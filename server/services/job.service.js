import { Op } from "sequelize";
import db from "../config/db.js";
import Job from "../models/job.model.js";

/* ── helpers ─────────────────────────────────────────────────────────────── */

function buildWhere({ search, location, jobType, status = "active" }) {
  const where = {};

  if (status) where.status = status;

  if (search) {
    where[Op.or] = [
      { title:   { [Op.like]: `%${search}%` } },
      { company: { [Op.like]: `%${search}%` } },
    ];
  }

  if (location) {
    where.location = { [Op.like]: `%${location}%` };
  }

  if (jobType) {
    where.employmentType = { [Op.like]: `%${jobType}%` };
  }

  return where;
}

/* ── public functions ────────────────────────────────────────────────────── */

/**
 * Paginated job list with optional search/filter.
 */
export async function getJobs({ search, location, jobType, page = 1, limit = 12 } = {}) {
  const offset = (page - 1) * limit;
  const where  = buildWhere({ search, location, jobType });

  const { count, rows } = await Job.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: Number(limit),
    offset,
    attributes: { exclude: ["applicants"] },
  });

  return {
    jobs:       rows,
    total:      count,
    page:       Number(page),
    totalPages: Math.ceil(count / limit),
  };
}

/**
 * Single job by primary key.
 */
export async function getJobById(id) {
  const job = await Job.findByPk(id);
  if (!job) {
    const err = new Error("Job not found");
    err.status = 404;
    throw err;
  }
  return job;
}

/**
 * Create a new job (admin / import).
 */
export async function createJob(data) {
  return Job.create(data);
}

/**
 * Update an existing job.
 */
export async function updateJob(id, data) {
  const job = await Job.findByPk(id);
  if (!job) {
    const err = new Error("Job not found");
    err.status = 404;
    throw err;
  }
  await job.update(data);
  return job;
}

/**
 * Soft-delete: set status = 'inactive'.
 */
export async function deleteJob(id) {
  const job = await Job.findByPk(id);
  if (!job) {
    const err = new Error("Job not found");
    err.status = 404;
    throw err;
  }
  await job.update({ status: "inactive" });
  return { message: "Job removed" };
}

/**
 * Bulk import — saves each job, skipping duplicates by externalJobId.
 * Returns { saved, skipped } counts.
 */
export async function importJobs(jobsArray) {
  let saved = 0;
  let skipped = 0;

  for (const data of jobsArray) {
    try {
      if (data.externalJobId) {
        const exists = await Job.findOne({
          where: { externalJobId: data.externalJobId },
        });
        if (exists) { skipped++; continue; }
      }
      await Job.create({ ...data, status: "active" });
      saved++;
    } catch {
      skipped++;
    }
  }

  return { saved, skipped };
}

/**
 * Save a job for a user (saved_jobs table via raw query for portability).
 */
export async function saveJobForUser(userId, jobId) {
  // Verify job exists
  await getJobById(jobId);

  await db.query(
    `INSERT OR IGNORE INTO saved_jobs (user_id, job_id) VALUES (:uid, :jid)`,
    { replacements: { uid: userId, jid: jobId } }
  );
  return { message: "Job saved" };
}

/**
 * Remove a saved job.
 */
export async function unsaveJob(userId, savedJobId) {
  await db.query(
    `DELETE FROM saved_jobs WHERE id = :id AND user_id = :uid`,
    { replacements: { id: savedJobId, uid: userId } }
  );
  return { message: "Removed from saved jobs" };
}

/**
 * Get all saved jobs for a user (joined with jobs table).
 */
export async function getSavedJobs(userId) {
  const [rows] = await db.query(
    `SELECT sj.id AS savedId, j.*
     FROM saved_jobs sj
     JOIN jobs j ON j.id = sj.job_id
     WHERE sj.user_id = :uid
       AND j.status != 'inactive'
     ORDER BY sj.saved_at DESC`,
    { replacements: { uid: userId } }
  );
  return rows;
}
