/**
 * Jobs.jsx — Find Jobs page
 *
 * Shows only nearby software companies with a verified careers/jobs page
 * on their official website. Data from GET /api/company-careers.
 */
import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector }                  from "react-redux";
import { motion, AnimatePresence }                   from "framer-motion";
import {
  FaBriefcase, FaSyncAlt, FaMapMarkerAlt,
  FaLocationArrow, FaExclamationTriangle,
  FaSearch, FaChevronLeft, FaChevronRight,
} from "react-icons/fa";

import CareerCard         from "../../components/Jobs/CareerCard";
import CareerCardSkeleton from "../../components/Jobs/CareerCardSkeleton";
import CompanyFilters     from "../../components/companies/CompanyFilters";
import useCompanyCareers  from "../../hooks/useCompanyCareers";
import {
  setFilter, setPage, setManualCity,
  setSavedMap, addSaved, removeSaved,
} from "../../redux/placesSlice";
import {
  saveCompanyBookmark,
  getSavedCompanies,
  removeSavedCompany,
} from "../../services/companyService";

const PAGE_SIZE = 12;

/* ── Pagination ──────────────────────────────────────────────────── */
function Pagination({ page, totalPages, onChange }) {
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
          bg-white dark:bg-white/8 border border-gray-200 dark:border-white/10
          text-gray-600 dark:text-gray-300 disabled:opacity-30
          hover:bg-gray-50 dark:hover:bg-white/15 transition-colors">
        <FaChevronLeft className="text-xs" />
      </button>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5 sm:gap-2">
          {pages[i - 1] && p - pages[i - 1] > 1 && (
            <span className="text-gray-400 text-sm">…</span>
          )}
          <button
            onClick={() => onChange(p)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
              p === page
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                : "bg-white dark:bg-white/8 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/15"
            }`}>
            {p}
          </button>
        </span>
      ))}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 rounded-xl flex items-center justify-center
          bg-white dark:bg-white/8 border border-gray-200 dark:border-white/10
          text-gray-600 dark:text-gray-300 disabled:opacity-30
          hover:bg-gray-50 dark:hover:bg-white/15 transition-colors">
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
      className="col-span-full bg-white dark:bg-[#0f1123]
        border border-gray-100 dark:border-white/8 rounded-2xl
        p-8 sm:p-12 md:p-14 flex flex-col items-center text-center gap-5">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/25
        flex items-center justify-center shrink-0">
        <FaMapMarkerAlt className="text-2xl sm:text-3xl text-blue-500" />
      </div>
      <div className="max-w-sm">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
          Allow location or enter a city
        </h3>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          We find nearby software companies and verify which ones have working career pages on their websites.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          onClick={onRequestGPS}
          className="flex-1 flex items-center justify-center gap-2
            bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm
            px-5 py-3 rounded-xl transition-colors shadow-md shadow-blue-500/20">
          <FaLocationArrow className="text-xs shrink-0" /> Use My Location
        </button>
        <span className="self-center text-gray-400 text-sm hidden sm:block">or</span>
        <form
          className="flex-1 flex gap-2"
          onSubmit={e => { e.preventDefault(); city.trim() && onCitySubmit(city.trim()); }}>
          <input
            type="text"
            placeholder="Enter city…"
            value={city}
            onChange={e => setCity(e.target.value)}
            className="flex-1 min-w-0 px-4 py-3 text-sm rounded-xl
              border border-gray-200 dark:border-white/10
              bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white
              placeholder-gray-400 focus:outline-none focus:ring-2
              focus:ring-blue-500/40 transition" />
          <button
            type="submit"
            disabled={!city.trim()}
            className="shrink-0 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900
              font-semibold text-sm rounded-xl disabled:opacity-40 transition-colors">
            <FaSearch />
          </button>
        </form>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════ */
export default function Jobs() {
  const dispatch = useDispatch();
  const {
    companies,
    loading,
    error,
    source,
    requestLocation,
    fetchByCity,
    refetch,
  } = useCompanyCareers();

  const { isAuthenticated } = useSelector(s => s.auth);
  const location   = useSelector(s => s.places.location);
  const filters    = useSelector(s => s.places.filters);
  const page       = useSelector(s => s.places.page);
  const savedMap   = useSelector(s => s.places.savedMap);

  const allFiltered = useMemo(() => {
    let list = companies;

    if (filters.search?.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(c =>
        c.companyName?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.website?.toLowerCase().includes(q)
      );
    }

    if (filters.minRating > 0) {
      list = list.filter(c => c.rating != null && c.rating >= filters.minRating);
    }

    if (filters.maxRadius < 50) {
      list = list.filter(c => c.distanceKm == null || c.distanceKm <= filters.maxRadius);
    }

    return list;
  }, [companies, filters.search, filters.minRating, filters.maxRadius]);

  const total       = allFiltered.length;
  const totalPages  = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paged       = allFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasGPS     = location.status === "granted";
  const isIdle     = location.status === "idle";
  const hasDenied  = location.status === "denied" || location.status === "manual";
  const showPrompt = !loading && !error && (isIdle || hasDenied) &&
    companies.length === 0 && source !== "company_careers";

  /* ── Auto-request on mount ── */
  const didInit = useRef(false);
  useEffect(() => {
    dispatch(setPage(1));
    if (didInit.current) return;
    didInit.current = true;
    if (source === null || source === "no_location") requestLocation();
  }, []); // eslint-disable-line

  /* ── Reset page when filters or data change ── */
  useEffect(() => {
    dispatch(setPage(1));
  }, [filters.search, filters.minRating, filters.maxRadius, companies.length, dispatch]);

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
          logo:        company.logo       || null,
          website:     company.website    || null,
          address:     company.address    || null,
          phone:       company.phone      || null,
          rating:      company.rating     || null,
          mapsUrl:     company.mapsUrl    || null,
          careerPage:  company.careerUrl  || null,
          industry:    company.industry   || null,
          city:        location.city || null,
        });
        dispatch(addSaved({ placeId: pid, savedId: data.savedId ?? data.id }));
      } catch {
        dispatch(removeSaved(pid));
      }
    }
  }, [dispatch, isAuthenticated, savedMap, location.city]);

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#080810] p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Find Jobs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm flex items-center gap-2 flex-wrap">
            Companies with verified career pages on their official websites
            {source === "company_careers" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold
                px-2 py-0.5 rounded-full
                bg-green-100 text-green-700 dark:bg-green-900/25 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                Verified
              </span>
            )}
          </p>
        </div>

        {!loading && total > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold
              bg-emerald-50 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400
              px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
              {total} with career pages
            </span>
            <button
              onClick={refetch}
              title="Refresh"
              className="w-8 h-8 rounded-xl flex items-center justify-center
                bg-white dark:bg-white/8 border border-gray-200 dark:border-white/10
                text-gray-500 hover:bg-gray-50 dark:hover:bg-white/15 transition-colors">
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
            className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/15
              border border-blue-200 dark:border-blue-500/30 rounded-xl px-4 py-3 text-sm">
            <FaLocationArrow className="text-blue-500 animate-pulse shrink-0" />
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              Detecting your location…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Verifying careers banner ──────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/15
              border border-emerald-200 dark:border-emerald-500/30 rounded-xl px-4 py-3 text-sm">
            <FaBriefcase className="text-emerald-500 animate-pulse shrink-0" />
            <span className="text-emerald-700 dark:text-emerald-300 font-medium">
              Finding nearby companies and verifying career pages — this may take a moment…
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
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{" "}
          <strong className="text-gray-800 dark:text-white">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
          </strong>
          {" "}of{" "}
          <strong className="text-gray-800 dark:text-white">{total}</strong>
          {" "}companies with career pages
          {location.city && (
            <> near{" "}
              <strong className="text-blue-600 dark:text-blue-400">{location.city}</strong>
            </>
          )}
        </p>
      )}

      {/* ── Card grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">

        {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <CareerCardSkeleton key={i} />
        ))}

        {showPrompt && (
          <LocationPrompt
            onRequestGPS={requestLocation}
            onCitySubmit={handleCitySubmit}
          />
        )}

        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center bg-red-50 dark:bg-red-900/10
              border border-red-200 dark:border-red-500/20 rounded-2xl
              p-8 sm:p-12 text-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-100 dark:bg-red-900/30
              flex items-center justify-center shrink-0">
              <FaExclamationTriangle className="text-xl sm:text-2xl text-red-500" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-red-700 dark:text-red-400">
                Failed to load
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                {typeof error === "object" ? error.reason : error}
              </p>
            </div>
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700
                text-white text-sm font-semibold rounded-xl transition-colors">
              <FaSyncAlt className="text-xs" /> Retry
            </button>
          </motion.div>
        )}

        {!loading && !error && !showPrompt && total === 0 && source === "company_careers" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center
              bg-white dark:bg-[#0f1123] border border-gray-100 dark:border-white/8
              rounded-2xl p-10 sm:p-16 text-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-100 dark:bg-white/8
              flex items-center justify-center shrink-0">
              <FaBriefcase className="text-xl sm:text-2xl text-gray-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                No verified career pages found
              </h3>
              <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
                Nearby companies were checked, but none had a reachable careers or jobs page.
                Try a different city or expand the search radius.
              </p>
            </div>
            <button
              onClick={() => dispatch(setFilter({ minRating: 0, openNow: false, maxRadius: 50, search: "" }))}
              className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700
                text-white rounded-xl transition-colors">
              Clear Filters
            </button>
          </motion.div>
        )}

        {!loading && !error && paged.map(company => (
          <CareerCard
            key={company.placeId}
            company={company}
            isSaved={!!savedMap[company.placeId]}
            onSave={handleSave}
          />
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={p => dispatch(setPage(p))}
      />
    </div>
  );
}
