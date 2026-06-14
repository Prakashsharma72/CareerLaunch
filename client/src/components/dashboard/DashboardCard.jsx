import React from "react";

function DashboardCard({
  title,
  value,
  icon,
  bgColor = "bg-blue-500",
  textColor = "text-white",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        ${bgColor}
        ${textColor}
        rounded-xl
        shadow-lg
        p-6
        cursor-pointer
        transition-all
        duration-300
        hover:scale-105
        hover:shadow-2xl
      `}
    >
      <div className="flex items-center justify-between">
        
        {/* Left Side */}
        <div>
          <h3 className="text-sm font-medium opacity-90">
            {title}
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        {/* Right Side Icon */}
        <div className="text-5xl opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;