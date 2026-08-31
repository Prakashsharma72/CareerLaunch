import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaBookmark,
  FaChevronDown,
  FaRocket,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { getThemePreference, applyTheme } from "../../utils/helpers";

const NAV_LINKS = [
  { to: "/student/jobs", label: "Jobs" },
  { to: "/student/companies", label: "Companies" },
  { to: "/student/resources", label: "Resources" },
  { to: "/student/roadmap-generator", label: "Roadmaps" },
  { to: "/student/mock-interview", label: "Mock Interview" },
];

const USER_MENU = [
  { icon: FaTachometerAlt, label: "Dashboard", to: "/student/dashboard" },
  { icon: FaUser, label: "Profile", to: "/student/profile" },
  { icon: FaBookmark, label: "Saved Jobs", to: "/student/saved-jobs" },
];

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(getThemePreference);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropRef.current && !dropRef.current.contains(event.target)) {
        setDropOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDropOpen(false);
  }, [location.pathname]);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    applyTheme(next);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "auth/logout" });
    navigate("/login");
    setMobileOpen(false);
    setDropOpen(false);
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "U";
  const userFullName = user?.name ?? "User";
  const userEmail = user?.email ?? "";
  const userAvatar = user?.profileImage ?? null;

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-slate-800 bg-slate-950/85 backdrop-blur-xl shadow-lg shadow-slate-950/20"
            : "border-slate-800 bg-slate-950/85 backdrop-blur"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-950/30">
                <FaRocket className="text-sm text-white" />
              </div>
              <span className="text-base font-bold text-white">
                CareerLaunch <span className="text-blue-300">AI</span>
              </span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive ? "text-blue-300" : "text-slate-300 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <span className="absolute inset-0 -z-10 rounded-lg bg-white/5" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                aria-label="Toggle dark mode"
                onClick={toggleDark}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-slate-200 transition hover:border-blue-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    <FaRocket className="text-xs" />
                    Create Free Account
                  </Link>
                </>
              ) : (
                <div ref={dropRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setDropOpen((value) => !value)}
                    className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-2.5 py-1.5 text-sm font-medium text-slate-200 transition hover:border-blue-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold text-white">
                      {userAvatar ? <img src={userAvatar} alt="User avatar" className="h-full w-full object-cover" /> : userInitial}
                    </div>
                    <span className="max-w-24 truncate">{userFullName.split(" ")[0]}</span>
                    <FaChevronDown className="text-[10px]" />
                  </button>

                  <AnimatePresence>
                    {dropOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/60"
                      >
                        <div className="border-b border-slate-800 px-3 py-3">
                          <p className="truncate text-sm font-semibold text-white">{userFullName}</p>
                          <p className="truncate text-xs text-slate-400">{userEmail}</p>
                        </div>

                        {USER_MENU.map(({ icon: Icon, label, to }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setDropOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-200 transition hover:bg-slate-900 hover:text-white"
                          >
                            <Icon className="text-xs text-slate-400" />
                            {label}
                          </Link>
                        ))}

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 border-t border-slate-800 px-3 py-2.5 text-left text-sm text-rose-300 transition hover:bg-slate-900 hover:text-rose-200"
                        >
                          <FaSignOutAlt className="text-xs" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-slate-200 transition hover:border-blue-400 hover:text-white md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              {mobileOpen ? <FaTimes className="text-sm" /> : <FaBars className="text-sm" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-slate-800 bg-slate-950 px-4 py-4 md:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500">
                    <FaRocket className="text-sm text-white" />
                  </div>
                  <span className="text-sm font-bold text-white">CareerLaunch AI</span>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-blue-400 hover:text-white"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {user && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white">
                    {userAvatar ? <img src={userAvatar} alt="User avatar" className="h-full w-full object-cover" /> : userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{userFullName}</p>
                    <p className="truncate text-xs text-slate-400">{userEmail}</p>
                  </div>
                </div>
              )}

              <nav className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-xl px-3 py-3 text-sm font-medium transition ${
                        isActive ? "bg-blue-500/10 text-blue-300" : "text-slate-200 hover:bg-slate-900"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-auto space-y-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={toggleDark}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3 text-sm font-medium text-slate-200"
                >
                  <span>Theme</span>
                  <span>{darkMode ? "Light" : "Dark"}</span>
                </button>

                {!user ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3 text-center text-sm font-semibold text-slate-200"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-3 text-center text-sm font-semibold text-white"
                    >
                      Create Free Account
                    </Link>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-3 text-center text-sm font-semibold text-rose-200"
                  >
                    Sign out
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="h-16" aria-hidden="true" />
    </>
  );
}

export default Navbar;
