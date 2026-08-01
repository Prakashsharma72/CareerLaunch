import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FaBookmark, FaBuilding } from "react-icons/fa";

import CompanyCard from "../../components/companies/CompanyCard";
import CompanyCardSkeleton from "../../components/companies/CompanyCardSkeleton";
import {
  fetchSavedStart,
  fetchSavedSuccess,
  fetchSavedFailure,
  removeSaved,
} from "../../redux/companySlice";
import {
  getSavedCompanies,
  removeSavedCompany,
} from "../../services/companyService";

function SavedCompanies() {
  const dispatch = useDispatch();
  const { savedCompanies, savedLoading, savedError } = useSelector(
    (s) => s.companies
  );

  useEffect(() => {
    loadSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSaved() {
    dispatch(fetchSavedStart());
    try {
      const { data } = await getSavedCompanies();
      dispatch(fetchSavedSuccess(data));
    } catch (err) {
      dispatch(
        fetchSavedFailure(
          err?.response?.data?.message || err.message || "Failed to load saved companies"
        )
      );
    }
  }

  async function handleRemove(savedId) {
    try {
      await removeSavedCompany(savedId);
      dispatch(removeSaved(savedId));
    } catch (err) {
      console.error("Remove saved company failed:", err.message);
      throw err;
    }
  }

  return (
    <div className="p-6 space-y-8">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Saved Companies
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1.5">
          Companies you bookmarked for later review.
        </p>
      </div>

      {/* ── Stats card ─────────────────────────────────────────── */}
      <div className="
        bg-white dark:bg-[#12142a]
        border border-gray-100 dark:border-white/8
        rounded-2xl shadow-sm p-5
        flex items-center gap-4
      ">
        <div className="
          w-12 h-12 rounded-xl flex items-center justify-center
          bg-blue-50 dark:bg-blue-900/20
        ">
          <FaBookmark className="text-xl text-blue-500" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Saved
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {savedLoading ? "—" : savedCompanies.length}
          </p>
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

        {/* Loading skeletons */}
        {savedLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <CompanyCardSkeleton key={i} />
          ))}

        {/* Error */}
        {!savedLoading && savedError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="
              col-span-full bg-red-50 dark:bg-red-900/10
              border border-red-200 dark:border-red-500/20
              rounded-2xl p-10 text-center
            "
          >
            <p className="text-red-600 dark:text-red-400 font-semibold">
              {savedError}
            </p>
            <button
              onClick={loadSaved}
              className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Empty state */}
        {!savedLoading && !savedError && savedCompanies.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="
              col-span-full flex flex-col items-center justify-center
              bg-white dark:bg-[#12142a]
              border border-gray-100 dark:border-white/8
              rounded-2xl p-14 text-center
            "
          >
            <div className="
              w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20
              flex items-center justify-center mb-4
            ">
              <FaBuilding className="text-3xl text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              No saved companies yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm">
              Go to{" "}
              <a
                href="/student/companies"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Find Companies
              </a>{" "}
              and click the bookmark icon on any card to save it here.
            </p>
          </motion.div>
        )}

        {/* Cards */}
        <AnimatePresence>
          {!savedLoading &&
            !savedError &&
            savedCompanies.map((company) => (
              <motion.div
                key={company.savedId ?? company.id}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <CompanyCard
                  company={company}
                  isSaved={true}
                  onRemove={handleRemove}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SavedCompanies;
