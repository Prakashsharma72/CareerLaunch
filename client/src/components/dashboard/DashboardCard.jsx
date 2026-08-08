/**
 * DashboardCard.jsx — stat card used on Admin and Student dashboards.
 *
 * Responsive:
 *  - value font shrinks on mobile (text-3xl → text-4xl md:text-5xl)
 *  - icon shrinks on mobile
 *  - padding scales p-4 md:p-6
 *  - min-w-0 / truncate so long values never overflow
 */
import { memo }        from "react";
import { FaArrowRight } from "react-icons/fa";

function DashboardCard({
  title,
  value,
  icon,
  bgColor    = "from-primary-500 to-primary-600",
  textColor  = "text-white",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-linear-to-br ${bgColor} ${textColor}
        rounded-2xl shadow-lg p-4 md:p-6
        cursor-pointer transition-all duration-300
        hover:shadow-xl hover:-translate-y-1 active:scale-95
        group relative overflow-hidden select-none
        ${onClick ? "cursor-pointer" : "cursor-default"}
      `}
    >
      {/* decorative blobs */}
      <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/5 rounded-full group-hover:bg-white/10 transition-opacity pointer-events-none" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full group-hover:bg-white/10 transition-opacity pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-2">

        {/* Left: title + value */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold opacity-90 uppercase tracking-wide truncate">
            {title}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1.5 group-hover:translate-x-0.5
            transition-transform truncate leading-tight">
            {value}
          </h2>
        </div>

        {/* Right: icon */}
        <div className="text-2xl sm:text-3xl md:text-4xl opacity-70 shrink-0
          group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-6 transition-all">
          {icon}
        </div>
      </div>

      {/* arrow hint */}
      {onClick && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <FaArrowRight className="text-xs" />
        </div>
      )}
    </div>
  );
}

export default memo(DashboardCard);
