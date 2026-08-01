import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBookmark, FaSearch, FaSpinner } from "react-icons/fa";
import JobCard from "../../components/Jobs/JobCard";
import { getSavedJobs, removeSavedJob } from "../../services/jobService";

function JobCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#0f1123] border border-gray-200 dark:border-white/8 rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-white/8 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-white/8 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-2/5" />
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-200 dark:bg-white/8 rounded-full" />
        <div className="h-6 w-20 bg-gray-200 dark:bg-white/8 rounded-full" />
      </div>
      <div className="h-8 bg-gray-200 dark:bg-white/8 rounded-xl" />
    </div>
  );
}

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [removing,  setRemoving]  = useState(null); // savedId being removed

  const loadSaved = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await getSavedJobs();
      setSavedJobs(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  const handleRemove = async (savedId) => {
    setRemoving(savedId);
    try {
      await removeSavedJob(savedId);
      setSavedJobs((prev) => prev.filter((j) => j.savedId !== savedId));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to remove job");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#080810] p-6 md:p-8 space-y-7">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Saved Jobs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Jobs you bookmarked — fetched live from MySQL</p>
        </div>
        {!loading && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto
            bg-blue-50 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400
            px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/30">
            <FaBookmark className="text-[10px]" />
            {savedJobs.length} saved
          </span>
        )}
      </div>

      {/* Stats card */}
      <div className="bg-white dark:bg-[#0f1123] border border-gray-200 dark:border-white/8 rounded-2xl shadow-sm p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
          <FaBookmark className="text-xl text-blue-500" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Saved Jobs</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {loading ? <FaSpinner className="animate-spin inline text-2xl" /> : savedJobs.length}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-500/25 text-sm text-red-600 dark:text-red-400 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={loadSaved} className="text-xs font-semibold underline shrink-0">Retry</button>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading && Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}

        {!loading && savedJobs.length === 0 && !error && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center justify-center
              bg-white dark:bg-[#0f1123] border border-gray-100 dark:border-white/8
              rounded-2xl p-16 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <FaSearch className="text-3xl text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No saved jobs yet</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm">
                Go to <a href="/student/jobs" className="text-blue-500 hover:underline">Find Jobs</a> and
                click the bookmark icon to save jobs here.
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {!loading && savedJobs.map((job) => (
            <motion.div key={job.savedId ?? job.id} layout exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
              <JobCard
                job={{ ...job, id: job.id ?? job.job_id }}
                isSaved={true}
                onSaveJob={() => handleRemove(job.savedId)}
              />
              {removing === job.savedId && (
                <div className="mt-2 flex items-center justify-center gap-2 text-xs text-red-500">
                  <FaSpinner className="animate-spin" /> Removing…
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
