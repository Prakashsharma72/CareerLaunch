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
            ? "border-[var(--cl-border)] bg-[var(--cl-surface)]/80 backdrop-blur-xl shadow-[var(--cl-shadow)]"
            : "border-[var(--cl-border)] bg-[var(--cl-surface)]/75 backdrop-blur"
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-950/30">
                <FaRocket className="text-sm text-white" />
              </div>
              <span className="text-base font-bold text-[var(--cl-text)]">
                CareerLaunch <span className="text-[var(--cl-primary)]">AI</span>
              </span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive ? "text-[var(--cl-primary)]" : "text-[var(--cl-text-muted)] hover:text-[var(--cl-text)]"
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
                aria-label="Toggle light and dark theme"
                onClick={toggleDark}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] text-[var(--cl-text)] transition hover:border-[var(--cl-primary)] hover:text-[var(--cl-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cl-focus)]"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--cl-text)] transition hover:border-[var(--cl-primary)] hover:text-[var(--cl-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cl-focus)]"
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
                    className="flex items-center gap-2 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-2.5 py-1.5 text-sm font-medium text-[var(--cl-text)] transition hover:border-[var(--cl-primary)] hover:text-[var(--cl-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cl-focus)]"
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
                        className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] shadow-[var(--cl-shadow)]"
                      >
                        <div className="border-b border-[var(--cl-border)] px-3 py-3">
                          <p className="truncate text-sm font-semibold text-[var(--cl-text)]">{userFullName}</p>
                          <p className="truncate text-xs text-[var(--cl-text-muted)]">{userEmail}</p>
                        </div>

                        {USER_MENU.map(({ icon: Icon, label, to }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setDropOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--cl-text)] transition hover:bg-[var(--cl-surface-soft)] hover:text-[var(--cl-text)]"
                          >
                            <Icon className="text-xs text-[var(--cl-text-muted)]" />
                            {label}
                          </Link>
                        ))}

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 border-t border-[var(--cl-border)] px-3 py-2.5 text-left text-sm text-[var(--cl-danger)] transition hover:bg-[var(--cl-surface-soft)]"
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
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] text-[var(--cl-text)] transition hover:border-[var(--cl-primary)] hover:text-[var(--cl-text)] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cl-focus)]"
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
              className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-[var(--cl-border)] bg-[var(--cl-surface)] px-4 py-4 md:hidden"
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
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--cl-border)] text-[var(--cl-text-muted)] transition hover:border-[var(--cl-primary)] hover:text-[var(--cl-text)]"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {user && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] p-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white">
                    {userAvatar ? <img src={userAvatar} alt="User avatar" className="h-full w-full object-cover" /> : userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--cl-text)]">{userFullName}</p>
                    <p className="truncate text-xs text-[var(--cl-text-muted)]">{userEmail}</p>
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
                        isActive ? "bg-[var(--cl-primary-soft)] text-[var(--cl-primary)]" : "text-[var(--cl-text)] hover:bg-[var(--cl-surface-soft)]"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-auto space-y-3 border-t border-[var(--cl-border)] pt-4">
                <button
                  type="button"
                  onClick={toggleDark}
                  aria-label="Toggle light and dark theme"
                  className="flex w-full items-center justify-between rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-3 text-sm font-medium text-[var(--cl-text)]"
                >
                  <span>Theme</span>
                  <span>{darkMode ? "Light" : "Dark"}</span>
                </button>

                {!user ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-3 text-center text-sm font-semibold text-[var(--cl-text)]"
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
