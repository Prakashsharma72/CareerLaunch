import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaBuilding,
  FaClock,
  FaMoneyBillWave,
  FaBookmark,
  FaArrowRight,
  FaLocationArrow,
} from "react-icons/fa";
import { formatKm } from "../../utils/geoUtils";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const GRADIENTS = [
  ["#3b82f6", "#6366f1"],
  ["#8b5cf6", "#a855f7"],
  ["#10b981", "#14b8a6"],
  ["#f43f5e", "#ec4899"],
  ["#f59e0b", "#f97316"],
  ["#06b6d4", "#0ea5e9"],
];

function avatarGradient(name = "") {
  const idx = (name.charCodeAt(0) || 0) % GRADIENTS.length;
  return GRADIENTS[idx];
}

function initials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

const JOB_TYPE_COLORS = {
  "full time":  "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
  "part time":  "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
  "internship": "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  "remote":     "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  "contract":   "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-500/30",
};

function jobTypeBadge(type = "") {
  return JOB_TYPE_COLORS[type.toLowerCase()] ||
    "bg-gray-100 text-gray-600 dark:bg-white/8 dark:text-gray-400 border-gray-200 dark:border-white/10";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7)  return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function JobCard({ job, isSaved = false, onSaveJob, distanceKm = null }) {
  const {
    id,
    title,
    company,
    location,
    type,
    jobType,
    salary,
    skillsRequired,
    description,
    createdAt,
  } = job;

  // Prefer prop over job._distKm (both routes are supported)
  const resolvedDistKm = distanceKm ?? job._distKm ?? null;
  const distLabel      = formatKm(resolvedDistKm);

  const displayType  = type || jobType || "";
  const skills       = Array.isArray(skillsRequired) ? skillsRequired : [];
  const [g1, g2]     = avatarGradient(company || title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      transition={{ duration: 0.22 }}
      className="flex flex-col bg-white dark:bg-[#0f1123]
        border border-gray-200 dark:border-white/8
        rounded-2xl shadow-sm hover:shadow-xl hover:shadow-black/8 dark:hover:shadow-black/40
        overflow-hidden transition-shadow duration-300"
    >
      {/* Coloured top bar */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${g1}, ${g2})` }} />

      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-start gap-3">

          {/* Company avatar */}
          <div
            className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center
              text-white font-extrabold text-sm select-none shadow-md"
            style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
          >
            {initials(company || title)}
          </div>

          {/* Title + company */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-[15px] leading-tight line-clamp-1">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-gray-500 dark:text-gray-400 text-sm">
              <FaBuilding className="text-xs shrink-0" />
              <span className="truncate">{company}</span>
            </div>
          </div>

          {/* Save button */}
          <motion.button
            whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
            onClick={() => onSaveJob?.(id)}
            title={isSaved ? "Unsave job" : "Save job"}
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all
              ${isSaved
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : "bg-gray-100 dark:bg-white/8 text-gray-400 dark:text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"}`}
          >
            <FaBookmark className="text-sm" />
          </motion.button>
        </div>

        {/* ── Meta info ───────────────────────────────────────── */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500 dark:text-gray-400">
          {location && (
            <span className="flex items-center gap-1.5">
              <FaMapMarkerAlt className="text-blue-500 text-xs shrink-0" />
              {location}
            </span>
          )}
          {distLabel && (
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs">
              <FaLocationArrow className="text-[10px] shrink-0" />
              {distLabel} away
            </span>
          )}
          {salary && (
            <span className="flex items-center gap-1.5">
              <FaMoneyBillWave className="text-emerald-500 text-xs shrink-0" />
              {salary}
            </span>
          )}
        </div>

        {/* Job type badge */}
        {displayType && (
          <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full border ${jobTypeBadge(displayType)}`}>
            {displayType}
          </span>
        )}

        {/* ── Skills ──────────────────────────────────────────── */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 5).map((skill) => (
              <span key={skill}
                className="text-xs bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400
                  border border-gray-200 dark:border-white/10 px-2.5 py-0.5 rounded-full">
                {skill}
              </span>
            ))}
            {skills.length > 5 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 px-1 py-0.5">
                +{skills.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* ── Description ─────────────────────────────────────── */}
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>
        )}

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/6">
          <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <FaClock className="text-[10px]" />
            {formatDate(createdAt)}
          </span>

          <Link
            to={`/student/jobs/${id}`}
            className="flex items-center gap-1.5 text-xs font-semibold
              bg-blue-600 hover:bg-blue-700 active:bg-blue-800
              text-white px-4 py-2 rounded-xl transition-colors
              shadow-sm shadow-blue-500/20"
          >
            View Details
            <FaArrowRight className="text-[9px]" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
