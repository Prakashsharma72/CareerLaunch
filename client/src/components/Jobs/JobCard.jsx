import { memo } from "react";
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
import AvatarIcon from "../common/AvatarIcon";

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

const JOB_TYPE_COLORS = {
  "full time":  "bg-[var(--cl-primary-soft)] text-[var(--cl-primary)] border-[var(--cl-primary)]/30",
  "part time":  "bg-violet-500/10 text-violet-600 border-violet-500/30 dark:text-violet-300 dark:border-violet-400/40",
  "internship": "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300 dark:border-amber-400/40",
  "remote":     "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300 dark:border-emerald-400/40",
  "contract":   "bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-300 dark:border-orange-400/40",
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
function JobCard({ job, isSaved = false, onSaveJob, distanceKm = null }) {
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
  const skills       = Array.isArray(skillsRequired)
    ? skillsRequired
    : String(skillsRequired || "").split(",").map(skill => skill.trim()).filter(Boolean);
  const [g1, g2]     = avatarGradient(company || title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      transition={{ duration: 0.22 }}
      className="flex flex-col bg-[var(--cl-surface)]
        border border-[var(--cl-border)]
        rounded-2xl shadow-[var(--cl-shadow)] hover:shadow-[var(--cl-shadow)]
        overflow-hidden transition-shadow duration-300"
    >
      {/* Coloured top bar */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${g1}, ${g2})` }} />

      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-start gap-3">

          {/* Company avatar */}
          <AvatarIcon
            name={company || title}
            size={44}
            className="rounded-xl shadow-md shrink-0"
          />

          {/* Title + company */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[var(--cl-text)] text-[15px] leading-tight line-clamp-1">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-[var(--cl-text-muted)] text-sm">
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
                ? "bg-[var(--cl-primary)] text-white shadow-md shadow-blue-500/30"
                : "bg-[var(--cl-surface-soft)] text-[var(--cl-text-muted)] hover:bg-[var(--cl-primary-soft)] hover:text-[var(--cl-primary)]"}`}
          >
            <FaBookmark className="text-sm" />
          </motion.button>
        </div>

        {/* ── Meta info ───────────────────────────────────────── */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[var(--cl-text-muted)]">
          {location && (
            <span className="flex items-center gap-1.5">
              <FaMapMarkerAlt className="text-blue-500 text-xs shrink-0" />
              {location}
            </span>
          )}
          {distLabel && (
            <span className="flex items-center gap-1.5 text-[var(--cl-primary)] font-semibold text-xs">
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
                className="text-xs bg-[var(--cl-surface-soft)] text-[var(--cl-text-muted)]
                  border border-[var(--cl-border)] px-2.5 py-0.5 rounded-full">
                {skill}
              </span>
            ))}
            {skills.length > 5 && (
              <span className="text-xs text-[var(--cl-text-soft)] px-1 py-0.5">
                +{skills.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* ── Description ─────────────────────────────────────── */}
        {description && (
          <p className="text-sm text-[var(--cl-text-muted)] line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>
        )}

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--cl-border)]">
          <span className="flex items-center gap-1.5 text-xs text-[var(--cl-text-soft)]">
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
          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold bg-[var(--cl-success)] hover:opacity-90 text-[var(--cl-button-text)] px-4 py-2 rounded-xl transition-colors"
            >
              Apply
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(JobCard);
