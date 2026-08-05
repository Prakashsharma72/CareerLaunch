/**
 * CompanyFilters.jsx — Filter bar for Jobs and Companies pages
 *
 * Responsive layout:
 *   Mobile  (< sm):  all inputs stacked vertically, full-width
 *   Tablet  (sm-md): search + city on one row, search button full-width below
 *   Desktop (lg+):   all three in a single row
 *
 * Chips wrap automatically on all sizes.
 */
import { useState, useEffect, useRef } from "react";
import {
  FaSearch, FaMapMarkerAlt, FaStar, FaRegClock,
  FaTimes, FaSlidersH, FaLocationArrow,
} from "react-icons/fa";

const RADIUS_OPTIONS = [5, 10, 15, 25, 50];
const RATING_OPTIONS = [
  { label: "Any",  value: 0   },
  { label: "3.0+", value: 3.0 },
  { label: "3.5+", value: 3.5 },
  { label: "4.0+", value: 4.0 },
  { label: "4.5+", value: 4.5 },
];

export default function CompanyFilters({
  filters    = {},
  onFilter,
  onSearch,
  hasGPS     = false,
  loading    = false,
}) {
  const [kwInput,   setKwInput]   = useState(filters.keyword || "software company");
  const [cityInput, setCityInput] = useState(filters.city    || "");
  const nameDebounce = useRef(null);

  useEffect(() => { setKwInput(filters.keyword  || "software company"); }, [filters.keyword]);
  useEffect(() => { setCityInput(filters.city   || "");                 }, [filters.city]);

  function submitSearch() {
    const kw   = kwInput.trim()   || "software company";
    const city = cityInput.trim();
    if (!city && !hasGPS) return;
    onFilter({ keyword: kw, city });
    onSearch?.(kw, city);
  }

  function clearCity()    { setCityInput(""); onFilter({ city: "" }); }
  function clearKeyword() { setKwInput(""); onFilter({ keyword: "software company" }); }

  function handleNameFilter(value) {
    clearTimeout(nameDebounce.current);
    nameDebounce.current = setTimeout(() => onFilter({ search: value }), 280);
  }

  const anyChipActive =
    (filters.minRating > 0) || filters.openNow ||
    (hasGPS && (filters.maxRadius ?? 50) < 50);

  return (
    <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-gray-200 dark:border-white/8 shadow-sm p-4 md:p-5">
      <div className="flex flex-col gap-3">

        {/* ── Search row ─────────────────────────────────────────────────
            Mobile : stacked (3 rows)
            Tablet : keyword + city side-by-side, search button below full-width
            Desktop: all three in one row
        ───────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-2">

          {/* Keyword input */}
          <div className="relative w-full sm:flex-1 lg:flex-2">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="Company type — e.g. software company"
              value={kwInput}
              disabled={loading}
              onChange={e => setKwInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitSearch()}
              className="w-full pl-10 pr-8 py-3 text-sm rounded-xl
                bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
                disabled:opacity-50 transition"
            />
            {kwInput && kwInput !== "software company" && (
              <button onClick={clearKeyword}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                  bg-gray-200 dark:bg-white/15 flex items-center justify-center
                  text-gray-500 hover:bg-gray-300 transition">
                <FaTimes className="text-[9px]" />
              </button>
            )}
          </div>

          {/* City input */}
          <div className="relative w-full sm:w-44 lg:w-52">
            <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="City — e.g. Pune"
              value={cityInput}
              disabled={loading}
              onChange={e => setCityInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitSearch()}
              className="w-full pl-10 pr-8 py-3 text-sm rounded-xl
                bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
                disabled:opacity-50 transition"
            />
            {cityInput && (
              <button onClick={clearCity}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                  bg-gray-200 dark:bg-white/15 flex items-center justify-center
                  text-gray-500 hover:bg-gray-300 transition">
                <FaTimes className="text-[9px]" />
              </button>
            )}
          </div>

          {/* Search button — full-width on mobile, auto on sm+ */}
          <button
            onClick={submitSearch}
            disabled={loading || (!cityInput.trim() && !hasGPS)}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2
              px-5 py-3 rounded-xl text-sm font-semibold
              bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-sm shadow-blue-500/20 transition-all">
            {loading
              ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <FaSearch className="text-xs" />}
            <span>Search</span>
          </button>
        </div>

        {/* ── Filter chips ────────────────────────────────────────────────
            Wrap automatically on all screen sizes — no overflow.
        ───────────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">

          {/* Radius label + chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 shrink-0">
              {hasGPS
                ? <FaLocationArrow className="text-blue-500 text-[9px]" />
                : <FaMapMarkerAlt  className="text-blue-500 text-[9px]" />}
              Radius:
            </span>
            {RADIUS_OPTIONS.map(r => (
              <button key={r}
                disabled={loading}
                onClick={() => onFilter({ maxRadius: r })}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all disabled:opacity-50
                  ${(filters.maxRadius ?? 50) === r
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15"}`}>
                {r} km
              </button>
            ))}
          </div>

          {/* Rating label + chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 shrink-0">
              <FaStar className="text-amber-400 text-[9px]" /> Rating:
            </span>
            {RATING_OPTIONS.map(opt => (
              <button key={opt.value}
                disabled={loading}
                onClick={() => onFilter({ minRating: opt.value })}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all disabled:opacity-50
                  ${(filters.minRating ?? 0) === opt.value
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15"}`}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Open Now */}
          <button
            disabled={loading}
            onClick={() => onFilter({ openNow: !filters.openNow })}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all disabled:opacity-50
              ${filters.openNow
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15"}`}>
            <FaRegClock className="text-[10px]" /> Open Now
          </button>

          {/* Clear active chips */}
          {anyChipActive && (
            <button
              onClick={() => onFilter({ minRating: 0, openNow: false, maxRadius: 50 })}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400
                border border-gray-200 dark:border-white/10 hover:border-red-300 transition-colors">
              <FaTimes className="text-[9px]" /> Clear filters
            </button>
          )}
        </div>

        {/* Hint */}
        <p className="text-[11px] text-gray-400 dark:text-gray-600 flex items-center gap-1.5">
          <FaSlidersH className="text-[10px] shrink-0" />
          Type a company type + city, then press{" "}
          <strong className="font-semibold">Search</strong> · Powered by Google Places
        </p>
      </div>
    </div>
  );
}
