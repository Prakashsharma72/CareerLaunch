/**
 * Jobs.jsx — Find Jobs page
 *
 * Shows only nearby software companies with a verified careers/jobs page
 * on their official website. Data from GET /api/company-careers.
 */
import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector }                  from "react-redux";
import { useNavigate, useSearchParams }              from "react-router-dom";
import { motion, AnimatePresence }                   from "framer-motion";
import {
  FaBriefcase, FaBookmark, FaSyncAlt, FaMapMarkerAlt,
  FaLocationArrow, FaExclamationTriangle,
  FaSearch, FaChevronLeft, FaChevronRight,
} from "react-icons/fa";

import CareerCard         from "../../components/Jobs/CareerCard";
import CareerCardSkeleton from "../../components/Jobs/CareerCardSkeleton";
import JobCard            from "../../components/Jobs/JobCard";
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
import { saveJobBookmark, getSavedJobs, removeSavedJob } from "../../services/jobService";

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
        disabled={page === totalPages}
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
        p-8 sm:p-12 md:p-14 flex flex-col items-center text-center gap-5">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--cl-primary-soft)]
        flex items-center justify-center shrink-0">
        <FaMapMarkerAlt className="text-2xl sm:text-3xl text-[var(--cl-primary)]" />
      </div>
      <div className="max-w-sm">
        <h3 className="text-lg sm:text-xl font-bold text-[var(--cl-text)] mb-2">
          Allow location or enter a city
        </h3>
        <p className="text-[var(--cl-text-muted)] text-sm">
          We find nearby software companies and verify which ones have working career pages on their websites.
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
              focus:outline-none focus:ring-2 focus:ring-[var(--cl-ring)] transition" />
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

/* ══════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════ */
export default function Jobs() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const {
    companies,
    loading,
    error,
    source,
    activeLocation,
    dataLocation,
    providerSource,
    requestLocation,
    fetchByCity,
    refetch,
    nextPageToken,
    loadMore,
  } = useCompanyCareers();

  const { isAuthenticated } = useSelector(s => s.auth);
  const location   = useSelector(s => s.places.location);
  const filters    = useSelector(s => s.places.filters);
  const page       = useSelector(s => s.places.page);
  const savedMap   = useSelector(s => s.places.savedMap);
  const navigate   = useNavigate();
  const [savedJobMap, setSavedJobMap] = useState({});
  const isJobResults = source === "database_jobs";
  const resolvedLocation = filters.city?.trim() || activeLocation || location.city || "your area";
  const displayLocation = loading && dataLocation ? dataLocation : resolvedLocation;

  useEffect(() => {
    const keyword = searchParams.get("keyword")?.trim();
    const location = searchParams.get("location")?.trim();

    if (keyword || location) {
      dispatch(setFilter({
        search: keyword || "",
        city: location || "",
      }));
      if (location) dispatch(setManualCity(location));
    }
  }, [dispatch, searchParams]);

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

    if (!isJobResults && filters.minRating > 0) {
      list = list.filter(c => c.rating != null && c.rating >= filters.minRating);
    }

    if (filters.maxRadius < 50) {
      list = list.filter(c => c.distanceKm == null || c.distanceKm <= filters.maxRadius);
    }

    return list;
  }, [companies, filters.search, filters.minRating, filters.maxRadius, isJobResults]);

  const total       = allFiltered.length;
  const loadedTotal = companies.length;
  const verifiedCareerCount = companies.filter(company => company.careerVerified).length;
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

    if (filters.city?.trim()) {
      fetchByCity(filters.city, filters.keyword);
      return;
    }

    if (source === null || source === "no_location") requestLocation();
  }, [dispatch, fetchByCity, filters.city, filters.keyword, requestLocation, source]);

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

  useEffect(() => {
    if (!isAuthenticated) return;
    getSavedJobs().then(({ data }) => {
      const map = {};
      for (const job of data || []) {
        const id = job.externalJobId || job.id;
        if (id != null) map[id] = job.savedId ?? job.id;
      }
      setSavedJobMap(map);
    }).catch(() => {});
  }, [isAuthenticated]);

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

  const handleSaveJob = useCallback(async (job) => {
    if (!isAuthenticated) return;
    const externalJobId = job.externalJobId || `db-job-${job.id}`;
    const savedId = savedJobMap[externalJobId];
    if (savedId) {
      setSavedJobMap(current => { const next = { ...current }; delete next[externalJobId]; return next; });
      try { await removeSavedJob(savedId); }
      catch { setSavedJobMap(current => ({ ...current, [externalJobId]: savedId })); }
      return;
    }
    setSavedJobMap(current => ({ ...current, [externalJobId]: "tmp" }));
    try {
      const { data } = await saveJobBookmark({
        externalJobId,
        source: "database_jobs",
        title: job.title,
        company: job.company,
        companyLogo: job.companyLogo || null,
        location: job.location || null,
        salary: job.salary || null,
        employmentType: job.employmentType || job.type || null,
        applyUrl: job.applyUrl || null,
        postedDate: job.postedDate || null,
      });
      setSavedJobMap(current => ({ ...current, [externalJobId]: data.savedId ?? data.id }));
    } catch {
      setSavedJobMap(current => { const next = { ...current }; delete next[externalJobId]; return next; });
    }
  }, [isAuthenticated, savedJobMap]);

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="cl-page min-h-full p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--cl-text)] tracking-tight">
            Find Jobs
          </h1>
          <p className="text-[var(--cl-text-muted)] mt-1 text-sm flex items-center gap-2 flex-wrap">
            {isJobResults
              ? `Showing stored job listings for ${displayLocation}`
              : `Software companies from Google Places near ${displayLocation}`}
            {isJobResults && (
              <span className="text-[11px] text-[var(--cl-text-soft)]">
                Updated {companies[0]?.freshness ? new Date(companies[0].freshness).toLocaleDateString() : "recently"}
              </span>
            )}
            {source === "company_careers" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold
                px-2 py-0.5 rounded-full
                bg-[var(--cl-success-soft)] text-[var(--cl-success)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--cl-success)] animate-pulse inline-block" />
                Verified
              </span>
            )}
            {isJobResults && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--cl-primary-soft)] text-[var(--cl-primary)]">
                Database fallback · Actual jobs{providerSource === "provider_empty" ? " · Live search returned no results" : " · Live search unavailable"}
              </span>
            )}
          </p>
        </div>

        {!loading && total > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold
              bg-[var(--cl-success-soft)] text-[var(--cl-success)]
              px-3 py-1.5 rounded-full border border-[var(--cl-success)]/25">
              {isJobResults ? `${total} job listings loaded` : `${loadedTotal} software companies loaded`}
              {!isJobResults && <span className="text-[var(--cl-text-muted)] font-normal">({verifiedCareerCount} with verified career pages)</span>}
            </span>
            <button
              onClick={() => navigate("/student/saved-jobs")}
              title="View saved jobs"
              className="inline-flex items-center gap-2 text-sm font-semibold
                bg-[var(--cl-primary)] hover:bg-[var(--cl-primary-strong)] text-[var(--cl-button-text)] px-4 py-2 rounded-xl transition-colors">
              <FaBookmark className="text-xs" /> Saved Jobs
            </button>
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
            className="flex items-center gap-3 bg-[var(--cl-success-soft)]
              border border-[var(--cl-success)]/25 rounded-xl px-4 py-3 text-sm">
            <FaBriefcase className="text-[var(--cl-success)] animate-pulse shrink-0" />
            <span className="text-[var(--cl-success)] font-medium">
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
      {isJobResults && (
        <p className="text-xs text-[var(--cl-text-muted)]">
          Rating and Open Now filters apply to company discovery only, so they are not used for these job listings.
        </p>
      )}

      {/* ── Status line ───────────────────────────────────────── */}
      {!loading && !error && total > 0 && (
        <p className="text-sm text-[var(--cl-text-muted)]">
          Showing{" "}
          <strong className="text-[var(--cl-text)]">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
          </strong>
          {" "}of{" "}
          <strong className="text-[var(--cl-text)]">{total}</strong>
          {isJobResults ? " job listings" : " software companies"} near{" "}
          <strong className="text-[var(--cl-primary)]">{displayLocation}</strong>
        </p>
      )}

      {/* ── Card grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">

        {loading && companies.length === 0 && Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
            className="col-span-full flex flex-col items-center bg-[var(--cl-danger-soft)]
              border border-[var(--cl-danger)]/25 rounded-2xl
              p-8 sm:p-12 text-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--cl-danger-soft)]
              flex items-center justify-center shrink-0">
              <FaExclamationTriangle className="text-xl sm:text-2xl text-red-500" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-[var(--cl-danger)]">
                Failed to load
              </h3>
              <p className="text-sm text-[var(--cl-danger)]">
                {typeof error === "object" ? error.reason : error}
              </p>
            </div>
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--cl-danger)] hover:opacity-90
                text-[var(--cl-button-text)] text-sm font-semibold rounded-xl transition-colors">
              <FaSyncAlt className="text-xs" /> Retry
            </button>
          </motion.div>
        )}

        {!loading && !error && !showPrompt && total === 0 && ["company_careers", "database_jobs"].includes(source) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center
              bg-[var(--cl-surface)] border border-[var(--cl-border)]
              rounded-2xl p-10 sm:p-16 text-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--cl-surface-soft)]
              flex items-center justify-center shrink-0">
              <FaBriefcase className="text-xl sm:text-2xl text-[var(--cl-text-soft)]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--cl-text)]">
                {source === "database_jobs" ? "No stored job listings found" : "No software companies found"}
              </h3>
              <p className="text-[var(--cl-text-muted)] text-sm mt-1 max-w-md mx-auto">
                {source === "database_jobs"
                  ? `No published jobs match ${resolvedLocation}. Try another city or view all locations.`
                  : "No software companies were returned for this search. Try a different city or expand the search radius."}
              </p>
            </div>
            <button
              onClick={() => dispatch(setFilter(source === "database_jobs"
                ? { city: "", minRating: 0, openNow: false, maxRadius: 50, search: "" }
                : { minRating: 0, openNow: false, maxRadius: 50, search: "" }))}
              className="px-5 py-2.5 text-sm font-semibold bg-[var(--cl-primary)] hover:bg-[var(--cl-primary-strong)]
                text-[var(--cl-button-text)] rounded-xl transition-colors">
              {source === "database_jobs" ? "Clear location filter" : "Clear Filters"}
            </button>
          </motion.div>
        )}

        {!error && paged.map(company => isJobResults ? (
          <JobCard
            key={company.externalJobId || company.id}
            job={{ ...company, id: company.externalJobId || company.id }}
            isSaved={!!savedJobMap[company.externalJobId || `db-job-${company.id}`]}
            onSaveJob={() => handleSaveJob(company)}
          />
        ) : (
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

      {!loading && nextPageToken && (
        <div className="flex justify-center mt-5">
          <button
            onClick={loadMore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--cl-primary)] hover:bg-[var(--cl-primary-strong)]
              text-[var(--cl-button-text)] text-sm font-semibold shadow-sm transition-colors">
            <FaBriefcase className="text-xs" /> Load More Companies
          </button>
        </div>
      )}
    </div>
  );
}
