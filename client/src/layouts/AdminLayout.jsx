/**
 * AdminLayout.jsx — responsive admin shell
 *
 * Mobile  (< lg): hamburger → slide-in drawer from left, backdrop overlay
 * Desktop (lg+):  fixed 260px sidebar, content offset by ml-[260px]
 *
 * Full dark-mode support. No light-mode flash.
 */
import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getThemePreference, applyTheme } from "../utils/helpers";
import {
  FaTachometerAlt, FaBriefcase, FaBook,
  FaUsers, FaBars, FaTimes, FaSignOutAlt,
  FaUserShield, FaRocket, FaCog,
  FaPencilAlt, FaBuilding,
} from "react-icons/fa";

const MENU = [
  { name: "Dashboard",        icon: FaTachometerAlt, path: "/admin/dashboard"  },
  { name: "Manage Jobs",      icon: FaBriefcase,     path: "/admin/jobs"       },
  { name: "Manage Resources", icon: FaBook,          path: "/admin/resources"  },
  { name: "Manage Users",     icon: FaUsers,         path: "/admin/users"      },
  { name: "Manage Roadmaps",  icon: FaPencilAlt,     path: "/admin/roadmaps"   },
  { name: "Manage Companies", icon: FaBuilding,     path: "/admin/companies"  },
  { name: "API Settings",     icon: FaCog,           path: "/admin/settings"   },
];

const SIDEBAR_W = 240;

function SidebarContent({ location, setOpen, handleLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--cl-border)] px-5 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <FaRocket className="text-xs text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[var(--cl-text)]">CareerLaunch AI</p>
            <p className="text-[10px] text-[var(--cl-text-muted)]">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--cl-surface-soft)] text-[var(--cl-text-muted)] transition-colors hover:bg-[var(--cl-surface-elevated)] lg:hidden"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {MENU.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={() => `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${active
                ? "border border-[var(--cl-admin-active-strong)] bg-[var(--cl-admin-active)] text-[var(--cl-admin-active-text)] shadow-[0_10px_24px_-18px_rgba(109,40,217,0.55)]"
                : "text-[var(--cl-text-muted)] hover:bg-[var(--cl-surface-soft)] hover:text-[var(--cl-text)]"}`}
            >
              {active && <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--cl-admin-active-text)]" />}
              <Icon className={`shrink-0 text-sm ${active ? "text-[var(--cl-admin-active-text)]" : "text-[var(--cl-text-muted)]"}`} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-[var(--cl-border)] p-3">
        <div className="flex items-center gap-3 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--cl-primary)]">
            <FaUserShield className="text-sm text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--cl-text)]">Administrator</p>
            <p className="truncate text-xs text-[var(--cl-text-muted)]">System Manager</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-xl border border-[var(--cl-danger)]/20 bg-[var(--cl-danger-soft)] py-2.5 text-sm font-semibold text-[var(--cl-danger)] transition-colors hover:bg-[var(--cl-danger)] hover:text-[var(--cl-button-text)]"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <FaSignOutAlt className="text-sm" /> Logout
          </span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(getThemePreference);

  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  /* close drawer on route change */
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const pageName = MENU.find(m => location.pathname.startsWith(m.path))?.name ?? "Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-[#080810] transition-colors">

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Mobile sidebar drawer ── */}
      <AnimatePresence>
        {open && (
          <motion.aside key="drawer"
            initial={{ x: -SIDEBAR_W }} animate={{ x: 0 }} exit={{ x: -SIDEBAR_W }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed left-0 top-0 z-50 h-full bg-[var(--cl-sidebar)] lg:hidden"
            style={{ width: SIDEBAR_W }}>
            <SidebarContent location={location} setOpen={setOpen} handleLogout={handleLogout} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar (always visible lg+) ── */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full flex-col bg-[var(--cl-sidebar)] lg:flex"
        style={{ width: SIDEBAR_W }}>
        <SidebarContent location={location} setOpen={setOpen} handleLogout={handleLogout} />
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col bg-[var(--cl-page)] lg:ml-60">

        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--cl-border)] bg-[var(--cl-surface)] px-4 sm:px-6 lg:px-7">

          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button onClick={() => setOpen(true)} aria-label="Open menu"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--cl-surface-muted)] text-[var(--cl-text-muted)] transition-colors shrink-0">
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
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--cl-surface-muted)] text-[var(--cl-text-muted)] transition-colors"
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.svg
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>

            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <FaUserShield className="text-white text-sm" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight text-[var(--cl-text)]">Administrator</p>
                <p className="text-xs text-[var(--cl-text-muted)]">System Manager</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
