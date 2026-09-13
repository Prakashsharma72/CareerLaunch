import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { getThemePreference, applyTheme } from "../utils/helpers";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTachometerAlt, FaUser, FaBriefcase, FaBook,
  FaRoad, FaRobot,
  FaSignOutAlt, FaBars, FaTimes, FaRocket,
  FaChevronLeft, FaBuilding,
} from "react-icons/fa";
import { useSelector } from "react-redux";

const SIDEBAR_W   = 232;
const SIDEBAR_COL = 72;

const menuItems = [
  { name: "Dashboard",        icon: FaTachometerAlt, path: "/student/dashboard" },
  { name: "Profile",          icon: FaUser,          path: "/student/profile" },
  { name: "Jobs",             icon: FaBriefcase,     path: "/student/jobs" },
  { name: "Companies",        icon: FaBuilding,      path: "/student/companies" },
  { name: "Resources",        icon: FaBook,          path: "/student/resources" },
  { name: "Saved Companies",  icon: FaBuilding,      path: "/student/saved-companies" },
  { name: "Roadmap",          icon: FaRoad,          path: "/student/roadmap-generator" },
  { name: "Mock Interview",   icon: FaRobot,         path: "/student/mock-interview" },
];

function SidebarContent({
  onClose,
  collapsed,
  setCollapsed,
  location,
  user,
  userInitial,
  handleLogout,
}) {
  const isMobileDrawer = !!onClose;
  const showLabels = isMobileDrawer || !collapsed;

  return (
    <div className="flex h-full flex-col bg-[var(--cl-sidebar)]">
      <div className={`flex items-center border-b border-[var(--cl-border)] ${showLabels ? "justify-between px-4 py-4" : "justify-center px-0 py-5"}`}>
        {showLabels ? (
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
              <FaRocket className="text-xs text-white" />
            </div>
            <span className="truncate text-sm font-bold text-[var(--cl-text)]">CareerLaunch AI</span>
          </div>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
            <FaRocket className="text-xs text-white" />
          </div>
        )}

        {isMobileDrawer ? (
          <button onClick={onClose} aria-label="Close sidebar" className="ml-2 shrink-0 p-1 text-[var(--cl-text-muted)] transition-colors hover:text-[var(--cl-text)]">
            <FaTimes className="text-sm" />
          </button>
        ) : (
          <button onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar" className="hidden shrink-0 p-1 text-[var(--cl-text-muted)] transition-colors hover:text-[var(--cl-text)] lg:flex">
            <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <FaChevronLeft className="text-xs" />
            </motion.span>
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 px-2 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = item.name === "Roadmap"
            ? location.pathname.startsWith("/student/roadmap")
            : location.pathname.startsWith(item.path);
          return (
            <NavLink key={item.path} to={item.path} className={() => `group relative flex items-center gap-3 rounded-lg transition-all duration-200 ${!showLabels ? "justify-center px-0 py-3" : "px-3 py-2.5"} ${active ? "border border-[var(--cl-primary)]/20 bg-[var(--cl-primary-soft)] text-[var(--cl-primary)] shadow-sm" : "text-[var(--cl-text-muted)] hover:bg-[var(--cl-surface-soft)] hover:text-[var(--cl-text)]"}`}>
              {active && showLabels && (
                <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--cl-primary)]" />
              )}
              <Icon className={`relative z-10 shrink-0 text-sm ${active ? "text-[var(--cl-primary)]" : "text-current"}`} />
              {showLabels && <span className="relative z-10 truncate text-sm font-medium">{item.name}</span>}
              {!showLabels && (
                <div className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-[var(--cl-border)] p-2">
        {showLabels && (
          <div className="flex items-center gap-3 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--cl-primary)] text-xs font-bold text-[var(--cl-button-text)]">{userInitial}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--cl-text)]">{user?.name || "Student"}</p>
              <p className="truncate text-xs text-[var(--cl-text-muted)]">{user?.email || "student@app.com"}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className={`flex w-full items-center gap-2.5 rounded-xl py-2.5 text-[var(--cl-danger)] transition-colors duration-200 hover:bg-[var(--cl-danger-soft)] hover:text-[var(--cl-danger)] ${!showLabels ? "justify-center px-0" : "px-3"}`}>
          <FaSignOutAlt className="shrink-0 text-sm" />
          {showLabels && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);
  const [darkMode,   setDarkMode]   = useState(getThemePreference);

  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  /* close mobile sidebar on route change */
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  /* track whether we're on a "desktop" breakpoint (md = 768px) */
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

  /* auto-collapse sidebar on tablet (md), expand on desktop (lg+) */
  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      setIsDesktop(w >= 768);
      if (w >= 768 && w < 1024) {
        // Tablet: collapse to icon-only
        setCollapsed(true);
      } else if (w >= 1024) {
        // Desktop: restore full sidebar if it was auto-collapsed
        // (only if user hasn't manually collapsed)
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sidebarW    = collapsed ? SIDEBAR_COL : SIDEBAR_W;
  const userInitial = (user?.name || "S")[0].toUpperCase();
  const pageName    = location.pathname.startsWith("/student/roadmap")
    ? "Roadmap"
    : menuItems.find((m) => location.pathname.startsWith(m.path))?.name ?? "Dashboard";

  return (
    <div className="cl-page flex min-h-screen transition-colors duration-300">

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Mobile sidebar drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside key="mobile-sidebar"
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 z-50 h-full w-64 bg-[var(--cl-sidebar)] lg:hidden"
          >
            <SidebarContent onClose={() => setMobileOpen(false)} collapsed={collapsed} setCollapsed={setCollapsed} location={location} user={user} userInitial={userInitial} handleLogout={handleLogout} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop / Tablet sidebar ── */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed left-0 top-0 z-30 hidden h-full shrink-0 flex-col overflow-hidden bg-[var(--cl-sidebar)] md:flex"
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} location={location} user={user} userInitial={userInitial} handleLogout={handleLogout} />
      </motion.aside>

      {/* ── Main content area ── */}
      {/* Mobile (< md): no margin at all — sidebar is a drawer overlay.
          md+: margin equals sidebar width, animated as sidebar collapses/expands. */}
      <motion.div
        animate={{ marginLeft: isDesktop ? sidebarW : 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="flex min-w-0 flex-1 flex-col bg-[var(--cl-page)]"
        style={{ marginLeft: 0 }}
      >
        {/* ── Sticky top header ── */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--cl-border)] bg-[var(--cl-surface)] px-4 sm:px-6 lg:px-7"
        >
          {/* Left: hamburger + page title */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Hamburger — mobile only (hidden md+, sidebar takes over) */}
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--cl-surface-muted)] text-[var(--cl-text-muted)] transition-colors shrink-0">
              <FaBars className="text-sm" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-[var(--cl-text)] sm:text-base">
                {pageName}
              </h1>
              <p className="hidden text-xs text-[var(--cl-text-muted)] sm:block">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Dark mode toggle */}
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--cl-surface-muted)] text-[var(--cl-text-muted)] transition-colors">
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.svg key="sun"
                    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </motion.svg>
                ) : (
                  <motion.svg key="moon"
                    initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notification bell */}
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--cl-surface-muted)] text-[var(--cl-text-muted)] transition-colors">
              <span className="text-sm">🔔</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full
                border-2 border-white dark:border-[#0d0f1e]" />
            </motion.button>

            {/* Avatar + name */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
                {userInitial}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight text-[var(--cl-text)]">
                  {user?.name || "Student"}
                </p>
                <p className="text-xs text-[var(--cl-text-muted)]">Welcome back</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}

export default DashboardLayout;
