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
  accent = "blue",
  onClick,
}) {
  const accentStyles = {
    blue: "bg-[var(--cl-primary-soft)] text-[var(--cl-primary)]",
    green: "bg-[var(--cl-success-soft)] text-[var(--cl-success)]",
    amber: "bg-[var(--cl-warning-soft)] text-[var(--cl-warning)]",
    violet: "bg-[var(--cl-primary-soft)] text-[var(--cl-primary)]",
  };

  return (
    <div
      onClick={onClick}
      className={`
        cl-card min-h-[108px] text-[var(--cl-text)] p-4 md:p-5
        cursor-pointer transition-all duration-300
        hover:-translate-y-0.5 active:scale-95
        group relative overflow-hidden select-none
        ${onClick ? "cursor-pointer" : "cursor-default"}
      `}
    >
      <div className="relative z-10 flex items-start justify-between gap-2">

        {/* Left: title + value */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[var(--cl-text-muted)] truncate">
            {title}
          </p>
          <h2 className="text-3xl font-bold mt-1.5 text-[var(--cl-text)] group-hover:translate-x-0.5
            transition-transform truncate leading-tight">
            {value}
          </h2>
        </div>

        {/* Right: icon */}
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 text-xl ${accentStyles[accent] ?? accentStyles.blue} transition-colors`}>
          {icon}
        </div>
      </div>

      {/* arrow hint */}
      {onClick && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <FaArrowRight className="text-xs text-[var(--cl-text-muted)]" />
        </div>
      )}
    </div>
  );
}

export default memo(DashboardCard);
