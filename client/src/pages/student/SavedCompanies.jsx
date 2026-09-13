/**
 * SavedCompanies.jsx
 * Reads ONLY from MySQL saved_companies (user bookmarks).
 * All company data was stored inline at save time — no API calls.
 */
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBookmark, FaBuilding, FaMapMarkerAlt, FaGlobe,
  FaPhone, FaStar, FaTrash, FaSyncAlt, FaExternalLinkAlt,
  FaBriefcase, FaIndustry,
} from "react-icons/fa";
import { getSavedCompanies, removeSavedCompany } from "../../services/companyService";
import AvatarIcon from "../../components/common/AvatarIcon";

/* ── Helpers ──────────────────────────────────────────────────────────── */
const GRADS = [
  ["#3b82f6","#6366f1"],["#8b5cf6","#a855f7"],["#10b981","#14b8a6"],
  ["#f43f5e","#ec4899"],["#f59e0b","#f97316"],["#06b6d4","#0ea5e9"],
  ["#84cc16","#22c55e"],["#ec4899","#f43f5e"],
];
const grad  = (s="") => GRADS[(s.charCodeAt(0)||0) % GRADS.length];

/* ── Skeleton ─────────────────────────────────────────────────────────── */
function Sk() {
  return (
    <div className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-5 space-y-4 animate-pulse shadow-[var(--cl-shadow)]">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--cl-surface-soft)] shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[var(--cl-surface-soft)] rounded w-3/4" />
          <div className="h-3 bg-[var(--cl-surface-soft)] rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-[var(--cl-surface-soft)] rounded w-4/5" />
      <div className="h-3 bg-[var(--cl-surface-soft)] rounded w-3/5" />
      <div className="flex gap-2 border-t border-[var(--cl-border)] pt-3">
        <div className="h-8 flex-1 bg-[var(--cl-surface-soft)] rounded-xl" />
        <div className="h-8 flex-1 bg-[var(--cl-surface-soft)] rounded-xl" />
      </div>
    </div>
  );
}

/* ── Saved Company Card ───────────────────────────────────────────────── */
function SavedCompanyCard({ company, onRemove, removing }) {
  const [g1, g2] = grad(company.companyName);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.22 }}
      className="flex min-h-[318px] flex-col overflow-hidden rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] shadow-[var(--cl-shadow)] transition-shadow hover:shadow-lg"
    >
      <div className="h-1.5" style={{ background: `linear-gradient(90deg,${g1},${g2})` }} />

      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="flex items-start gap-3">
          <AvatarIcon
            name={company.companyName}
            size={48}
            className="rounded-xl shadow-md shrink-0"
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[var(--cl-text)] text-[15px] leading-tight truncate">
              {company.companyName}
            </h3>
            {company.rating && (
              <div className="mt-1 flex items-center gap-1 text-[var(--cl-warning)] text-xs font-semibold">
                <FaStar className="text-[10px]" />{Number(company.rating).toFixed(1)}
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
            onClick={() => onRemove(company.savedId)}
            disabled={removing}
            title="Remove bookmark"
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--cl-danger-soft)] text-[var(--cl-danger)] hover:bg-[var(--cl-danger-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cl-focus)] disabled:opacity-40 transition-all"
          >
            {removing ? <FaSyncAlt className="animate-spin text-xs" /> : <FaTrash className="text-xs" />}
          </motion.button>
        </div>

        <div className="space-y-2 flex-1">
          {company.industry && (
            <div className="flex items-center gap-2 text-xs text-[var(--cl-text-muted)]">
              <FaIndustry className="text-indigo-400 shrink-0" />
              <span className="capitalize">{company.industry}</span>
            </div>
          )}
          {company.address && (
            <div className="flex items-start gap-2 text-sm text-[var(--cl-text-muted)]">
              <FaMapMarkerAlt className="text-blue-500 text-xs mt-0.5 shrink-0" />
              <span className="line-clamp-2 leading-snug text-xs">{company.address}</span>
            </div>
          )}
          {!company.address && company.city && (
            <div className="flex items-center gap-2 text-xs text-[var(--cl-text-muted)]">
              <FaMapMarkerAlt className="text-blue-500 shrink-0" />{company.city}
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2 min-w-0">
              <FaGlobe className="text-violet-500 text-xs shrink-0" />
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="truncate text-[var(--cl-primary)] hover:underline text-xs font-medium">
                {company.website.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-2 text-xs text-[var(--cl-text-muted)]">
              <FaPhone className="text-emerald-500 shrink-0" />
              <a href={`tel:${company.phone}`} className="text-[var(--cl-text)] hover:text-[var(--cl-primary)]">
                {company.phone}
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--cl-border)]">
          {company.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer"
              className="flex-1 min-w-0 flex items-center justify-center gap-1.5 bg-[var(--cl-primary)] hover:bg-[var(--cl-primary-strong)] text-[var(--cl-button-text)] text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              <FaExternalLinkAlt className="text-[9px]" /> Website
            </a>
          )}
          {company.mapsUrl && (
            <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 min-w-0 flex items-center justify-center gap-1.5 border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] hover:bg-[var(--cl-surface-elevated)] text-[var(--cl-text)] text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              Maps
            </a>
          )}
          {company.careerPage && (
            <a href={company.careerPage} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 bg-[var(--cl-success)] hover:bg-[var(--cl-success)] text-[var(--cl-button-text)] text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors">
              <FaBriefcase className="text-[9px]" /> Careers
            </a>
          )}
          {!company.website && !company.mapsUrl && (
            <span className="w-full text-center text-xs text-[var(--cl-text-soft)] py-1">No links saved</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────── */
export default function SavedCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [removing,  setRemoving]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await getSavedCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load saved companies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleRemove = async (savedId) => {
    setRemoving(savedId);
    try {
      await removeSavedCompany(savedId);
      setCompanies(prev => prev.filter(c => c.savedId !== savedId));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to remove company");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="cl-page min-h-full px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1250px] space-y-7">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--cl-text)]">Saved Companies</h1>
          <p className="mt-1 text-sm text-[var(--cl-text-muted)]">Companies you bookmarked for later review</p>
        </div>
        {!loading && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto bg-[var(--cl-primary-soft)] text-[var(--cl-primary)] px-3 py-1.5 rounded-full border border-[var(--cl-border)]">
            <FaBookmark className="text-[10px]" />{companies.length} saved
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-6 shadow-[var(--cl-shadow)]">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--cl-primary-soft)]">
          <FaBookmark className="text-xl text-[var(--cl-primary)]" />
        </div>
        <div>
          <p className="text-sm text-[var(--cl-text-muted)]">Total Saved</p>
          <p className="text-3xl font-bold text-[var(--cl-text)]">{loading ? "—" : companies.length}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[var(--cl-danger-soft)] border border-[var(--cl-border)] text-sm text-[var(--cl-danger)] flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={load} className="text-xs font-semibold underline shrink-0">Retry</button>
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, i) => <Sk key={i} />)}

        {!loading && companies.length === 0 && !error && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-14 text-center gap-4 shadow-[var(--cl-shadow)]">
            <div className="w-16 h-16 rounded-2xl bg-[var(--cl-primary-soft)] flex items-center justify-center">
              <FaBuilding className="text-3xl text-[var(--cl-primary)]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--cl-text)] mb-2">No saved companies yet</h3>
              <p className="text-[var(--cl-text-muted)] max-w-sm text-sm">
                Go to{" "}
                <Link to="/student/companies" className="text-[var(--cl-primary)] hover:underline font-medium">
                  Find Companies
                </Link>
                {" "}and click the bookmark icon on any card.
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {!loading && companies.map(company => (
            <SavedCompanyCard
              key={company.savedId}
              company={company}
              onRemove={handleRemove}
              removing={removing === company.savedId}
            />
          ))}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
