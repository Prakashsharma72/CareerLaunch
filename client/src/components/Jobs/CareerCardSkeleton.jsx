/**
 * CareerCardSkeleton.jsx — loading placeholder for CareerCard
 */
import { memo } from "react";

function Shimmer({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-white/8 rounded-lg ${className}`} />
  );
}

function CareerCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f1123]
      border border-gray-100 dark:border-white/8 rounded-2xl shadow-sm overflow-hidden">
      <div className="h-1.5 w-full bg-gray-200 dark:bg-white/8 animate-pulse shrink-0" />
      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
        <div className="flex items-start gap-3">
          <Shimmer className="w-11 h-11 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
          </div>
          <Shimmer className="w-9 h-9 rounded-xl shrink-0" />
        </div>
        <Shimmer className="h-6 w-24 rounded-full" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-4/5" />
          <Shimmer className="h-3 w-3/5" />
        </div>
        <Shimmer className="h-9 w-full rounded-xl mt-auto" />
      </div>
    </div>
  );
}

export default memo(CareerCardSkeleton);
