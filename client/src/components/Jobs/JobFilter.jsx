/**
 * JobFilter.jsx
 *
 * Props:
 *   onFilter(filters)     — called on any change
 *                           filters: { search, location, jobType, radius, includeRemote }
 *   locationValue         — controlled city value from parent
 *   radiusValue           — controlled radius (km) from parent
 *   includeRemoteValue    — controlled boolean from parent
 */
import { useState, useEffect } from "react";
import { motion }              from "framer-motion";
import {
  FaSearch, FaMapMarkerAlt, FaFilter,
  FaTimes, FaWifi,
} from "react-icons/fa";

const JOB_TYPES     = ["Full Time", "Part Time", "Internship", "Remote", "Contract"];
const RADIUS_OPTIONS = [
  { value: 10,  label: "10 km"  },
  { value: 25,  label: "25 km"  },
  { value: 50,  label: "50 km"  },
  { value: 100, label: "100 km" },
];

export default function JobFilter({
  onFilter,
  locationValue    = "",
  radiusValue      = 25,
  includeRemoteValue = false,
}) {
  const [search,        setSearch]        = useState("");
  const [location,      setLocation]      = useState(locationValue);
  const [jobType,       setJobType]       = useState("");
  const [radius,        setRadius]        = useState(radiusValue);
  const [includeRemote, setIncludeRemote] = useState(includeRemoteValue);

  /* ── Sync controlled values from parent ─────────────────────────────── */
  useEffect(() => {
    if (locationValue !== location) {
      setLocation(locationValue);
      // Immediately fire so the parent's filter runs
      onFilter({ search, location: locationValue, jobType, radius, includeRemote });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationValue]);

  useEffect(() => {
    if (radiusValue !== radius) setRadius(radiusValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusValue]);

  useEffect(() => {
    if (includeRemoteValue !== includeRemote) setIncludeRemote(includeRemoteValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeRemoteValue]);

  /* ── Helper — fire filter with current + overrides ───────────────────── */
  function apply(overrides = {}) {
    onFilter({
      search:        overrides.search        ?? search,
      location:      overrides.location      ?? location,
      jobType:       overrides.jobType       ?? jobType,
      radius:        overrides.radius        ?? radius,
      includeRemote: overrides.includeRemote ?? includeRemote,
    });
  }

  function handleReset() {
    setSearch(""); setLocation(""); setJobType("");
    setRadius(25); setIncludeRemote(false);
    onFilter({ search: "", location: "", jobType: "", radius: 25, includeRemote: false });
  }

  const hasFilters = search || location || jobType || radius !== 25 || includeRemote;

  return (
    <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-gray-200 dark:border-white/8 shadow-sm p-5 md:p-6 space-y-4">

      {/* ── Row 1 — keyword · location · type ─────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-3">

        {/* Keyword search */}
        <div className="relative flex-2">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or company…"
            value={search}
            onChange={e => { setSearch(e.target.value); apply({ search: e.target.value }); }}
            onKeyDown={e => e.key === "Enter" && apply()}
            className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); apply({ search: "" }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 dark:bg-white/15 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition"
            >
              <FaTimes className="text-[9px]" />
            </button>
          )}
        </div>

        {/* Location */}
        <div className="relative flex-1">
          <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
          <input
            type="text"
            placeholder="City"
            value={location}
            onChange={e => { setLocation(e.target.value); apply({ location: e.target.value }); }}
            onKeyDown={e => e.key === "Enter" && apply()}
            className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
          />
          {location && (
            <button
              onClick={() => { setLocation(""); apply({ location: "" }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 dark:bg-white/15 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition"
            >
              <FaTimes className="text-[9px]" />
            </button>
          )}
        </div>

        {/* Job type */}
        <div className="relative flex-1">
          <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
          <select
            value={jobType}
            onChange={e => { setJobType(e.target.value); apply({ jobType: e.target.value }); }}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition cursor-pointer"
          >
            <option value="">All Types</option>
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Reset */}
        {hasFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleReset}
            className="shrink-0 flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-600 dark:text-gray-300 font-semibold text-sm px-5 py-3.5 rounded-xl transition-colors border border-gray-200 dark:border-white/10"
          >
            <FaTimes className="text-xs" /> Reset
          </motion.button>
        )}
      </div>

      {/* ── Row 2 — radius + remote toggle (only visible when location set) */}
      {location && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-wrap items-center gap-3 pt-1"
        >
          {/* Radius label */}
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">
            Search radius:
          </span>

          {/* Radius pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {RADIUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setRadius(opt.value); apply({ radius: opt.value }); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  radius === opt.value
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25"
                    : "bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/15"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-gray-200 dark:bg-white/10 mx-1 shrink-0" />

          {/* Include Remote toggle */}
          <button
            onClick={() => {
              const next = !includeRemote;
              setIncludeRemote(next);
              apply({ includeRemote: next });
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              includeRemote
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/25"
                : "bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/15"
            }`}
          >
            <FaWifi className="text-[10px]" />
            Include Remote
          </button>
        </motion.div>
      )}

      {/* ── Footer hint ───────────────────────────────────────────────── */}
      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
        {location
          ? `Showing jobs within ${radius} km of ${location.split(",")[0]}${includeRemote ? " + remote" : ""}`
          : "Filters apply instantly"
        }
      </p>
    </div>
  );
}
