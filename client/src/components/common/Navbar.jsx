import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars, FaTimes, FaUser, FaSignOutAlt,
  FaBell, FaRocket, FaChevronDown,
  FaTachometerAlt, FaBookmark, FaFileAlt,
} from "react-icons/fa";
  
/* ── nav links ── */
const NAV_LINKS = [
  { to: "/student/jobs",              label: "Jobs"      },
  { to: "/student/resources",         label: "Resources" },
  { to: "/student/resume-analyzer",   label: "Resume AI" },
  { to: "/student/roadmap-generator", label: "Roadmaps"  },
];

const USER_MENU = [
  { icon: FaTachometerAlt, label: "Dashboard",  to: "/student/dashboard"       },
  { icon: FaUser,          label: "Profile",    to: "/student/profile"         },
  { icon: FaBookmark,      label: "Saved Jobs", to: "/student/saved-jobs"      },
  { icon: FaFileAlt,       label: "Resume AI",  to: "/student/resume-analyzer" },
];

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, bootstrapping } = useSelector((s) => s.auth);

  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const [darkMode,   setDarkMode]   = useState(
    () => document.documentElement.classList.contains("dark")
  );
  const dropRef = useRef(null);

  /* scroll → solid background after 10px */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* close on route change */
  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  /* dark mode */
  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
  };

  /* logout — unchanged */
  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "auth/logout" });
    navigate("/login");
    setMobileOpen(false);
    setDropOpen(false);
  };

  const userInitial  = user?.name?.charAt(0).toUpperCase() ?? "U";
  const userFullName = user?.name  ?? "User";
  const userEmail    = user?.email ?? "";
  const userAvatar   = user?.profileImage ?? null;

  return (
    <>
      {/* ══════ NAVBAR ══════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b
        ${scrolled
          ? "bg-white/95 dark:bg-[#0d0f1e]/95 backdrop-blur-xl border-neutral-200/80 dark:border-white/10 shadow-[0_2px_20px_rgba(0,0,0,0.08)]"
          : "bg-white dark:bg-[#0d0f1e] border-neutral-200 dark:border-white/10"
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md shrink-0"
                style={{ background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}
              >
                <FaRocket className="text-white text-sm" />
              </motion.div>
              <span className="font-bold text-base text-neutral-900 dark:text-white hidden sm:inline">
                CareerLaunch{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-500 to-accent-500">AI</span>
              </span>
            </Link>

            {/* ── Desktop nav links ── */}
            <div className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to}
                  className={({ isActive }) =>
                    `relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/8"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <motion.div layoutId="nav-active-pill"
                          className="absolute inset-0 rounded-lg bg-primary-50 dark:bg-primary-500/15 -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* ── Desktop actions ── */}
            <div className="hidden md:flex items-center gap-1.5">

              {/* Dark mode */}
              <motion.button onClick={toggleDark} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                aria-label="Toggle dark mode"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 dark:text-neutral-300
                  hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors">
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.svg key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </motion.svg>
                  ) : (
                    <motion.svg key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>

              {user ? (
                <>
                  {/* Bell */}
                  <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    className="relative w-9 h-9 flex items-center justify-center rounded-xl
                      text-neutral-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors">
                    <FaBell className="text-sm" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0d0f1e]" />
                  </motion.button>

                  {/* Profile dropdown */}
                  <div ref={dropRef} className="relative">
                    <motion.button onClick={() => setDropOpen(!dropOpen)}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border
                        border-neutral-200 dark:border-white/10 bg-white dark:bg-white/5
                        hover:border-primary-300 dark:hover:border-primary-500/40 transition-all">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"
                        style={!userAvatar ? { background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" } : {}}>
                        {userAvatar
                          ? <img src={userAvatar} alt="avatar" loading="lazy" className="w-full h-full object-cover" />
                          : userInitial}
                      </div>
                      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 max-w-20 truncate">
                        {userFullName.split(" ")[0]}
                      </span>
                      <motion.span animate={{ rotate: dropOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <FaChevronDown className="text-[10px] text-neutral-400" />
                      </motion.span>
                    </motion.button>

                    <AnimatePresence>
                      {dropOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute right-0 top-full mt-2 w-52
                            bg-white dark:bg-[#0d0f1e]
                            border border-neutral-200 dark:border-white/10
                            rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)]
                            overflow-hidden p-1.5 z-50">
                          <div className="px-3 py-2.5 mb-1 border-b border-neutral-100 dark:border-white/8">
                            <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{userFullName}</p>
                            <p className="text-xs text-neutral-400 truncate">{userEmail}</p>
                          </div>
                          {USER_MENU.map(({ icon: Icon, label, to }) => (
                            <Link key={to} to={to} onClick={() => setDropOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
                                text-neutral-700 dark:text-neutral-300
                                hover:bg-neutral-50 dark:hover:bg-white/8
                                hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                              <Icon className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0" />
                              {label}
                            </Link>
                          ))}
                          <div className="border-t border-neutral-100 dark:border-white/8 mt-1 pt-1">
                            <button onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
                                text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                              <FaSignOutAlt className="text-xs shrink-0" />
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login"
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300
                      border border-neutral-200 dark:border-white/10
                      hover:bg-neutral-100 dark:hover:bg-white/8 hover:border-neutral-300 dark:hover:border-white/20 transition-all">
                    Sign in
                  </Link>
                  <motion.div whileHover={{ y: -1, boxShadow: "0 8px 24px rgba(11,165,255,0.35)" }} whileTap={{ scale: 0.97 }}>
                    <Link to="/register"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white
                        bg-linear-to-r from-primary-500 to-accent-500 shadow-md transition-shadow">
                      <FaRocket className="text-xs" /> Get Started
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <motion.button onClick={() => setMobileOpen(!mobileOpen)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl
                text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-white/8
                hover:bg-neutral-200 dark:hover:bg-white/15 transition-colors">
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <FaTimes className="text-sm" />
                  </motion.span>
                ) : (
                  <motion.span key="bars" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <FaBars className="text-sm" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ══════ MOBILE DRAWER ══════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)} />

            <motion.div key="drawer"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full w-80 z-50 md:hidden flex flex-col
                bg-white dark:bg-[#0d0f1e]
                border-l border-neutral-200 dark:border-white/10 shadow-2xl">

              {/* header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-white/8">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
                    <FaRocket className="text-white text-xs" />
                  </div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">CareerLaunch AI</span>
                </div>
                <button onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-white/8 text-neutral-500 dark:text-neutral-400">
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {/* user info */}
              {user && (
                <div className="px-5 py-4 border-b border-neutral-100 dark:border-white/8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 overflow-hidden"
                    style={!userAvatar ? { background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" } : {}}>
                    {userAvatar
                      ? <img src={userAvatar} alt="avatar" loading="lazy" className="w-full h-full object-cover" />
                      : userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{userFullName}</p>
                    <p className="text-xs text-neutral-400 truncate">{userEmail}</p>
                  </div>
                </div>
              )}

              {/* links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div key={link.to}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}>
                    <NavLink to={link.to} onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-primary-50 dark:bg-primary-500/15 text-primary-700 dark:text-primary-400 border border-primary-200/60 dark:border-primary-500/25"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/8"
                        }`
                      }>
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}

                {user && (
                  <>
                    <div className="pt-3 pb-1 px-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Account</p>
                    </div>
                    {USER_MENU.map(({ icon: Icon, label, to }, i) => (
                      <motion.div key={to}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (NAV_LINKS.length + i) * 0.05, duration: 0.3 }}>
                        <Link to={to} onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                            text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/8 transition-colors">
                          <Icon className="text-xs text-neutral-400 shrink-0" />
                          {label}
                        </Link>
                      </motion.div>
                    ))}
                  </>
                )}
              </nav>

              {/* footer */}
              <div className="px-3 pb-6 pt-3 border-t border-neutral-100 dark:border-white/8 space-y-2">
                {/* dark mode toggle */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-50 dark:bg-white/5">
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Dark mode</span>
                  <button onClick={toggleDark}
                    className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? "bg-primary-500" : "bg-neutral-200 dark:bg-white/15"}`}>
                    <motion.div animate={{ x: darkMode ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>

                {user ? (
                  <button onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
                      text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                    <FaSignOutAlt className="text-xs" /> Sign out
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)}
                      className="block text-center py-3 rounded-xl text-sm font-semibold
                        border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300
                        hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                      Sign in
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white
                        bg-linear-to-r from-primary-500 to-accent-500 shadow-md">
                      <FaRocket className="text-xs" /> Get Started Free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* spacer */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
}

export default Navbar;
