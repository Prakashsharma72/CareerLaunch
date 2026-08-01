import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBriefcase,
  FaSearch,
  FaTimes,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import JobCard   from "../../components/Jobs/JobCard";
import JobFilter from "../../components/Jobs/JobFilter";
import { getAllJobs } from "../../services/jobService";

const PAGE_SIZE = 9;

/* ── Skeleton card ───────────────────────────────────────────────────────── */
function JobCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#0f1123] border border-gray-200 dark:border-white/8 rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-white/8 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-white/8 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-1/2" />
        </div>
        <div className="w-16 h-7 bg-gray-200 dark:bg-white/8 rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-2/5" />
        <div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-1/3" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-200 dark:bg-white/8 rounded-full" />
        <div className="h-6 w-20 bg-gray-200 dark:bg-white/8 rounded-full" />
        <div className="h-6 w-14 bg-gray-200 dark:bg-white/8 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-white/6">
        <div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-24" />
        <div className="h-8 w-24 bg-gray-200 dark:bg-white/8 rounded-xl" />
      </div>
    </div>
  );
}

/* ── Pagination ──────────────────────────────────────────────────────────── */
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="w-9 h-9 rounded-xl flex items-center justify-center
          bg-white dark:bg-white/8 border border-gray-200 dark:border-white/10
          text-gray-600 dark:text-gray-300 disabled:opacity-30
          hover:bg-gray-50 dark:hover:bg-white/15 transition-colors">
        <FaChevronLeft className="text-xs" />
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all
            ${p === page
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105"
              : "bg-white dark:bg-white/8 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/15"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
        className="w-9 h-9 rounded-xl flex items-center justify-center
          bg-white dark:bg-white/8 border border-gray-200 dark:border-white/10
          text-gray-600 dark:text-gray-300 disabled:opacity-30
          hover:bg-gray-50 dark:hover:bg-white/15 transition-colors">
        <FaChevronRight className="text-xs" />
      </button>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function Jobs() {
  const [allJobs,      setAllJobs]      = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [page,         setPage]         = useState(1);
  const [savedJobIds,  setSavedJobIds]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("savedJobIds") || "[]"); }
    catch { return []; }
  });

  /* ── Fetch all jobs from API ───────────────────────────────── */
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAllJobs({ limit: 200 });
      const jobs = data.jobs ?? data ?? [];
      setAllJobs(jobs);
      setFiltered(jobs);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  /* ── Client-side filtering ─────────────────────────────────── */
  const handleFilter = useCallback((filters) => {
    setPage(1);
    let result = [...allJobs];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (j) => j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q)
      );
    }
    if (filters.location) {
      result = result.filter((j) =>
        j.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.jobType) {
      result = result.filter((j) =>
        (j.type || j.jobType)?.toLowerCase() === filters.jobType.toLowerCase()
      );
    }
    setFiltered(result);
  }, [allJobs]);

  /* ── Save / unsave ─────────────────────────────────────────── */
  const handleSaveJob = useCallback((jobId) => {
    setSavedJobIds((prev) => {
      const next = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];
      localStorage.setItem("savedJobIds", JSON.stringify(next));
      return next;
    });
  }, []);

  /* ── Pagination ────────────────────────────────────────────── */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#080810] p-6 md:p-8 space-y-7">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Find Jobs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Explore internships and fresher opportunities
          </p>
        </div>

        {!loading && !error && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold
              bg-blue-50 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400
              px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/30">
              {filtered.length} job{filtered.length !== 1 ? "s" : ""}
            </span>
            <button onClick={fetchJobs}
              title="Refresh"
              className="w-8 h-8 rounded-xl flex items-center justify-center
                bg-white dark:bg-white/8 border border-gray-200 dark:border-white/10
                text-gray-500 dark:text-gray-400
                hover:bg-gray-50 dark:hover:bg-white/15 transition-colors">
              <FaSyncAlt className="text-xs" />
            </button>
          </div>
        )}
      </div>

      {/* ── Filter ─────────────────────────────────────────────── */}
      <JobFilter onFilter={handleFilter} />

      {/* ── Result meta ────────────────────────────────────────── */}
      <AnimatePresence>
        {!loading && !error && filtered.length > 0 && (
          <motion.p key="meta"
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            <strong className="text-gray-800 dark:text-white">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
            </strong>{" "}
            of{" "}
            <strong className="text-gray-800 dark:text-white">{filtered.length}</strong>{" "}
            jobs
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Grid ───────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

        {/* Loading skeletons */}
        {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => <JobCardSkeleton key={i} />)}

        {/* Error */}
        {!loading && error && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center justify-center
              bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20
              rounded-2xl p-14 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FaBriefcase className="text-2xl text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">Failed to load jobs</h3>
              <p className="text-sm text-red-500 dark:text-red-400 max-w-sm">{error}</p>
            </div>
            <button onClick={fetchJobs}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty */}
        {!loading && !error && paginated.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center justify-center
              bg-white dark:bg-[#0f1123] border border-gray-100 dark:border-white/8
              rounded-2xl p-16 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <FaSearch className="text-3xl text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No jobs found</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm">
                Try adjusting your filters or check back later for new listings.
              </p>
            </div>
          </motion.div>
        )}

        {/* Job cards */}
        {!loading && !error && paginated.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSaved={savedJobIds.includes(job.id)}
            onSaveJob={handleSaveJob}
          />
        ))}
      </div>

      {/* ── Pagination ─────────────────────────────────────────── */}
      {!loading && !error && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      )}
    </div>
  );
}
