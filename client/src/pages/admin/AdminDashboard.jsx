/**
 * AdminDashboard.jsx
 *
 * Responsive:
 *  Mobile  : 1-col stat cards, stacked actions, full-width activity feed
 *  Tablet  : 2-col stat cards, 2-col actions
 *  Desktop : 4-col stat cards, 4-col actions, 3-col content grid
 *
 * Dark-mode aware: all cards use dark: variants, no white flash.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers, FaBriefcase, FaBook,
  FaArrowUp, FaArrowDown, FaRegClock, FaPlusCircle,
  FaUsersCog, FaExternalLinkAlt, FaChartLine,
  FaHistory,
} from "react-icons/fa";
import { motion } from "framer-motion";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Loader        from "../../components/common/Loader";
import adminService  from "../../services/adminService";

/* ── animation helpers ── */
const fadeUp  = (delay = 0) => ({
  initial:   { opacity: 0, y: 20 },
  animate:   { opacity: 1, y: 0  },
  transition:{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
});

const TYPE_DOT = {
  user:     "bg-blue-500",
  job:      "bg-green-500",
  resource: "bg-violet-500",
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats,   setStats]   = useState({
    totalUsers: 0, totalJobs: 0,
    totalResources: 0,
    growth: {
      users: { percentage: 0, recent: 0, previous: 0 },
      jobs: { percentage: 0, recent: 0, previous: 0 },
    },
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats and activities in parallel
      const [statsResponse, activitiesResponse] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivities(10),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (activitiesResponse.success) {
        setRecentActivities(activitiesResponse.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
      
      // Set default values on error
      setStats({
        totalUsers: 0,
        totalJobs: 0,
        totalResources: 0,
        growth: {
          users: { percentage: 0, recent: 0, previous: 0 },
          jobs: { percentage: 0, recent: 0, previous: 0 },
        },
      });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  // Show error message if data fetch failed
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

      {/* ── Page header ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Manage jobs, resources, users, and monitor platform activity.
          </p>
        </div>
        <span className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </span>
      </motion.div>

      {/* ── Stat cards — 1 col → 2 col → 3 col ── */}
      <motion.div {...fadeUp(0.08)}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        <DashboardCard
          title="Total Users"    value={stats.totalUsers}
          icon={<FaUsers />}     bgColor="from-blue-500 to-blue-700"
          onClick={() => navigate("/admin/users")}
        />
        <DashboardCard
          title="Total Jobs"     value={stats.totalJobs}
          icon={<FaBriefcase />} bgColor="from-emerald-500 to-emerald-700"
          onClick={() => navigate("/admin/jobs")}
        />
        <DashboardCard
          title="Resources"      value={stats.totalResources}
          icon={<FaBook />}      bgColor="from-violet-500 to-violet-700"
          onClick={() => navigate("/admin/resources")}
        />
      </motion.div>

      {/* ── Quick actions ── */}
      <motion.div {...fadeUp(0.16)}
        className="bg-white dark:bg-white/3 rounded-2xl
          border border-neutral-200 dark:border-white/8
          shadow-sm p-5 sm:p-6 lg:p-8">

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-lg">
            <FaPlusCircle className="text-lg" />
          </div>
          <h2 className="text-lg font-bold text-neutral-800 dark:text-white">Quick Actions</h2>
        </div>

        {/* 1 col → 2 col → 4 col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            {
              label: "Manage Jobs",
              icon: FaBriefcase,
              onClick: () => navigate("/admin/jobs"),
              base: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300",
              hover: "hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600",
            },
            {
              label: "Manage Resources",
              icon: FaBook,
              onClick: () => navigate("/admin/resources"),
              base: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
              hover: "hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600",
            },
            {
              label: "Manage Users",
              icon: FaUsersCog,
              onClick: () => navigate("/admin/users"),
              base: "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300",
              hover: "hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600",
            },
            {
              label: "View Platform",
              icon: FaExternalLinkAlt,
              onClick: () => navigate("/student/jobs"),
              base: "bg-neutral-50 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10",
              hover: "hover:bg-neutral-800 hover:text-white hover:border-transparent dark:hover:bg-white/15",
            },
          ].map(({ label, icon: Icon, onClick, base, hover }) => (
            <button key={label} onClick={onClick}
              className={`flex items-center justify-center gap-2.5 p-4 rounded-xl font-semibold text-sm
                transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group ${base} ${hover}`}>
              <Icon className="text-sm shrink-0 group-hover:scale-110 transition-transform" />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Activity + Growth — stack on mobile, 3-col on desktop ── */}
      <motion.div {...fadeUp(0.24)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

        {/* Recent activities — spans 2 of 3 cols on desktop */}
        <div className="lg:col-span-2 bg-white dark:bg-white/3 rounded-2xl
          border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6 lg:p-8">

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 rounded-lg">
                <FaHistory className="text-lg" />
              </div>
              <h2 className="text-lg font-bold text-neutral-800 dark:text-white">Recent Activities</h2>
            </div>
            <button className="text-sm text-blue-600 dark:text-blue-400 font-medium
              hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-1">
            {recentActivities.map(item => (
              <div key={item.id}
                className="flex items-start gap-4 p-3.5 rounded-xl
                  hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors group">
                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[item.type] ?? "bg-neutral-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 dark:text-white
                    group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors truncate">
                    {item.activity}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                    <FaRegClock className="text-[10px] shrink-0" /> {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth stats */}
        <div className="bg-white dark:bg-white/3 rounded-2xl
          border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6 lg:p-8 flex flex-col">

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <FaChartLine className="text-lg" />
            </div>
            <h2 className="text-lg font-bold text-neutral-800 dark:text-white">Growth Stats</h2>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {[
              { 
                label: "Users Growth", 
                pct: Math.min(Math.abs(stats.growth.users.percentage), 100), 
                badge: `${stats.growth.users.percentage >= 0 ? '+' : ''}${stats.growth.users.percentage}%`, 
                color: "bg-blue-500",
                isPositive: stats.growth.users.percentage >= 0,
              },
              { 
                label: "Job Posts", 
                pct: Math.min(Math.abs(stats.growth.jobs.percentage), 100), 
                badge: `${stats.growth.jobs.percentage >= 0 ? '+' : ''}${stats.growth.jobs.percentage}%`, 
                color: "bg-emerald-500",
                isPositive: stats.growth.jobs.percentage >= 0,
              },
            ].map(({ label, pct, badge, color, isPositive }) => (
              <div key={label}>
                <div className="flex justify-between mb-2 items-center">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                    isPositive 
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15'
                      : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/15'
                  }`}>
                    {isPositive ? <FaArrowUp className="text-[9px]" /> : <FaArrowDown className="text-[9px]" />}
                    {badge}
                  </span>
                </div>
                <div className="bg-neutral-100 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className={`${color} h-2.5 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Platform summary ── */}
      <motion.div {...fadeUp(0.32)}
        className="rounded-2xl border border-blue-100 dark:border-blue-500/20 shadow-sm p-5 sm:p-6 md:p-8
          bg-linear-to-r from-blue-50 to-violet-50 dark:from-blue-900/15 dark:to-violet-900/15">
        <h2 className="text-base sm:text-lg font-bold text-neutral-800 dark:text-white mb-3">
          Platform Summary
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm sm:text-base">
          CareerLaunch AI is currently serving{" "}
          <strong className="text-blue-700 dark:text-blue-400">{stats.totalUsers}</strong> registered users,
          with <strong className="text-emerald-700 dark:text-emerald-400">{stats.totalJobs}</strong> active job
          postings and <strong className="text-violet-700 dark:text-violet-400">{stats.totalResources}</strong> learning
          resources available, reflecting steady platform growth and engagement.
        </p>
      </motion.div>
    </div>
  );
}
