import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  importJobs,
  saveJobForUser,
  unsaveJob,
  getSavedJobs,
} from "../services/job.service.js";

/* ── Public / student ────────────────────────────────────────────────────── */

export const getAllJobs = async (req, res) => {
  try {
    const { search, location, jobType, page, limit } = req.query;
    const result = await getJobs({ search, location, jobType, page, limit });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const getJob = async (req, res) => {
  try {
    const job = await getJobById(req.params.id);
    return res.status(200).json(job);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

/* ── Saved jobs ──────────────────────────────────────────────────────────── */

export const saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: "jobId is required" });
    const result = await saveJobForUser(req.user.id, jobId);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const removeSavedJob = async (req, res) => {
  try {
    const result = await unsaveJob(req.user.id, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const fetchSavedJobs = async (req, res) => {
  try {
    const jobs = await getSavedJobs(req.user.id);
    return res.status(200).json(jobs);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

/* ── Admin ───────────────────────────────────────────────────────────────── */

export const addJob = async (req, res) => {
  try {
    const job = await createJob({ ...req.body, postedBy: req.user.id });
    return res.status(201).json(job);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const editJob = async (req, res) => {
  try {
    const job = await updateJob(req.params.id, req.body);
    return res.status(200).json(job);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const removeJob = async (req, res) => {
  try {
    const result = await deleteJob(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const bulkImportJobs = async (req, res) => {
  try {
    const { jobs } = req.body;
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ message: "jobs array is required" });
    }
    const result = await importJobs(jobs);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

/* ── Legacy apply (kept for backward compat) ─────────────────────────────── */
export const applyJob = async (req, res) => {
  try {
    const { default: db } = await import("../config/db.js");
    await db.query(
      `INSERT OR IGNORE INTO applications (user_id, job_id, status)
       VALUES (:uid, :jid, 'Applied')`,
      { replacements: { uid: req.user.id, jid: req.params.id } }
    );
    return res.status(200).json({ message: "Applied successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
