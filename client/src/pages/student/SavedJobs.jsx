/**
 * SavedJobs.jsx
 * Reads ONLY from MySQL saved_jobs (user bookmarks).
 * Never fetches from the live jobs API.
 * All job data was stored inline when the user clicked Save.
 */
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBookmark, FaSearch, FaMapMarkerAlt, FaMoneyBillWave,
  FaBriefcase, FaExternalLinkAlt, FaTrash, FaSyncAlt,
  FaClock, FaBuilding,
} from "react-icons/fa";
import { getSavedJobs, removeSavedJob } from "../../services/jobService";
import AvatarIcon from "../../components/common/AvatarIcon";

/* ── Helpers ──────────────────────────────────────────────────────────── */
const GRADS = [
  ["#3b82f6","#6366f1"],["#8b5cf6","#a855f7"],["#10b981","#14b8a6"],
  ["#f43f5e","#ec4899"],["#f59e0b","#f97316"],["#06b6d4","#0ea5e9"],
];
const grad   = (s="") => GRADS[(s.charCodeAt(0)||0) % GRADS.length];
const fmtDate = (str) => {
  if (!str) return "";
  try {
    const d = new Date(str), now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff <= 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7)  return `${diff}d ago`;
    if (diff < 30) return `${Math.floor(diff/7)}w ago`;
    return d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
  } catch { return str; }
};

const TYPE_COLOR = {
  "full time":  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "part time":  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "internship": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "remote":     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "contract":   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};
const typeColor = (t="") => TYPE_COLOR[t.toLowerCase()] || "bg-gray-100 text-gray-600 dark:bg-white/8 dark:text-gray-400";

/* ── Skeleton ─────────────────────────────────────────────────────────── */
function Sk() {
  return (
    <div className="bg-white dark:bg-[#0f1123] border border-gray-200 dark:border-white/8 rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-white/8 shrink-0" />
        <div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 dark:bg-white/8 rounded w-3/4" /><div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-1/2" /></div>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-2/5" />
      <div className="flex gap-2"><div className="h-6 w-20 bg-gray-200 dark:bg-white/8 rounded-full" /></div>
      <div className="flex justify-between border-t border-gray-100 dark:border-white/6 pt-3">
        <div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-24" />
        <div className="h-8 w-28 bg-gray-200 dark:bg-white/8 rounded-xl" />
      </div>
    </div>
  );
}

function SavedJobCard({ job, onRemove, removing }) {
  const [g1, g2] = grad(job.company || job.title);
  const empType  = job.employmentType || job.type || "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col bg-white dark:bg-[#0f1123] border border-gray-200 dark:border-white/8 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-black/8 dark:hover:shadow-black/40 overflow-hidden transition-shadow"
    >
      {/* accent bar */}
      <div className="h-1.5" style={{ background: `linear-gradient(90deg,${g1},${g2})` }} />

      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <AvatarIcon
            name={job.company || job.title}
            size={48}
            className="rounded-xl shadow-md shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-[15px] leading-tight line-clamp-2">{job.title}</h3>
            <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <FaBuilding className="text-xs shrink-0" />{job.company}
            </p>
          </div>
          {/* Remove bookmark */}
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
            onClick={() => onRemove(job.savedId)}
            disabled={removing}
            title="Remove bookmark"
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-900/15 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-40 transition-all"
          >
            {removing ? <FaSyncAlt className="animate-spin text-xs" /> : <FaTrash className="text-xs" />}
          </motion.button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500 dark:text-gray-400">
          {job.location && (
            <span className="flex items-center gap-1.5">
              <FaMapMarkerAlt className="text-blue-500 text-xs shrink-0" />{job.location}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1.5">
              <FaMoneyBillWave className="text-emerald-500 text-xs shrink-0" />{job.salary}
            </span>
          )}
        </div>

        {empType && (
          <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor(empType)}`}>
            {empType}
          </span>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/6 mt-auto">
          <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <FaClock className="text-[10px]" />{fmtDate(job.postedDate || job.createdAt)}
          </span>
          <div className="flex items-center gap-2">
            {job.applyUrl && (
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl transition-colors">
                Apply <FaExternalLinkAlt className="text-[9px]" />
              </a>
            )}
            <Link to={`/student/jobs/${job.externalJobId || job.id}`}
              className="flex items-center gap-1.5 text-xs font-semibold bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 px-3.5 py-2 rounded-xl transition-colors">
              Details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────── */
export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [removing,  setRemoving]  = useState(null);

  const load = useCallback(async () => {
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

  useEffect(() => { load(); }, [load]);

  const handleRemove = async (savedId) => {
    setRemoving(savedId);
    try {
      await removeSavedJob(savedId);
      setSavedJobs(prev => prev.filter(j => j.savedId !== savedId));
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
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Your bookmarked jobs — stored in your account</p>
        </div>
        {!loading && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto bg-blue-50 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/30">
            <FaBookmark className="text-[10px]" />{savedJobs.length} saved
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
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{loading ? "—" : savedJobs.length}</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-500/25 text-sm text-red-600 dark:text-red-400 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={load} className="text-xs font-semibold underline shrink-0">Retry</button>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading && Array.from({ length: 6 }).map((_, i) => <Sk key={i} />)}

        {!loading && savedJobs.length === 0 && !error && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center justify-center bg-white dark:bg-[#0f1123] border border-gray-100 dark:border-white/8 rounded-2xl p-16 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <FaSearch className="text-3xl text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No saved jobs yet</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm">
                Go to{" "}
                <Link to="/student/jobs" className="text-blue-500 hover:underline font-medium">Find Jobs</Link>
                {" "}and click the bookmark icon on any listing.
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {!loading && savedJobs.map(job => (
            <SavedJobCard
              key={job.savedId}
              job={job}
              onRemove={handleRemove}
              removing={removing === job.savedId}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
