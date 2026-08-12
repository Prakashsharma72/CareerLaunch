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
import {
  FaTachometerAlt, FaBriefcase, FaBook,
  FaUsers, FaBars, FaTimes, FaSignOutAlt,
  FaUserShield, FaRocket, FaChevronLeft, FaCog,
  FaPencilAlt,
} from "react-icons/fa";

const MENU = [
  { name: "Dashboard",        icon: FaTachometerAlt, path: "/admin/dashboard"  },
  { name: "Manage Jobs",      icon: FaBriefcase,     path: "/admin/jobs"       },
  { name: "Manage Resources", icon: FaBook,          path: "/admin/resources"  },
  { name: "Manage Users",     icon: FaUsers,         path: "/admin/users"      },
  { name: "Manage Roadmaps",  icon: FaPencilAlt,     path: "/admin/roadmaps"   },
  { name: "API Settings",     icon: FaCog,           path: "/admin/settings"   },
];

const SIDEBAR_W = 260;

export default function AdminLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  /* close drawer on route change */
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const pageName = MENU.find(m => location.pathname.startsWith(m.path))?.name ?? "Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ── shared sidebar content ── */
  function SidebarContent() {
    return (
      <div className="flex flex-col h-full">

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <FaRocket className="text-white text-xs" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">CareerLaunch AI</p>
              <p className="text-white/40 text-[10px]">Admin Panel</p>
            </div>
          </div>
          {/* close btn — mobile only */}
          <button onClick={() => setOpen(false)}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg
              bg-white/10 text-white/60 hover:bg-white/20 transition-colors shrink-0">
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {MENU.map(item => {
            const Icon   = item.icon;
            const active = location.pathname.startsWith(item.path);
            return (
              <NavLink key={item.path} to={item.path}
                className={() => `relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 text-sm font-medium
                  ${active
                    ? "bg-indigo-500/25 text-white border border-indigo-400/20"
                    : "text-white/55 hover:bg-white/8 hover:text-white/90"}`}>
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-indigo-400" />
                )}
                <Icon className={`shrink-0 text-sm ${active ? "text-indigo-300" : ""}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Admin badge + logout */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <FaUserShield className="text-white text-sm" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">Administrator</p>
              <p className="text-white/40 text-xs truncate">System Manager</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
              bg-red-500/15 text-red-400 hover:bg-red-500/25 hover:text-red-300 border border-red-500/20
              transition-colors">
            <FaSignOutAlt className="text-sm" /> Logout
          </button>
        </div>
      </div>
    );
  }

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
            className="fixed top-0 left-0 h-full z-50 lg:hidden"
            style={{ width: SIDEBAR_W, background: "linear-gradient(180deg,#1e1b4b 0%,#1a1035 100%)" }}>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar (always visible lg+) ── */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full z-30"
        style={{ width: SIDEBAR_W, background: "linear-gradient(180deg,#1e1b4b 0%,#1a1035 100%)" }}>
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col lg:ml-65 min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between
          px-4 sm:px-6 lg:px-8 py-3
          bg-white dark:bg-[#0d0f1e] border-b border-neutral-200 dark:border-white/8
          shadow-sm">

          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button onClick={() => setOpen(true)} aria-label="Open menu"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl
                bg-neutral-100 dark:bg-white/8 text-neutral-600 dark:text-neutral-300
                hover:bg-neutral-200 dark:hover:bg-white/15 transition-colors shrink-0">
              <FaBars className="text-sm" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate">
                {pageName}
              </h1>
              <p className="text-xs text-neutral-400 hidden sm:block">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          {/* Right: admin badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <FaUserShield className="text-white text-sm" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-neutral-800 dark:text-white leading-tight">Administrator</p>
              <p className="text-xs text-neutral-400">System Manager</p>
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
