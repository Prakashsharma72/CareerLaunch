import Job from "../models/job.model.js";

/**
 * CREATE JOB
 */
export const createJobService = async (data) => {
  const job = await Job.create(data);
  return job;
};

/**
 * GET ALL JOBS
 */
export const getJobsService = async () => {
  return await Job.findAll({ order: [["createdAt", "DESC"]] });
};

/**
 * GET SINGLE JOB
 */
export const getJobByIdService = async (id) => {
  return await Job.findByPk(id);
};

/**
 * APPLY TO JOB
 */
export const applyJobService = async (jobId, userId) => {
  const job = await Job.findByPk(jobId);

  if (!job) {
    throw new Error("Job not found");
  }

  let applicants = job.applicants || [];

  if (!applicants.includes(userId)) {
    applicants.push(userId);
  }

  await job.update({ applicants });

  return { message: "Applied successfully" };
};