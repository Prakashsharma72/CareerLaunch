import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaTimes,
  FaBuilding,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
} from "react-icons/fa";

import CompanyCard        from "../../components/companies/CompanyCard";
import CompanyCardSkeleton from "../../components/companies/CompanyCardSkeleton";
import {
  searchStart,
  searchSuccess,
  searchFailure,
  addSaved,
} from "../../redux/companySlice";
import { searchCompanies, saveCompany } from "../../services/companyService";

const PAGE_SIZE = 9;

/* ── Debounce hook ───────────────────────────────────────────────────────── */
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ── Pagination ──────────────────────────────────────────────────────────── */
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 rounded-xl flex items-center justify-center
          bg-white dark:bg-white/8 border border-gray-200 dark:border-white/10
          text-gray-600 dark:text-gray-300 disabled:opacity-30
          hover:bg-gray-50 dark:hover:bg-white/15 transition-colors"
      >
        <FaChevronLeft className="text-xs" />
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all
            ${p === page
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105"
              : "bg-white dark:bg-white/8 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/15"
            }`}
        >{p}</button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 rounded-xl flex items-center justify-center
          bg-white dark:bg-white/8 border border-gray-200 dark:border-white/10
          text-gray-600 dark:text-gray-300 disabled:opacity-30
          hover:bg-gray-50 dark:hover:bg-white/15 transition-colors"
      >
        <FaChevronRight className="text-xs" />
      </button>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function CompanySearch() {
  const dispatch = useDispatch();
  const { companies, loading, error, lastKeyword, lastCity, savedCompanies } =
    useSelector((s) => s.companies);

  const [keyword,     setKeyword]     = useState(lastKeyword || "");
  const [city,        setCity]        = useState(lastCity    || "");
  const [page,        setPage]        = useState(1);
  const [hasSearched, setHasSearched] = useState(companies.length > 0);

  const savedIds       = new Set(savedCompanies.map((s) => s.id));
  const debouncedKw    = useDebounce(keyword, 600);
  const debouncedCity  = useDebounce(city,    600);
  const isFirstRender  = useRef(true);

  /* Auto-search on debounce — skip the very first render */
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (debouncedKw.trim() && debouncedCity.trim()) {
      runSearch(debouncedKw.trim(), debouncedCity.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKw, debouncedCity]);

  const runSearch = useCallback(async (kw, ct) => {
    setHasSearched(true);
    setPage(1);
    dispatch(searchStart({ keyword: kw, city: ct }));
    try {
      const { data } = await searchCompanies(kw, ct);
      dispatch(searchSuccess(data));
    } catch (err) {
      dispatch(searchFailure(err?.response?.data?.message || err.message || "Search failed"));
    }
  }, [dispatch]);

  const handleSearch = () => {
    const kw = keyword.trim();
    const ct = city.trim();
    if (kw && ct) runSearch(kw, ct);
  };

  const handleReset = () => {
    setKeyword(""); setCity(""); setPage(1); setHasSearched(false);
    dispatch(searchSuccess([]));
  };

  const handleSave = useCallback(async (companyId) => {
    if (!companyId) return;
    try {
      const { data } = await saveCompany(companyId);
      const company  = companies.find((c) => c.id === companyId);
      if (company) dispatch(addSaved({ ...company, savedId: data.savedId }));
    } catch (err) {
      if (err?.response?.status === 409) return; // already saved — ok
      throw err;
    }
  }, [companies, dispatch]);

  const totalPages = Math.ceil(companies.length / PAGE_SIZE);
  const paginated  = companies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#080810] p-6 md:p-8 space-y-7">

      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Find Companies
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Discover real companies near you — powered by Google Places
          </p>
        </div>
        {!loading && hasSearched && companies.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold
            bg-blue-50 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400
            px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/30 self-start sm:self-auto">
            {companies.length} result{companies.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Search card ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-gray-200 dark:border-white/8 shadow-sm p-5 md:p-6">
        <div className="flex flex-col md:flex-row gap-3">

          {/* Keyword input */}
          <div className="relative flex-2">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder='Search keyword — e.g. "software company"'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm
                bg-gray-50 dark:bg-white/5
                border border-gray-200 dark:border-white/10
                text-gray-800 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
                transition"
            />
            {keyword && (
              <button onClick={() => setKeyword("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                  bg-gray-200 dark:bg-white/15 flex items-center justify-center
                  text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-white/25 transition">
                <FaTimes className="text-[9px]" />
              </button>
            )}
          </div>

          {/* City input */}
          <div className="relative flex-1">
            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="City — e.g. Pune"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm
                bg-gray-50 dark:bg-white/5
                border border-gray-200 dark:border-white/10
                text-gray-800 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
                transition"
            />
            {city && (
              <button onClick={() => setCity("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                  bg-gray-200 dark:bg-white/15 flex items-center justify-center
                  text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-white/25 transition">
                <FaTimes className="text-[9px]" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSearch}
              disabled={loading || !keyword.trim() || !city.trim()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                disabled:opacity-40 disabled:cursor-not-allowed
                text-white font-semibold text-sm px-7 py-3.5 rounded-xl
                shadow-md shadow-blue-500/20 transition-all"
            >
              {loading
                ? <><FaSyncAlt className="animate-spin text-xs" /> Searching…</>
                : <><FaSearch className="text-xs" /> Search</>
              }
            </motion.button>

            {(keyword || city || hasSearched) && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5
                  bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/15
                  text-gray-600 dark:text-gray-300 font-semibold text-sm
                  px-4 py-3.5 rounded-xl transition-colors border border-gray-200 dark:border-white/10"
              >
                <FaTimes className="text-xs" />
                Reset
              </motion.button>
            )}
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          Auto-searches as you type · Results from Google Places API
        </p>
      </div>

      {/* ── Result meta row ────────────────────────────────────────── */}
      <AnimatePresence>
        {!loading && hasSearched && companies.length > 0 && (
          <motion.div key="meta"
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
          >
            <span>
              Showing{" "}
              <strong className="text-gray-800 dark:text-white">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, companies.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-gray-800 dark:text-white">{companies.length}</strong>{" "}
              companies
              {lastKeyword && lastCity && (
                <> for <span className="text-blue-600 dark:text-blue-400 font-medium">"{lastKeyword}"</span>{" "}
                in <span className="text-blue-600 dark:text-blue-400 font-medium">{lastCity}</span></>
              )}
            </span>
            {totalPages > 1 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Page {page} / {totalPages}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results grid ───────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

        {/* Skeleton */}
        {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <CompanyCardSkeleton key={i} />
        ))}

        {/* Error */}
        {!loading && error && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center justify-center
              bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20
              rounded-2xl p-14 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FaExclamationTriangle className="text-2xl text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">Request Failed</h3>
              <p className="text-sm text-red-500 dark:text-red-400 max-w-md">{error}</p>
            </div>
            <button onClick={handleSearch}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty */}
        {!loading && !error && paginated.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center justify-center
              bg-white dark:bg-[#0f1123] border border-gray-100 dark:border-white/8
              rounded-2xl p-16 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <FaBuilding className="text-3xl text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {hasSearched ? "No companies found" : "Start your search"}
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm">
                {hasSearched
                  ? "Try a broader keyword or a different city."
                  : 'Enter a keyword like "software company" and a city like "Pune" above.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Company cards */}
        {!loading && !error && paginated.map((company) => (
          <CompanyCard
            key={company.placeId ?? company.companyName}
            company={company}
            isSaved={savedIds.has(company.id)}
            onSave={handleSave}
          />
        ))}
      </div>

      {/* ── Pagination ─────────────────────────────────────────────── */}
      {!loading && !error && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      )}
    </div>
  );
}
