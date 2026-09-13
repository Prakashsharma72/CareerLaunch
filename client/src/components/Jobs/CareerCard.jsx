/**
 * CareerCard.jsx — Jobs page card for companies with verified career pages
 */
import { memo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt, FaGlobe, FaBookmark, FaExternalLinkAlt, FaBriefcase,
} from "react-icons/fa";
import AvatarIcon from "../common/AvatarIcon";

const GRADS = [
  ["#3b82f6", "#6366f1"], ["#8b5cf6", "#a855f7"], ["#10b981", "#14b8a6"],
  ["#f43f5e", "#ec4899"], ["#f59e0b", "#f97316"], ["#06b6d4", "#0ea5e9"],
];
const grad = (s = "") => GRADS[(s.charCodeAt(0) || 0) % GRADS.length];

function shortenUrl(url = "") {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function CareerCard({ company, isSaved = false, onSave }) {
  const [saving, setSaving] = useState(false);

  const {
    companyName, website, careerUrl, careerVerified, mapsUrl,
    address, distance,
  } = company;

  const [g1, g2] = grad(companyName);

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
      className="flex flex-col h-full bg-[var(--cl-surface)]
        border border-[var(--cl-border)] rounded-2xl
        shadow-sm hover:shadow-[var(--cl-shadow)] overflow-hidden transition-shadow duration-300"
    >
      <div className="h-1.5 w-full shrink-0"
        style={{ background: `linear-gradient(90deg,${g1},${g2})` }} />

      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <AvatarIcon
            name={companyName}
            size={44}
            className="rounded-xl shadow-md shrink-0"
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[var(--cl-text)] text-sm sm:text-[15px]
              leading-tight truncate" title={companyName}>
              {companyName}
            </h3>
            <p className="mt-1 text-[11px] font-semibold text-[var(--cl-success)]
              inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--cl-success)] inline-block" />
              {careerVerified ? "Verified careers page" : website ? "Official website" : "Google Maps listing"}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }}
            disabled={saving}
            onClick={handleSave}
            title={isSaved ? "Remove from saved" : "Save company"}
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all border
              ${isSaved
                ? "bg-[var(--cl-primary)] text-[var(--cl-button-text)] border-[var(--cl-primary)] shadow-md"
                : "bg-[var(--cl-surface-soft)] text-[var(--cl-text-soft)] border-[var(--cl-border)] hover:bg-[var(--cl-primary-soft)] hover:text-[var(--cl-primary)] hover:border-[var(--cl-primary)]"}
              ${saving ? "opacity-50 cursor-wait" : ""}`}
          >
            <FaBookmark className="text-sm" />
          </motion.button>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {distance && (
            <span className="self-start inline-flex items-center gap-1.5 text-xs font-semibold
              px-2.5 py-1 rounded-full
              bg-[var(--cl-primary-soft)] text-[var(--cl-primary)]
              border border-[var(--cl-primary)]/25 whitespace-nowrap">
              <FaMapMarkerAlt className="text-[9px] shrink-0" />{distance}
            </span>
          )}

          {careerUrl && (
            <div className="flex items-start gap-2 min-w-0">
              <FaBriefcase className="shrink-0 mt-0.5 text-[var(--cl-success)] text-xs" />
              <a href={careerUrl} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="truncate text-xs text-[var(--cl-success)]
                  hover:underline font-medium min-w-0"
                title={careerUrl}>
                {shortenUrl(careerUrl)}
              </a>
            </div>
          )}

          {website && !careerUrl && (
            <div className="flex items-center gap-2 min-w-0">
              <FaGlobe className="shrink-0 text-[var(--cl-primary)] text-xs" />
              <a href={website} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="truncate text-xs text-[var(--cl-primary)]
                  hover:underline font-medium min-w-0"
                title={website}>
                {shortenUrl(website)}
              </a>
            </div>
          )}

          {address && (
            <div className="flex items-start gap-2 text-xs sm:text-sm text-[var(--cl-text-muted)] min-w-0">
              <FaMapMarkerAlt className="mt-0.5 shrink-0 text-[var(--cl-primary)] text-xs" />
              <span className="line-clamp-2 leading-snug wrap-break-word">{address}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[var(--cl-border)] mt-auto">
          {(careerUrl || website || mapsUrl) && (
            <a href={careerUrl || website || mapsUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className={`flex-1 flex items-center justify-center gap-1.5
                text-[var(--cl-button-text)] text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors
                ${careerUrl ? "bg-[var(--cl-success)] hover:opacity-90 active:opacity-90" : "bg-[var(--cl-primary)] hover:bg-[var(--cl-primary-strong)] active:bg-[var(--cl-primary-strong)]"}`}>
              <FaExternalLinkAlt className="text-[9px] shrink-0" />
              {careerUrl ? "View Careers" : website ? "Visit Website" : "View on Google Maps"}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(CareerCard);
