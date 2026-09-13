/**
 * CompanySearch.jsx — Find Companies page
 *
 * 1. On mount: auto-requests browser geolocation.
 * 2. If GPS granted → POST /api/places/nearby, show nearest companies.
 * 3. If GPS denied  → show city input prompt.
 * 4. Filters (search, distance, rating, open-now) apply client-side instantly.
 * 5. Both Jobs and Companies pages share the same Redux store (placesSlice).
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector }                  from "react-redux";
import { motion, AnimatePresence }                   from "framer-motion";
import {
  FaBuilding, FaMapMarkerAlt, FaSearch, FaSyncAlt,
  FaExclamationTriangle, FaLocationArrow,
  FaChevronLeft, FaChevronRight,
} from "react-icons/fa";

import CompanyCard         from "../../components/companies/CompanyCard";
import CompanyCardSkeleton from "../../components/companies/CompanyCardSkeleton";
import CompanyFilters      from "../../components/companies/CompanyFilters";
import usePlaces           from "../../hooks/usePlaces";
import {
  setFilter, setPage, setManualCity,
  setSavedMap, addSaved, removeSaved,
  selectFilteredCompanies,
  selectPagedCompanies,
  selectTotalPages,
} from "../../redux/placesSlice";
import {
  saveCompanyBookmark,
  getSavedCompanies,
  removeSavedCompany,
} from "../../services/companyService";

const PAGE_SIZE = 12;

/* ── Pagination ──────────────────────────────────────────────────── */
function Pagination({ page, totalPages, onChange, canLoadMore = false }) {
  if (totalPages <= 1) return null;
  const pages = totalPages <= 7
    ? Array.from({ length: totalPages }, (_, i) => i + 1)
    : [...new Set(
        [1, totalPages, page - 1, page, page + 1]
          .filter(p => p >= 1 && p <= totalPages)
      )].sort((a, b) => a - b);

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-10 flex-wrap px-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 rounded-xl flex items-center justify-center
          bg-[var(--cl-surface)] border border-[var(--cl-border)]
          text-[var(--cl-text-muted)] disabled:opacity-30
          hover:bg-[var(--cl-surface-soft)] transition-colors">
        <FaChevronLeft className="text-xs" />
      </button>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5 sm:gap-2">
          {pages[i - 1] && p - pages[i - 1] > 1 && (
            <span className="text-[var(--cl-text-soft)] text-sm">…</span>
          )}
          <button
            onClick={() => onChange(p)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
              p === page
                ? "bg-[var(--cl-primary)] text-[var(--cl-button-text)] shadow-lg scale-105"
                : "bg-[var(--cl-surface)] border border-[var(--cl-border)] text-[var(--cl-text-muted)] hover:bg-[var(--cl-surface-soft)]"
            }`}>
            {p}
          </button>
        </span>
      ))}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages && !canLoadMore}
        className="w-9 h-9 rounded-xl flex items-center justify-center
          bg-[var(--cl-surface)] border border-[var(--cl-border)]
          text-[var(--cl-text-muted)] disabled:opacity-30
          hover:bg-[var(--cl-surface-soft)] transition-colors">
        <FaChevronRight className="text-xs" />
      </button>
    </div>
  );
}

/* ── Location prompt ─────────────────────────────────────────────── */
function LocationPrompt({ onRequestGPS, onCitySubmit }) {
  const [city, setCity] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full bg-[var(--cl-surface)]
        border border-[var(--cl-border)] rounded-2xl
        p-8 sm:p-12 md:p-16 flex flex-col items-center text-center gap-5">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--cl-primary-soft)]
        flex items-center justify-center shrink-0">
        <FaMapMarkerAlt className="text-2xl sm:text-3xl text-[var(--cl-primary)]" />
      </div>
      <div className="max-w-sm">
        <h3 className="text-lg sm:text-xl font-bold text-[var(--cl-text)] mb-2">
          Allow location or enter a city
        </h3>
        <p className="text-[var(--cl-text-muted)] text-sm">
          We need your location to find nearby software companies using Google Maps.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          onClick={onRequestGPS}
          className="flex-1 flex items-center justify-center gap-2
            bg-[var(--cl-primary)] hover:bg-[var(--cl-primary-strong)] text-[var(--cl-button-text)] font-semibold text-sm
            px-5 py-3 rounded-xl transition-colors shadow-md">
          <FaLocationArrow className="text-xs shrink-0" /> Use My Location
        </button>
        <span className="self-center text-[var(--cl-text-soft)] text-sm hidden sm:block">or</span>
        <form
          className="flex-1 flex gap-2"
          onSubmit={e => { e.preventDefault(); city.trim() && onCitySubmit(city.trim()); }}>
          <input
            type="text"
            placeholder="Enter city…"
            value={city}
            onChange={e => setCity(e.target.value)}
            className="flex-1 min-w-0 px-4 py-3 text-sm rounded-xl
              border border-[var(--cl-border)]
              bg-[var(--cl-surface-soft)] text-[var(--cl-text)] placeholder:text-[var(--cl-text-soft)]
              focus:outline-none focus:ring-2 focus:ring-[var(--cl-ring)] focus:border-[var(--cl-primary)] transition" />
          <button
            type="submit"
            disabled={!city.trim()}
            className="shrink-0 px-4 py-3 bg-[var(--cl-text)] text-[var(--cl-button-text)]
              font-semibold text-sm rounded-xl disabled:opacity-40 transition-colors">
            <FaSearch />
          </button>
        </form>
      </div>
    </motion.div>
  );
}

/* ── Error card ──────────────────────────────────────────────────── */
function normalizeError(error) {
  const getText = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.trim();
    if (value instanceof Error) return value.message?.trim() || "";
    if (Array.isArray(value)) return value.filter(Boolean).join(" ");
    return String(value).trim();
  };

  const defaultReason = "We couldn’t load companies right now. Please check your connection and try again.";
  const defaultHint = "If this keeps happening, try a different city or refresh the page.";

  if (!error) return { reason: defaultReason, hint: defaultHint };

  const reasonSource =
    (typeof error === "object" && (error.reason || error.message || error.error || error.detail)) ||
    error;

  let reason = getText(reasonSource);
  let hint = getText(typeof error === "object" ? error.hint : "");

  if (!reason) reason = defaultReason;

  if (/network error|failed to fetch|fetch failed/i.test(reason)) {
    reason = "We couldn’t reach the company search service. Please check your internet connection and try again.";
  } else if (/request to this api.*blocked|access-control-allow-origin|cors/i.test(reason)) {
    reason = "The company search is temporarily unavailable in this browser. Please try again in a moment.";
  } else if (/google maps api key|api key.*invalid|quota|daily search quota/i.test(reason)) {
    reason = "The company search service is currently unavailable. Please try again later.";
  }

  if (!hint) hint = defaultHint;

  return { reason, hint };
}

function ErrorCard({ error, onRetry }) {
  const { reason, hint } = normalizeError(error);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className="col-span-full flex flex-col items-center bg-[var(--cl-danger-soft)]
        border border-[var(--cl-danger)]/25 rounded-2xl
        p-8 sm:p-12 text-center gap-4">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--cl-danger-soft)]
        flex items-center justify-center shrink-0">
        <FaExclamationTriangle className="text-xl sm:text-2xl text-[var(--cl-danger)]" />
      </div>
      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base sm:text-lg font-bold text-[var(--cl-danger)]">
          We couldn’t find companies near you
        </h3>
        <p className="text-sm text-[var(--cl-danger)]">{reason}</p>
        {hint && <p className="text-xs text-[var(--cl-danger)] italic opacity-80">{hint}</p>}
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-2.5 bg-[var(--cl-danger)] hover:opacity-90
          text-[var(--cl-button-text)] text-sm font-semibold rounded-xl transition-colors">
        <FaSyncAlt className="text-xs" /> Try Again
      </button>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function CompanySearch() {
  const dispatch = useDispatch();
  const { requestLocation, fetchByCity, refetch, loadMore } = usePlaces();
  const { isAuthenticated } = useSelector(s => s.auth);

  const location    = useSelector(s => s.places.location);
  const loading     = useSelector(s => s.places.loading);
  const error       = useSelector(s => s.places.error);
  const filters     = useSelector(s => s.places.filters);
  const page        = useSelector(s => s.places.page);
  const source      = useSelector(s => s.places.source);
  const savedMap    = useSelector(s => s.places.savedMap);
  const allFiltered = useSelector(selectFilteredCompanies);
  const paged       = useSelector(selectPagedCompanies);
  const totalPages  = useSelector(selectTotalPages);
  const total       = allFiltered.length;
  const hasMoreBatches = (filters.batchIndex ?? 0) < 3;

  const hasGPS     = location.status === "granted";
  const hasDenied  = location.status === "denied" || location.status === "manual";
  const isIdle     = location.status === "idle";
  const showPrompt = !loading && !error && (isIdle || hasDenied) &&
    allFiltered.length === 0 && source !== "google_places";

  /* ── Auto-request location on mount ── */
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    if (filters.city?.trim()) {
      fetchByCity(filters.city, filters.keyword);
      return;
    }

    requestLocation();
  }, [fetchByCity, filters.city, filters.keyword, requestLocation]);

  /* ── Load saved map ── */
  useEffect(() => {
    if (!isAuthenticated) return;
    getSavedCompanies().then(({ data }) => {
      const map = {};
      for (const c of (data || [])) {
        if (c.externalCompanyId) map[c.externalCompanyId] = c.savedId ?? c.id;
      }
      dispatch(setSavedMap(map));
    }).catch(() => {});
  }, [isAuthenticated, dispatch]);

  /* ── Handlers ── */
  const handleCitySubmit = useCallback((city) => {
    dispatch(setManualCity(city));
    fetchByCity(city);
  }, [dispatch, fetchByCity]);

  const handleSearch = useCallback((keyword, city) => {
    if (city) dispatch(setManualCity(city));
    fetchByCity(city || location.city, keyword);
  }, [dispatch, fetchByCity, location.city]);

  const handleFilter = useCallback((update) => {
    dispatch(setFilter(update));
  }, [dispatch]);

  const handleSave = useCallback(async (company) => {
    if (!isAuthenticated) return;
    const pid = company.placeId;
    if (savedMap[pid]) {
      dispatch(removeSaved(pid));
      try { await removeSavedCompany(savedMap[pid]); }
      catch { dispatch(addSaved({ placeId: pid, savedId: savedMap[pid] })); }
    } else {
      dispatch(addSaved({ placeId: pid, savedId: "tmp" }));
      try {
        const { data } = await saveCompanyBookmark({
          externalCompanyId: pid,
          source:      "google_places",
          companyName: company.companyName,
          logo:        company.logo         || null,
          website:     company.website      || null,
          address:     company.address      || null,
          phone:       company.phone        || null,
          rating:      company.rating       || null,
          mapsUrl:     company.mapsUrl      || null,
          careerPage:  company.careerPage   || null,
          industry:    company.industry     || null,
          city:        company.city || location.city || null,
        });
        dispatch(addSaved({ placeId: pid, savedId: data.savedId ?? data.id }));
      } catch {
        dispatch(removeSaved(pid));
      }
    }
  }, [dispatch, isAuthenticated, savedMap, location.city]);

  const locationLine = filters.city
    ? `Showing companies in ${filters.city}`
    : hasGPS && location.city
    ? `Showing companies near ${location.fullCity || location.city}`
    : location.city
      ? `Showing companies in ${location.city}`
      : "Discover real companies near you";

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="cl-page min-h-full p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--cl-text)] tracking-tight">
            Find Companies
          </h1>
          <p className="text-[var(--cl-text-muted)] mt-1 text-sm flex items-center gap-2 flex-wrap">
            {locationLine}
            {source === "google_places" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold
                px-2 py-0.5 rounded-full
                bg-[var(--cl-primary-soft)] text-[var(--cl-primary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--cl-primary)] animate-pulse inline-block" />
                Google Places
              </span>
            )}
            {source === "database_fallback" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--cl-warning-soft)] text-[var(--cl-warning)]">
                Stored companies • Last updated data
              </span>
            )}
          </p>
        </div>

        {!loading && total > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold
              bg-[var(--cl-primary-soft)] text-[var(--cl-primary)]
              px-3 py-1.5 rounded-full border border-[var(--cl-primary)]/25">
              {total} {total === 1 ? "company" : "companies"}
            </span>
            <button
              onClick={refetch}
              title="Refresh"
              className="w-8 h-8 rounded-xl flex items-center justify-center
                bg-[var(--cl-surface)] border border-[var(--cl-border)]
                text-[var(--cl-text-muted)] hover:bg-[var(--cl-surface-soft)] transition-colors">
              <FaSyncAlt className={`text-xs ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        )}
      </div>

      {/* ── Location requesting banner ────────────────────────── */}
      <AnimatePresence>
        {location.status === "requesting" && (
          <motion.div
            key="req"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-[var(--cl-primary-soft)]
              border border-[var(--cl-primary)]/30 rounded-xl px-4 py-3 text-sm">
            <FaLocationArrow className="text-[var(--cl-primary)] animate-pulse shrink-0" />
            <span className="text-[var(--cl-primary-strong)] font-medium">
              Requesting your location…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filters ──────────────────────────────────────────── */}
      <CompanyFilters
        filters={filters}
        onFilter={handleFilter}
        onSearch={handleSearch}
        hasGPS={hasGPS}
        loading={loading}
      />

      {/* ── Status line ───────────────────────────────────────── */}
      {!loading && !error && total > 0 && (
        <p className="text-sm text-[var(--cl-text-muted)]">
          Showing{" "}
          <strong className="text-[var(--cl-text)]">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
          </strong>{" "}
          of{" "}
          <strong className="text-[var(--cl-text)]">{total}</strong>{" "}
          companies
          {location.city && (
            <> near{" "}
              <strong className="text-[var(--cl-primary)]">{location.city}</strong>
            </>
          )}
        </p>
      )}

      {/* ── Card grid ─────────────────────────────────────────── */}
      {/* Mobile: 1 col | sm-md: 2 cols | lg+: 3 cols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">

        {/* Skeletons */}
        {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <CompanyCardSkeleton key={i} />
        ))}

        {/* Location prompt */}
        {showPrompt && (
          <LocationPrompt
            onRequestGPS={requestLocation}
            onCitySubmit={handleCitySubmit}
          />
        )}

        {/* Error */}
        {!loading && error && (
          <ErrorCard error={error} onRetry={refetch} />
        )}

        {/* Empty state */}
        {!loading && !error && !showPrompt && total === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center
              bg-[var(--cl-surface)] border border-[var(--cl-border)]
              rounded-2xl p-10 sm:p-16 text-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--cl-surface-soft)]
              flex items-center justify-center shrink-0">
              <FaBuilding className="text-xl sm:text-2xl text-[var(--cl-text-soft)]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--cl-text)]">
                {source === "database_fallback" ? "No stored companies matched" : "No companies found"}
              </h3>
              <p className="text-[var(--cl-text-muted)] text-sm mt-1">
                {source === "database_fallback" ? "The live provider is unavailable. Retry to check for live results." : "Try adjusting your filters or expanding the radius."}
              </p>
            </div>
            {source === "database_fallback" ? (
              <button onClick={refetch} className="px-5 py-2.5 text-sm font-semibold bg-[var(--cl-primary)] hover:bg-[var(--cl-primary-strong)] text-[var(--cl-button-text)] rounded-xl transition-colors">Retry</button>
            ) : (
              <button onClick={() => dispatch(setFilter({ minRating: 0, openNow: false, maxRadius: 50, search: "" }))} className="px-5 py-2.5 text-sm font-semibold bg-[var(--cl-primary)] hover:bg-[var(--cl-primary-strong)] text-[var(--cl-button-text)] rounded-xl transition-colors">Clear Filters</button>
            )}
          </motion.div>
        )}

        {/* Company cards */}
        {!loading && !error && paged.map(company => (
          <CompanyCard
            key={company.placeId}
            company={company}
            isSaved={!!savedMap[company.placeId]}
            onSave={handleSave}
          />
        ))}
      </div>

      {/* ── Pagination ────────────────────────────────────────── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        canLoadMore={hasMoreBatches}
        onChange={p => {
          if (p > totalPages && hasMoreBatches) loadMore();
          else dispatch(setPage(p));
        }}
      />
    </div>
  );
}
