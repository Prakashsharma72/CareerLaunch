/**
 * CompanyCard.jsx — Google Places company card
 *
 * Fully responsive — equal-height flex column, truncated text,
 * wrapping badges, touch-friendly buttons.
 */
import { useState } from "react";
import { Link }     from "react-router-dom";
import { motion }   from "framer-motion";
import {
  FaStar, FaMapMarkerAlt, FaGlobe, FaPhone,
  FaBookmark, FaExternalLinkAlt, FaMapMarkedAlt,
  FaBriefcase, FaChevronRight, FaRegClock,
} from "react-icons/fa";
import AvatarIcon from "../common/AvatarIcon";

/* ── Avatar gradient pool (kept for accent bar) ───────────────────── */
const GRADS = [
  ["#3b82f6","#6366f1"], ["#8b5cf6","#a855f7"], ["#10b981","#14b8a6"],
  ["#f43f5e","#ec4899"], ["#f59e0b","#f97316"], ["#06b6d4","#0ea5e9"],
  ["#84cc16","#22c55e"], ["#ec4899","#f43f5e"],
];
const grad = (s = "") => GRADS[(s.charCodeAt(0) || 0) % GRADS.length];

/* ── Stars ────────────────────────────────────────────────────────── */
function Stars({ rating, count }) {
  if (!rating) return (
    <span className="text-xs text-gray-400 dark:text-gray-600">No rating</span>
  );
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="flex items-center gap-0.5 flex-wrap">
      {Array.from({ length: full  }).map((_, i) => (
        <FaStar key={`f${i}`} className="text-amber-400 text-xs shrink-0" />
      ))}
      {half  && <FaStar className="text-amber-300/70 text-xs shrink-0" />}
      {Array.from({ length: empty }).map((_, i) => (
        <FaStar key={`e${i}`} className="text-gray-200 dark:text-white/10 text-xs shrink-0" />
      ))}
      <span className="ml-1 text-xs font-bold text-gray-700 dark:text-gray-200">{rating.toFixed(1)}</span>
      {count && (
        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
          ({count.toLocaleString()})
        </span>
      )}
    </span>
  );
}

/* ── Card ─────────────────────────────────────────────────────────── */
export default function CompanyCard({ company, isSaved = false, onSave }) {
  const [saving, setSaving] = useState(false);

  const {
    placeId, companyName, logo, website, address, phone,
    rating, reviewCount, mapsUrl, businessStatus, isOpenNow,
    careerPage, industry, distanceText,
  } = company;

  const [g1, g2] = grad(companyName);
  const isOpen   = isOpenNow === true  || businessStatus === "OPERATIONAL";
  const isClosed = isOpenNow === false;

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try { await onSave?.(company); }
    finally { setSaving(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      transition={{ duration: 0.22 }}
      className="flex flex-col h-full bg-white dark:bg-[#0f1123]
        border border-gray-200 dark:border-white/8 rounded-2xl
        shadow-sm hover:shadow-xl hover:shadow-black/8 dark:hover:shadow-black/40
        overflow-hidden transition-shadow duration-300"
    >
      {/* Colour accent bar */}
      <div className="h-1.5 w-full shrink-0"
        style={{ background: `linear-gradient(90deg,${g1},${g2})` }} />

      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-start gap-3">

          {/* Logo / avatar — always use generated icon */}
          <AvatarIcon
            name={companyName}
            size={44}
            className="rounded-xl shadow-md shrink-0"
          />

          {/* Name + rating + status */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-[15px]
              leading-tight truncate" title={companyName}>
              {companyName}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Stars rating={rating} count={reviewCount} />
              {isOpen && !isClosed ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold
                  px-2 py-0.5 rounded-full shrink-0
                  bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Open
                </span>
              ) : isClosed ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold
                  px-2 py-0.5 rounded-full shrink-0
                  bg-gray-100 text-gray-500 dark:bg-white/8 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                  Closed
                </span>
              ) : null}
            </div>
          </div>

          {/* Bookmark */}
          <motion.button
            whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
            disabled={saving}
            onClick={handleSave}
            title={isSaved ? "Remove from saved" : "Save company"}
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all
              ${isSaved
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : "bg-gray-100 dark:bg-white/8 text-gray-400 dark:text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"}
              ${saving ? "opacity-50 cursor-wait" : ""}`}
          >
            <FaBookmark className="text-sm" />
          </motion.button>
        </div>

        {/* ── Info rows ──────────────────────────────────────── */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">

          {/* Distance badge */}
          {distanceText && (
            <span className="self-start inline-flex items-center gap-1.5 text-xs font-semibold
              px-2.5 py-1 rounded-full
              bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-400
              border border-blue-200 dark:border-blue-500/30 whitespace-nowrap">
              <FaMapMarkerAlt className="text-[9px] shrink-0" />{distanceText}
            </span>
          )}

          {/* Industry */}
          {industry && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 min-w-0">
              <FaBriefcase className="shrink-0 text-indigo-400 text-[10px]" />
              <span className="capitalize truncate">{industry}</span>
            </div>
          )}

          {/* Address */}
          {address && (
            <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 min-w-0">
              <FaMapMarkerAlt className="mt-0.5 shrink-0 text-blue-500 text-xs" />
              <span className="line-clamp-2 leading-snug wrap-break-word">{address}</span>
            </div>
          )}

          {/* Website */}
          {website && (
            <div className="flex items-center gap-2 min-w-0">
              <FaGlobe className="shrink-0 text-violet-500 text-xs" />
              <a href={website} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="truncate text-xs text-violet-600 dark:text-violet-400
                  hover:underline font-medium min-w-0">
                {website.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </div>
          )}

          {/* Phone */}
          {phone && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 min-w-0">
              <FaPhone className="shrink-0 text-emerald-500 text-[10px]" />
              <a href={`tel:${phone}`} onClick={e => e.stopPropagation()}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate">
                {phone}
              </a>
            </div>
          )}

          {/* Opening hours */}
          {company.openingHours?.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-gray-400 dark:text-gray-500 min-w-0">
              <FaRegClock className="shrink-0 mt-0.5 text-[10px]" />
              <span className="line-clamp-1 wrap-break-word">{company.openingHours[0]}</span>
            </div>
          )}
        </div>

        {/* ── Action buttons ─────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-white/6 mt-auto">

          {/* View Details — always stretches to fill */}
          <Link
            to={`/student/companies/${encodeURIComponent(placeId)}`}
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5
              bg-blue-600 hover:bg-blue-700 active:bg-blue-800
              text-white text-xs font-semibold px-3 py-2.5 rounded-xl
              transition-colors shadow-sm shadow-blue-500/20 whitespace-nowrap">
            View Details <FaChevronRight className="text-[9px] shrink-0" />
          </Link>

          {/* Google Maps */}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              title="Open in Google Maps"
              className="flex items-center justify-center gap-1.5 shrink-0
                bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/15
                text-gray-700 dark:text-gray-300 text-xs font-semibold
                px-3 py-2.5 rounded-xl transition-colors border border-gray-200 dark:border-white/10
                whitespace-nowrap">
              <FaMapMarkedAlt className="text-xs shrink-0" /> Maps
            </a>
          )}

          {/* Careers page — spans full width when present */}
          {careerPage && (
            <a href={careerPage} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="w-full flex items-center justify-center gap-1.5
                bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
                text-white text-xs font-semibold px-3 py-2.5 rounded-xl
                transition-colors shadow-sm shadow-emerald-500/20 whitespace-nowrap">
              <FaBriefcase className="text-[9px] shrink-0" /> Careers
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
