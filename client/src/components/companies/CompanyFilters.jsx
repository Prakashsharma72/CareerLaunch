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
import { useState, useEffect } from "react";
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setKwInput(filters.keyword || "software company"); }, [filters.keyword]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setCityInput(filters.city || ""); }, [filters.city]);

  function submitSearch() {
    const kw   = kwInput.trim()   || "software company";
    const city = cityInput.trim();
    if (!city && !hasGPS) return;
    onFilter({ keyword: kw, city });
    onSearch?.(kw, city);
  }

  function clearCity()    { setCityInput(""); onFilter({ city: "" }); }
  function clearKeyword() { setKwInput(""); onFilter({ keyword: "software company" }); }

  const anyChipActive =
    (filters.minRating > 0) || filters.openNow ||
    (hasGPS && (filters.maxRadius ?? 50) < 50);

  return (
    <div className="bg-[var(--cl-surface)] rounded-2xl border border-[var(--cl-border)] shadow-sm p-4 md:p-5">
      <div className="flex flex-col gap-3">

        {/* ── Search row ─────────────────────────────────────────────────
            Mobile : stacked (3 rows)
            Tablet : keyword + city side-by-side, search button below full-width
            Desktop: all three in one row
        ───────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-2">

          {/* Keyword input */}
          <div className="relative w-full sm:flex-1 lg:flex-2">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--cl-text-soft)] text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="Company type — e.g. software company"
              value={kwInput}
              disabled={loading}
              onChange={e => setKwInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitSearch()}
              className="w-full pl-10 pr-8 py-3 text-sm rounded-xl
                bg-[var(--cl-surface-soft)] border border-[var(--cl-border)]
                text-[var(--cl-text)] placeholder:text-[var(--cl-text-soft)]
                focus:outline-none focus:ring-2 focus:ring-[var(--cl-ring)] focus:border-[var(--cl-primary)]
                disabled:opacity-50 transition"
            />
            {kwInput && kwInput !== "software company" && (
              <button onClick={clearKeyword}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                  bg-[var(--cl-surface-soft)] flex items-center justify-center
                  text-[var(--cl-text-soft)] hover:bg-[var(--cl-border)] transition">
                <FaTimes className="text-[9px]" />
              </button>
            )}
          </div>

          {/* City input */}
          <div className="relative w-full sm:w-44 lg:w-52">
            <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--cl-text-soft)] text-xs pointer-events-none" />
            <input
              type="text"
              placeholder="City — e.g. Pune"
              value={cityInput}
              disabled={loading}
              onChange={e => setCityInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitSearch()}
              className="w-full pl-10 pr-8 py-3 text-sm rounded-xl
                bg-[var(--cl-surface-soft)] border border-[var(--cl-border)]
                text-[var(--cl-text)] placeholder:text-[var(--cl-text-soft)]
                focus:outline-none focus:ring-2 focus:ring-[var(--cl-ring)] focus:border-[var(--cl-primary)]
                disabled:opacity-50 transition"
            />
            {cityInput && (
              <button onClick={clearCity}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                  bg-[var(--cl-surface-soft)] flex items-center justify-center
                  text-[var(--cl-text-soft)] hover:bg-[var(--cl-border)] transition">
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
              bg-[var(--cl-primary)] hover:bg-[var(--cl-primary-strong)] text-[var(--cl-button-text)]
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-sm transition-all">
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
            <span className="text-xs text-[var(--cl-text-muted)] font-medium flex items-center gap-1 shrink-0">
              {hasGPS
                ? <FaLocationArrow className="text-[var(--cl-primary)] text-[9px]" />
                : <FaMapMarkerAlt  className="text-[var(--cl-primary)] text-[9px]" />}
              Radius:
            </span>
            {RADIUS_OPTIONS.map(r => (
              <button key={r}
                disabled={loading}
                onClick={() => onFilter({ maxRadius: r })}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all disabled:opacity-50
                  ${(filters.maxRadius ?? 50) === r
                    ? "bg-[var(--cl-primary)] text-[var(--cl-button-text)] shadow-sm"
                    : "bg-[var(--cl-surface-soft)] text-[var(--cl-text-muted)] border border-[var(--cl-border)] hover:bg-[var(--cl-border)]"}`}>
                {r} km
              </button>
            ))}
          </div>

          {/* Rating label + chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-[var(--cl-text-muted)] font-medium flex items-center gap-1 shrink-0">
              <FaStar className="text-[var(--cl-warning)] text-[9px]" /> Rating:
            </span>
            {RATING_OPTIONS.map(opt => (
              <button key={opt.value}
                disabled={loading}
                onClick={() => onFilter({ minRating: opt.value })}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all disabled:opacity-50
                  ${(filters.minRating ?? 0) === opt.value
                    ? "bg-[var(--cl-warning)] text-[var(--cl-button-text)] shadow-sm"
                    : "bg-[var(--cl-surface-soft)] text-[var(--cl-text-muted)] border border-[var(--cl-border)] hover:bg-[var(--cl-border)]"}`}>
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
                ? "bg-[var(--cl-success)] text-[var(--cl-button-text)] shadow-sm"
                : "bg-[var(--cl-surface-soft)] text-[var(--cl-text-muted)] border border-[var(--cl-border)] hover:bg-[var(--cl-border)]"}`}>
            <FaRegClock className="text-[10px]" /> Open Now
          </button>

          {/* Clear active chips */}
          {anyChipActive && (
            <button
              onClick={() => onFilter({ minRating: 0, openNow: false, maxRadius: 50 })}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                text-[var(--cl-text-muted)] hover:text-[var(--cl-danger)]
                border border-[var(--cl-border)] hover:border-[var(--cl-danger)] transition-colors">
              <FaTimes className="text-[9px]" /> Clear filters
            </button>
          )}
        </div>

        {/* Hint */}
        <p className="text-[11px] text-[var(--cl-text-soft)] flex items-center gap-1.5">
          <FaSlidersH className="text-[10px] shrink-0" />
          Type a company type + city, then press{" "}
          <strong className="font-semibold">Search</strong> · Powered by Google Places
        </p>
      </div>
    </div>
  );
}
