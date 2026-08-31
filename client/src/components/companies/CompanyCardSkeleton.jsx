/**
 * CompanyCardSkeleton.jsx — animated placeholder while companies load
 * Matches the updated CompanyCard layout exactly.
 */
import { memo } from "react";

function Shimmer({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-white/8 rounded-lg ${className}`} />
  );
}

function CompanyCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f1123]
      border border-gray-100 dark:border-white/8 rounded-2xl shadow-sm overflow-hidden">

      {/* Accent bar */}
      <div className="h-1.5 w-full bg-gray-200 dark:bg-white/8 animate-pulse shrink-0" />

      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">

        {/* Header row */}
        <div className="flex items-start gap-3">
          <Shimmer className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
          </div>
          <Shimmer className="w-9 h-9 rounded-xl shrink-0" />
        </div>

        {/* Distance badge */}
        <Shimmer className="h-6 w-24 rounded-full" />

        {/* Detail rows */}
        <div className="flex-1 space-y-2">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-4/5" />
          <Shimmer className="h-3 w-3/5" />
          <Shimmer className="h-3 w-2/3" />
        </div>

        {/* Button row */}
        <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-white/6 mt-auto">
          <Shimmer className="flex-1 h-9 rounded-xl" />
          <Shimmer className="w-16 h-9 rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  );
}

export default memo(CompanyCardSkeleton);
