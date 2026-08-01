import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaStar,
  FaMapMarkerAlt,
  FaGlobe,
  FaPhone,
  FaBookmark,
  FaExternalLinkAlt,
  FaMapMarkedAlt,
  FaBriefcase,
} from "react-icons/fa";

/* ── Avatar helpers ─────────────────────────────────────────────────────── */
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

/* ── Star rating ─────────────────────────────────────────────────────────── */
function Stars({ rating }) {
  if (!rating) return <span className="text-xs text-gray-400">No rating</span>;
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: full  }).map((_, i) => <FaStar key={`f${i}`} className="text-amber-400 text-xs" />)}
      {half && <FaStar className="text-amber-300/60 text-xs" />}
      {Array.from({ length: empty }).map((_, i) => <FaStar key={`e${i}`} className="text-gray-200 dark:text-white/10 text-xs" />)}
      <span className="ml-1 text-xs font-bold text-gray-700 dark:text-gray-200">{rating.toFixed(1)}</span>
    </span>
  );
}

/* ── Card ────────────────────────────────────────────────────────────────── */
export default function CompanyCard({ company, isSaved = false, onSave, onRemove }) {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(isSaved);

  const { id, savedId, companyName, website, address, phone, rating, mapsUrl, businessStatus, careerPage } = company;
  const [g1, g2] = avatarGradient(companyName);
  const isOpen = businessStatus === "OPERATIONAL";
  const canSave = id != null; // only saveable if it has a DB record

  async function toggleSave() {
    if (saving) return;
    setSaving(true);
    try {
      if (saved) {
        await onRemove?.(savedId ?? id);
        setSaved(false);
      } else {
        await onSave?.(id);
        setSaved(true);
      }
    } catch {
      // revert optimistic state on failure — do nothing extra
    } finally {
      setSaving(false);
    }
  }

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
      {/* ── Coloured top bar ────────────────────────────────────── */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${g1}, ${g2})` }} />

      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* ── Header row ──────────────────────────────────────── */}
        <div className="flex items-start gap-3">

          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center
              text-white font-extrabold text-base select-none shadow-md"
            style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
          >
            {initials(companyName)}
          </div>

          {/* Name + rating + status */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-[15px] leading-tight truncate">
              {companyName}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Stars rating={rating} />
              {businessStatus && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                  ${isOpen
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-gray-100 text-gray-500 dark:bg-white/8 dark:text-gray-400"}`}>
                  {isOpen ? "● Open" : "● Closed"}
                </span>
              )}
            </div>
          </div>

          {/* Bookmark */}
          {canSave && (
            <motion.button
              whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
              disabled={saving}
              onClick={toggleSave}
              title={saved ? "Remove from saved" : "Save company"}
              className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all
                ${saved
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "bg-gray-100 dark:bg-white/8 text-gray-400 dark:text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"}
                ${saving ? "opacity-50 cursor-wait" : ""}`}
            >
              <FaBookmark className="text-sm" />
            </motion.button>
          )}
        </div>

        {/* ── Info rows ───────────────────────────────────────── */}
        <div className="space-y-2.5 flex-1">
          {address && (
            <div className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
              <FaMapMarkerAlt className="mt-0.5 shrink-0 text-blue-500 text-xs" />
              <span className="line-clamp-2 leading-snug">{address}</span>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400 min-w-0">
              <FaGlobe className="shrink-0 text-violet-500 text-xs" />
              <a href={website} target="_blank" rel="noopener noreferrer"
                className="truncate text-violet-600 dark:text-violet-400 hover:underline text-xs font-medium">
                {website.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
              <FaPhone className="shrink-0 text-emerald-500 text-xs" />
              <a href={`tel:${phone}`}
                className="text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {phone}
              </a>
            </div>
          )}
        </div>

        {/* ── Action buttons ──────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-white/6">

          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer"
              className="flex-1 min-w-0 flex items-center justify-center gap-1.5
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              <FaExternalLinkAlt className="text-[9px]" />
              Website
            </a>
          )}

          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 min-w-0 flex items-center justify-center gap-1.5
                bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/15
                text-gray-700 dark:text-gray-300 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              <FaMapMarkedAlt className="text-[9px]" />
              Maps
            </a>
          )}

          {careerPage && (
            <a href={careerPage} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5
                bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors">
              <FaBriefcase className="text-[9px]" />
              Apply Now — Careers Page
            </a>
          )}

          {/* Fallback if no website at all */}
          {!website && !mapsUrl && (
            <span className="w-full text-center text-xs text-gray-400 dark:text-gray-600 py-1">
              No links available
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
