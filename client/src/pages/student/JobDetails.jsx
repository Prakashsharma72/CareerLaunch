/**
 * JobDetails.jsx
 *
 * Jobs are now company listings from Google Places.
 * Non-numeric id  → redirect to CompanyDetails.
 * Numeric legacy  → friendly responsive message.
 */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FaArrowLeft, FaBriefcase } from "react-icons/fa";
import { motion } from "framer-motion";

export default function JobDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    if (isNaN(id)) {
      navigate(`/student/companies/${encodeURIComponent(id)}`, { replace: true });
    }
  }, [id, navigate]);

  if (id && !isNaN(id)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center
        px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-5 text-center"
        >
          {/* Icon */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl
            bg-blue-50 dark:bg-blue-900/25
            flex items-center justify-center shrink-0">
            <FaBriefcase className="text-2xl sm:text-3xl text-blue-500" />
          </div>

          {/* Text */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold
              text-gray-900 dark:text-white mb-2">
              Job listing moved
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Jobs are now sourced live from Google Places. Browse real nearby
              companies on the Jobs page.
            </p>
          </div>

          {/* Buttons — stack on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/student/jobs")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2
                px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                text-white font-semibold text-sm rounded-xl
                transition-colors shadow-md shadow-blue-500/20"
            >
              Browse Jobs
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2
                px-5 py-3
                bg-white dark:bg-white/5
                text-gray-700 dark:text-gray-200
                font-semibold text-sm rounded-xl
                border border-gray-200 dark:border-white/10
                hover:bg-gray-50 dark:hover:bg-white/10
                transition-colors"
            >
              <FaArrowLeft className="text-xs shrink-0" /> Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
