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

/* ── Helpers ──────────────────────────────────────────────────────────── */
const GRADS = [
  ["#3b82f6","#6366f1"],["#8b5cf6","#a855f7"],["#10b981","#14b8a6"],
  ["#f43f5e","#ec4899"],["#f59e0b","#f97316"],["#06b6d4","#0ea5e9"],
  ["#84cc16","#22c55e"],["#ec4899","#f43f5e"],
];
const grad  = (s="") => GRADS[(s.charCodeAt(0)||0) % GRADS.length];
const inits = (s="") => s.split(" ").slice(0,2).map(w=>w[0]?.toUpperCase()||"").join("");

/* ── Skeleton ─────────────────────────────────────────────────────────── */
function Sk() {
  return (
    <div className="bg-white dark:bg-[#0f1123] border border-gray-200 dark:border-white/8 rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-white/8 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-white/8 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-4/5" />
      <div className="h-3 bg-gray-200 dark:bg-white/8 rounded w-3/5" />
      <div className="flex gap-2 border-t border-gray-100 dark:border-white/6 pt-3">
        <div className="h-8 flex-1 bg-gray-200 dark:bg-white/8 rounded-xl" />
        <div className="h-8 flex-1 bg-gray-200 dark:bg-white/8 rounded-xl" />
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
      className="flex flex-col bg-white dark:bg-[#0f1123] border border-gray-200 dark:border-white/8 rounded-2xl shadow-sm hover:shadow-lg overflow-hidden transition-shadow"
    >
      <div className="h-1.5" style={{ background: `linear-gradient(90deg,${g1},${g2})` }} />

      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {company.logo ? (
            <img src={company.logo} alt={company.companyName} loading="lazy"
              onError={e => { e.currentTarget.style.display = "none"; }}
              className="w-12 h-12 rounded-xl object-contain border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-1 shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-white font-extrabold text-base shadow-md"
              style={{ background: `linear-gradient(135deg,${g1},${g2})` }}>
              {inits(company.companyName)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-[15px] leading-tight truncate">
              {company.companyName}
            </h3>
            {company.rating && (
              <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mt-1">
                <FaStar className="text-[10px]" />{Number(company.rating).toFixed(1)}
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
            onClick={() => onRemove(company.savedId)}
            disabled={removing}
            title="Remove bookmark"
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-900/15 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-40 transition-all"
          >
            {removing ? <FaSyncAlt className="animate-spin text-xs" /> : <FaTrash className="text-xs" />}
          </motion.button>
        </div>

        {/* Info */}
        <div className="space-y-2 flex-1">
          {company.industry && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FaIndustry className="text-indigo-400 shrink-0" />
              <span className="capitalize">{company.industry}</span>
            </div>
          )}
          {company.address && (
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FaMapMarkerAlt className="text-blue-500 text-xs mt-0.5 shrink-0" />
              <span className="line-clamp-2 leading-snug text-xs">{company.address}</span>
            </div>
          )}
          {!company.address && company.city && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FaMapMarkerAlt className="text-blue-500 shrink-0" />{company.city}
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2 min-w-0">
              <FaGlobe className="text-violet-500 text-xs shrink-0" />
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="truncate text-violet-600 dark:text-violet-400 hover:underline text-xs font-medium">
                {company.website.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FaPhone className="text-emerald-500 shrink-0" />
              <a href={`tel:${company.phone}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                {company.phone}
              </a>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-white/6">
          {company.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer"
              className="flex-1 min-w-0 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              <FaExternalLinkAlt className="text-[9px]" /> Website
            </a>
          )}
          {company.mapsUrl && (
            <a href={company.mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 min-w-0 flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              Maps
            </a>
          )}
          {company.careerPage && (
            <a href={company.careerPage} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors">
              <FaBriefcase className="text-[9px]" /> Careers
            </a>
          )}
          {!company.website && !company.mapsUrl && (
            <span className="w-full text-center text-xs text-gray-400 py-1">No links saved</span>
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

  useEffect(() => { load(); }, [load]);

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
    <div className="min-h-full bg-slate-50 dark:bg-[#080810] p-6 md:p-8 space-y-7">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Saved Companies</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Companies you bookmarked for later review</p>
        </div>
        {!loading && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto bg-blue-50 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/30">
            <FaBookmark className="text-[10px]" />{companies.length} saved
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-[#0f1123] border border-gray-200 dark:border-white/8 rounded-2xl shadow-sm p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
          <FaBookmark className="text-xl text-blue-500" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Saved</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{loading ? "—" : companies.length}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-500/25 text-sm text-red-600 dark:text-red-400 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={load} className="text-xs font-semibold underline shrink-0">Retry</button>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading && Array.from({ length: 6 }).map((_, i) => <Sk key={i} />)}

        {!loading && companies.length === 0 && !error && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center justify-center bg-white dark:bg-[#0f1123] border border-gray-100 dark:border-white/8 rounded-2xl p-14 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <FaBuilding className="text-3xl text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No saved companies yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm">
                Go to{" "}
                <Link to="/student/companies" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
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
  );
}
