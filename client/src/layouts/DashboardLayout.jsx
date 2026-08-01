import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTachometerAlt, FaUser, FaBriefcase, FaBook,
  FaBookmark, FaFileAlt, FaRoad, FaRobot,
  FaSignOutAlt, FaBars, FaTimes, FaRocket,
  FaChevronLeft, FaBell, FaBuilding,
} from "react-icons/fa";
import { useSelector } from "react-redux";

const SIDEBAR_W = 240;

const menuItems = [
  { name: "Dashboard",        icon: FaTachometerAlt, path: "/student/dashboard" },
  { name: "Profile",          icon: FaUser,          path: "/student/profile" },
  { name: "Jobs",             icon: FaBriefcase,     path: "/student/jobs" },
  { name: "Companies",        icon: FaBuilding,      path: "/student/companies" },
  { name: "Resources",        icon: FaBook,          path: "/student/resources" },
  { name: "Saved Jobs",       icon: FaBookmark,      path: "/student/saved-jobs" },
  { name: "Saved Companies",  icon: FaBuilding,      path: "/student/saved-companies" },
  { name: "Resume Analyzer",  icon: FaFileAlt,       path: "/student/resume-analyzer" },
  { name: "Roadmap",          icon: FaRoad,          path: "/student/roadmap-generator" },
  { name: "Mock Interview",   icon: FaRobot,         path: "/student/mock-interview" },
];

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [darkMode, setDarkMode]     = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* close mobile sidebar on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sidebarW = collapsed ? 72 : SIDEBAR_W;
  const userInitial = (user?.name || "S")[0].toUpperCase();
  const pageName = menuItems.find((m) => location.pathname.startsWith(m.path))?.name ?? "Dashboard";

  /* ── Sidebar content (shared for both mobile + desktop) ── */
  function SidebarContent({ onClose }) {
    return (
      <div className="flex flex-col h-full">
        {/* Logo row */}
        <div className={`flex items-center ${collapsed && !onClose ? "justify-center px-0 py-5" : "justify-between px-5 py-5"} border-b border-white/10 dark:border-white/5`}>
          {(!collapsed || onClose) && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
                <FaRocket className="text-white text-xs" />
              </div>
              <span className="font-bold text-white text-base truncate">CareerLaunch AI</span>
            </div>
          )}
          {collapsed && !onClose && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto"
              style={{ background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
              <FaRocket className="text-white text-xs" />
            </div>
          )}
          {onClose ? (
            <button onClick={onClose} aria-label="Close sidebar"
              className="text-white/60 hover:text-white transition-colors p-1">
              <FaTimes className="text-sm" />
            </button>
          ) : (
            <button onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar"
              className="hidden lg:flex text-white/40 hover:text-white/80 transition-colors p-1">
              <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <FaChevronLeft className="text-xs" />
              </motion.span>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);
            return (
              <NavLink key={item.path} to={item.path}
                className={() =>
                  `relative flex items-center gap-3 rounded-xl transition-all duration-200 group
                   ${collapsed && !onClose ? "justify-center px-0 py-3" : "px-3 py-2.5"}
                   ${active
                     ? "bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                     : "text-white/55 hover:bg-white/8 hover:text-white/90"}`
                }
              >
                {active && (
                  <motion.div layoutId="sidebar-pill"
                    className="absolute inset-0 rounded-xl bg-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
                )}
                {active && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary-400" />
                )}
                <Icon className={`relative z-10 shrink-0 text-sm ${active ? "text-primary-300" : ""}`} />
                {(!collapsed || onClose) && (
                  <span className="relative z-10 text-sm font-medium truncate">{item.name}</span>
                )}
                {/* Tooltip when collapsed */}
                {collapsed && !onClose && (
                  <div className="absolute left-14 bg-neutral-900 text-white text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/10 dark:border-white/5 space-y-2">
          {(!collapsed || onClose) && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/8">
              <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user?.name || "Student"}</p>
                <p className="text-white/40 text-xs truncate">{user?.email || "student@app.com"}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 rounded-xl py-2.5 text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors duration-200
              ${collapsed && !onClose ? "justify-center px-0" : "px-3"}`}
          >
            <FaSignOutAlt className="text-sm shrink-0" />
            {(!collapsed || onClose) && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#080810] transition-colors duration-300">

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Mobile sidebar ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside key="mobile-sidebar"
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 h-full w-64 z-50 lg:hidden"
            style={{ background: "linear-gradient(180deg,#0c1033 0%,#0d0f1e 100%)" }}
          >
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="hidden lg:flex flex-col fixed top-0 left-0 h-full z-30 overflow-hidden"
        style={{ background: "linear-gradient(180deg,#0c1033 0%,#0d0f1e 100%)" }}
      >
        <SidebarContent />
      </motion.aside>

      {/* ── Main area ── */}
      <motion.div
        animate={{ marginLeft: sidebarW }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="flex-1 flex flex-col min-w-0 lg:ml-0"
        style={{ marginLeft: 0 }}
      >
        {/* ── Sticky top navbar ── */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 md:px-8 py-3.5
          bg-white/80 dark:bg-[#0d0f1e]/80 backdrop-blur-xl
          border-b border-neutral-200/60 dark:border-white/8
          shadow-[0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]"
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl
                bg-neutral-100 dark:bg-white/8 text-neutral-600 dark:text-neutral-300
                hover:bg-neutral-200 dark:hover:bg-white/15 transition-colors">
              <FaBars className="text-sm" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-neutral-800 dark:text-white">{pageName}</h1>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 hidden sm:block">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode"
              className="w-9 h-9 flex items-center justify-center rounded-xl
                bg-neutral-100 dark:bg-white/8 text-neutral-500 dark:text-neutral-300
                hover:bg-neutral-200 dark:hover:bg-white/15 transition-colors">
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.svg key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </motion.svg>
                ) : (
                  <motion.svg key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notification bell */}
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl
                bg-neutral-100 dark:bg-white/8 text-neutral-500 dark:text-neutral-300
                hover:bg-neutral-200 dark:hover:bg-white/15 transition-colors">
              <FaBell className="text-sm" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0d0f1e]" />
            </motion.button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
                {userInitial}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-neutral-800 dark:text-white leading-tight">{user?.name || "Student"}</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">Welcome back</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}

export default DashboardLayout;
