/**
 * Skeleton placeholder shown while company search results are loading.
 */
function Shimmer({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-white/8 rounded-lg ${className}`}
    />
  );
}

function CompanyCardSkeleton() {
  return (
    <div className="
      bg-white dark:bg-[#12142a]
      border border-gray-100 dark:border-white/8
      rounded-2xl shadow-sm overflow-hidden
    ">
      {/* accent bar */}
      <div className="h-1 w-full bg-gray-200 dark:bg-white/8 animate-pulse" />

      <div className="p-5 space-y-4">

        {/* header row */}
        <div className="flex items-start gap-3">
          <Shimmer className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-1/2" />
          </div>
          <Shimmer className="w-9 h-9 rounded-xl shrink-0" />
        </div>

        {/* detail rows */}
        <div className="space-y-2">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-4/5" />
          <Shimmer className="h-3 w-2/5" />
        </div>

        {/* buttons */}
        <div className="flex gap-2 pt-1 border-t border-gray-100 dark:border-white/6">
          <Shimmer className="flex-1 h-8 rounded-xl" />
          <Shimmer className="flex-1 h-8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default CompanyCardSkeleton;
