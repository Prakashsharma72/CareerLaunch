import { useDispatch, useSelector } from "react-redux";

import {
  fetchJobsStart,
  fetchJobsSuccess,
  fetchJobsFailure,
  setSelectedJob,
  addJob,
} from "../redux/jobSlice";

import {
  getAllJobs,
  createJob,
  applyJob,
} from "../services/jobService";

/**
 * Custom Jobs Hook
 * Centralized job logic for UI components
 */
const useJobs = () => {
  const dispatch = useDispatch();

  const { jobs, selectedJob, loading, error } = useSelector(
    (state) => state.jobs
  );

  /**
   * FETCH ALL JOBS
   */
  const fetchJobs = async () => {
    try {
      dispatch(fetchJobsStart());

      const res = await getAllJobs();

      dispatch(fetchJobsSuccess(res.data));
    } catch (err) {
      dispatch(
        fetchJobsFailure(
          err?.response?.data?.message || "Failed to fetch jobs"
        )
      );
    }
  };

  /**
   * CREATE JOB
   */
  const postJob = async (jobData) => {
    try {
      const res = await createJob(jobData);

      dispatch(addJob(res.data));

      return res.data;
    } catch (err) {
      console.error("Create job failed:", err);
    }
  };

  /**
   * APPLY JOB
   */
  const applyToJob = async (jobId) => {
    try {
      const res = await applyJob(jobId);

      return res.data;
    } catch (err) {
      console.error("Apply job failed:", err);
    }
  };

  /**
   * SELECT JOB (UI only)
   */
  const selectJob = (job) => {
    dispatch(setSelectedJob(job));
  };

  return {
    jobs,
    selectedJob,
    loading,
    error,

    fetchJobs,
    postJob,
    applyToJob,
    selectJob,
  };
};

export default useJobs;