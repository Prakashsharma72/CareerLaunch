import React from "react";
import { FaArrowRight } from "react-icons/fa";

function DashboardCard({
  title,
  value,
  icon,
  bgColor = "from-primary-500 to-primary-600",
  textColor = "text-white",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-linear-to-br
        ${bgColor}
        ${textColor}
        rounded-2xl
        shadow-light-lg
        p-6
        md:p-8
        cursor-pointer
        transition-all
        duration-300
        hover:shadow-light-xl
        hover:-translate-y-1
        active:scale-95
        group
        relative
        overflow-hidden
      `}
    >
      {/* Decorative Background Element */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white opacity-5 rounded-full group-hover:opacity-10 transition-opacity"></div>
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white opacity-5 rounded-full group-hover:opacity-10 transition-opacity"></div>

      <div className="relative z-10 flex items-start justify-between">

        {/* Left Side */}
        <div>
          <p className="text-sm font-semibold opacity-90 uppercase tracking-wide">
            {title}
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-3 group-hover:translate-x-1 transition-transform">
            {value}
          </h2>
        </div>

        {/* Right Side Icon */}
        <div className="text-5xl md:text-6xl opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all group-hover:rotate-6">
          {icon}
        </div>
      </div>

      {/* Action Indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <FaArrowRight className="text-sm" />
      </div>
    </div>
  );
}

export default DashboardCard;