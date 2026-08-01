import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

const JOB_TYPES = ["Full Time", "Part Time", "Internship", "Remote", "Contract"];

export default function JobFilter({ onFilter }) {
  const [search,   setSearch]   = useState("");
  const [location, setLocation] = useState("");
  const [jobType,  setJobType]  = useState("");

  function apply(overrides = {}) {
    onFilter({
      search:   overrides.search   ?? search,
      location: overrides.location ?? location,
      jobType:  overrides.jobType  ?? jobType,
    });
  }

  function handleReset() {
    setSearch(""); setLocation(""); setJobType("");
    onFilter({ search: "", location: "", jobType: "" });
  }

  const hasFilters = search || location || jobType;

  return (
    <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-gray-200 dark:border-white/8 shadow-sm p-5 md:p-6">

      <div className="flex flex-col md:flex-row gap-3">

        {/* Search title/company */}
        <div className="relative flex-2">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or company…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); apply({ search: e.target.value }); }}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm
              bg-gray-50 dark:bg-white/5
              border border-gray-200 dark:border-white/10
              text-gray-800 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
              transition"
          />
          {search && (
            <button onClick={() => { setSearch(""); apply({ search: "" }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                bg-gray-200 dark:bg-white/15 flex items-center justify-center
                text-gray-500 hover:bg-gray-300 dark:hover:bg-white/25 transition">
              <FaTimes className="text-[9px]" />
            </button>
          )}
        </div>

        {/* Location */}
        <div className="relative flex-1">
          <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => { setLocation(e.target.value); apply({ location: e.target.value }); }}
            className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm
              bg-gray-50 dark:bg-white/5
              border border-gray-200 dark:border-white/10
              text-gray-800 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
              transition"
          />
          {location && (
            <button onClick={() => { setLocation(""); apply({ location: "" }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                bg-gray-200 dark:bg-white/15 flex items-center justify-center
                text-gray-500 hover:bg-gray-300 dark:hover:bg-white/25 transition">
              <FaTimes className="text-[9px]" />
            </button>
          )}
        </div>

        {/* Job type */}
        <div className="relative flex-1">
          <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
          <select
            value={jobType}
            onChange={(e) => { setJobType(e.target.value); apply({ jobType: e.target.value }); }}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm appearance-none
              bg-gray-50 dark:bg-white/5
              border border-gray-200 dark:border-white/10
              text-gray-800 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
              transition cursor-pointer"
          >
            <option value="">All Types</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Reset (only when filters active) */}
        {hasFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleReset}
            className="shrink-0 flex items-center justify-center gap-1.5
              bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/15
              text-gray-600 dark:text-gray-300 font-semibold text-sm
              px-5 py-3.5 rounded-xl transition-colors border border-gray-200 dark:border-white/10"
          >
            <FaTimes className="text-xs" />
            Reset
          </motion.button>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
        Filters apply instantly
      </p>
    </div>
  );
}
