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
import Loader from "../../components/common/Loader";
import adminService from "../../services/adminService";

/* ── animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
});

const TYPE_DOT = {
  user: "bg-blue-500",
  job: "bg-green-500",
  resource: "bg-violet-500",
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0, totalJobs: 0,
    totalResources: 0,
    growth: {
      users: { percentage: 0, recent: 0, previous: 0 },
      jobs: { percentage: 0, recent: 0, previous: 0 },
    },
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, []);

  if (loading) return <Loader />;

  // Show error message if data fetch failed
  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-[var(--cl-danger)]/20 bg-[var(--cl-danger-soft)] p-6 text-center">
          <p className="font-medium text-[var(--cl-danger)]">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 rounded-lg bg-[var(--cl-danger)] px-4 py-2 text-[var(--cl-button-text)] transition-colors hover:bg-[var(--cl-danger)]/90"
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
      <motion.div {...fadeUp(0)} className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--cl-text)] sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--cl-text-muted)]">
            Manage jobs, resources, users, and monitor platform activity.
          </p>
        </div>
        <span className="shrink-0 text-xs text-[var(--cl-text-soft)]">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </span>
      </motion.div>

      {/* ── Stat cards — 1 col → 2 col → 3 col ── */}
      <motion.div {...fadeUp(0.08)}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        <DashboardCard
          title="Total Users" value={stats.totalUsers}
          icon={<FaUsers />} bgColor="from-blue-500 to-blue-700"
          onClick={() => navigate("/admin/users")}
        />
        <DashboardCard
          title="Total Jobs" value={stats.totalJobs}
          icon={<FaBriefcase />} bgColor="from-emerald-500 to-emerald-700"
          onClick={() => navigate("/admin/jobs")}
        />
        <DashboardCard
          title="Resources" value={stats.totalResources}
          icon={<FaBook />} bgColor="from-violet-500 to-violet-700"
          onClick={() => navigate("/admin/resources")}
        />
      </motion.div>

      {/* ── Quick actions ── */}
      <motion.div
        {...fadeUp(0.16)}
        className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-5 shadow-[var(--cl-shadow)] sm:p-6 lg:p-8"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-[var(--cl-primary-soft)] p-2 text-[var(--cl-primary)]">
            <FaPlusCircle className="text-lg" />
          </div>
          <h2 className="text-lg font-bold text-[var(--cl-text)]">Quick Actions</h2>
        </div>

        {/* 1 col → 2 col → 4 col */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Manage Jobs",
              icon: FaBriefcase,
              onClick: () => navigate("/admin/jobs"),
              base: "border border-[var(--cl-primary)]/25 bg-[var(--cl-primary-soft)] text-[var(--cl-primary-strong)]",
              hover: "hover:bg-[var(--cl-primary)] hover:text-[var(--cl-button-text)]",
            },
            {
              label: "Manage Resources",
              icon: FaBook,
              onClick: () => navigate("/admin/resources"),
              base: "border border-[var(--cl-success)]/25 bg-[var(--cl-success-soft)] text-[var(--cl-success)]",
              hover: "hover:bg-[var(--cl-success)] hover:text-[var(--cl-button-text)]",
            },
            {
              label: "Manage Users",
              icon: FaUsersCog,
              onClick: () => navigate("/admin/users"),
              base: "border border-[var(--cl-primary)]/25 bg-[var(--cl-primary-soft)] text-[var(--cl-primary-strong)]",
              hover: "hover:bg-[var(--cl-primary)] hover:text-[var(--cl-button-text)]",
            },
            {
              label: "View Platform",
              icon: FaExternalLinkAlt,
              onClick: () => navigate("/student/jobs"),
              base: "border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] text-[var(--cl-text)]",
              hover: "hover:bg-[var(--cl-surface-elevated)] hover:text-[var(--cl-text)]",
            },
          ].map(({ label, icon: Icon, onClick, base, hover }) => (
            <button
              key={label}
              onClick={onClick}
              className={`group flex items-center justify-center gap-2.5 rounded-xl p-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${base} ${hover}`}
            >
              <Icon className="shrink-0 text-sm transition-transform group-hover:scale-110" />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Activity + Growth — stack on mobile, 3-col on desktop ── */}
      <motion.div {...fadeUp(0.24)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

        {/* Recent activities — spans 2 of 3 cols on desktop */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-5 shadow-[var(--cl-shadow)] sm:p-6 lg:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--cl-primary-soft)] p-2 text-[var(--cl-primary)]">
                <FaHistory className="text-lg" />
              </div>
              <h2 className="text-lg font-bold text-[var(--cl-text)]">Recent Activities</h2>
            </div>
            <button className="text-sm font-medium text-[var(--cl-primary)] transition-colors hover:text-[var(--cl-primary-strong)]">
              View All
            </button>
          </div>

          <div className="space-y-1">
            {recentActivities.map(item => (
              <div
                key={item.id}
                className="group flex items-start gap-4 rounded-xl p-3.5 transition-colors hover:bg-[var(--cl-surface-soft)]"
              >
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_DOT[item.type] ?? "bg-neutral-400"}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--cl-text)] transition-colors group-hover:text-[var(--cl-primary)]">
                    {item.activity}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--cl-text-muted)]">
                    <FaRegClock className="shrink-0 text-[10px]" /> {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth stats */}
        <div className="flex flex-col rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-5 shadow-[var(--cl-shadow)] sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-[var(--cl-success-soft)] p-2 text-[var(--cl-success)]">
              <FaChartLine className="text-lg" />
            </div>
            <h2 className="text-lg font-bold text-[var(--cl-text)]">Growth Stats</h2>
          </div>

          <div className="flex flex-1 flex-col justify-center space-y-6">
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
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--cl-text)]">{label}</span>
                  <span
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${isPositive
                      ? "bg-[var(--cl-success-soft)] text-[var(--cl-success)]"
                      : "bg-[var(--cl-danger-soft)] text-[var(--cl-danger)]"}`}
                  >
                    {isPositive ? <FaArrowUp className="text-[9px]" /> : <FaArrowDown className="text-[9px]" />}
                    {badge}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--cl-surface-soft)]">
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
      <motion.div
        {...fadeUp(0.32)}
        className="rounded-2xl border border-[var(--cl-border)] bg-linear-to-r from-[var(--cl-primary-soft)] to-[var(--cl-surface-soft)] p-5 shadow-[var(--cl-shadow)] sm:p-6 md:p-8"
      >
        <h2 className="mb-3 text-base font-bold text-[var(--cl-text)] sm:text-lg">
          Platform Summary
        </h2>
        <p className="text-sm leading-relaxed text-[var(--cl-text-muted)] sm:text-base">
          CareerLaunch AI is currently serving{" "}
          <strong className="text-[var(--cl-primary)]">{stats.totalUsers}</strong> registered users,
          with <strong className="text-[var(--cl-success)]">{stats.totalJobs}</strong> active job
          postings and <strong className="text-[var(--cl-primary)]">{stats.totalResources}</strong> learning
          resources available, reflecting steady platform growth and engagement.
        </p>
      </motion.div>
    </div>
  );
}


export default AdminDashboard;