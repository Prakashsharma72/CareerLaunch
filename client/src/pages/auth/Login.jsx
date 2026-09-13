import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaExclamationCircle,
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import { getThemePreference, applyTheme } from "../../utils/helpers";

/* ─── Ripple hook ─── */
function useRipple() {
  const [ripples, setRipples] = useState([]);
  const addRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((r) => [...r, { x, y, id }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
  }, []);
  return { ripples, addRipple };
}

/* ─── Floating orb ─── */
function Orb({ style, duration = 8, delay = 0 }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={style}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.08, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ─── Animated input ─── */
function FloatingInput({
  id, label, type = "text", name, value, onChange,
  placeholder, required, icon: Icon, suffix, autoComplete,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block pl-1 text-sm font-semibold text-[var(--cl-text-muted)]"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200 pointer-events-none
              ${focused ? "text-[var(--cl-primary)]" : "text-[var(--cl-text-soft)]"}`}
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full pl-12 ${suffix ? "pr-18" : "pr-4"} py-3.5 rounded-2xl border text-sm font-medium
            bg-[var(--cl-surface-soft)] backdrop-blur-sm
            text-[var(--cl-text)] placeholder:text-[var(--cl-text-soft)]
            transition-all duration-300 outline-none
            ${focused
              ? "border-[var(--cl-primary)] shadow-[0_0_0_4px_var(--cl-ring)]"
              : "border-[var(--cl-border)] hover:border-[var(--cl-primary)]"
            } focus:border-[var(--cl-primary)] focus:ring-2 focus:ring-[var(--cl-ring)]`}
        />
        {suffix}
      </div>
    </div>
  );
}

/* ─── Main component ─── */
function Login() {
  const { login, googleLogin, linkGoogleAccount } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => import.meta.env.VITE_GOOGLE_CLIENT_ID
    ? ""
    : "Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to the frontend environment.");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [darkMode, setDarkMode] = useState(getThemePreference);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);
  const googleButtonRef = useRef(null);
  const { ripples: btnRipples, addRipple: addBtnRipple } = useRipple();

  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  const handleGoogleCredential = useCallback(async (response) => {
    setError("");
    setLoading(true);
    try {
      const data = await googleLogin(response.credential);
      navigate(data.user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    } catch (err) {
      if (err.response?.data?.code === "ACCOUNT_LINK_REQUIRED") {
        setPendingGoogleCredential(response.credential);
      }
      setError(err.response?.data?.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [googleLogin, navigate]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return undefined;
    }

    let cancelled = false;
    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = "";
      const width = Math.min(400, Math.max(200, googleButtonRef.current.clientWidth));
      window.google.accounts.id.initialize({ client_id: clientId, callback: handleGoogleCredential });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard", theme: "filled_black", size: "large", text: "continue_with", shape: "rectangular", width,
      });
    };
    const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') || document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    if (!script.parentNode) document.head.appendChild(script);
    if (window.google?.accounts?.id) renderGoogleButton();
    return () => { cancelled = true; script.onload = null; };
  }, [handleGoogleCredential]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      if (data?.token) {
        if (pendingGoogleCredential) {
          await linkGoogleAccount(pendingGoogleCredential);
          setPendingGoogleCredential(null);
        }
        if (data.user?.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── animation variants ── */
  const pageVariants = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.96, transition: { duration: 0.25 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.07, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="login-page"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="min-h-screen relative overflow-x-hidden overflow-y-auto flex items-start sm:items-center justify-center p-4 py-6 sm:py-8 font-sans
          bg-[var(--cl-page)]"
      >
        {/* ── Animated gradient mesh background ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {/* top-right blob */}
          <motion.div
            className="absolute -top-40 -right-40 w-150 h-150 rounded-full opacity-30 dark:opacity-20"
            style={{ background: "radial-gradient(circle, #0ba5ff 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.15, 1], rotate: [0, 15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* bottom-left blob */}
          <motion.div
            className="absolute -bottom-40 -left-40 w-125 h-125 rounded-full opacity-25 dark:opacity-15"
            style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          {/* center shimmer */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full opacity-10 dark:opacity-5"
            style={{ background: "radial-gradient(circle, #38bfff 0%, transparent 60%)" }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Floating orbs */}
          <Orb style={{ top: "15%", left: "10%", width: 60, height: 60, background: "rgba(11,165,255,0.15)", filter: "blur(16px)" }} duration={7} />
          <Orb style={{ top: "70%", right: "8%", width: 80, height: 80, background: "rgba(139,92,246,0.15)", filter: "blur(20px)" }} duration={9} delay={1.5} />
          <Orb style={{ top: "40%", left: "5%", width: 40, height: 40, background: "rgba(56,191,255,0.2)", filter: "blur(12px)" }} duration={6} delay={0.8} />
          <Orb style={{ bottom: "20%", right: "15%", width: 50, height: 50, background: "rgba(139,92,246,0.2)", filter: "blur(14px)" }} duration={8} delay={3} />

          {/* grid lines */}
          <div
            className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(11,165,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,165,255,1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* ── Dark mode toggle ── */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle dark mode"
          className="absolute top-5 right-5 z-30 w-10 h-10 rounded-full flex items-center justify-center
            bg-[var(--cl-surface)]/80 backdrop-blur-xl border border-[var(--cl-border)]
            text-[var(--cl-text)] shadow-[var(--cl-shadow)] hover:shadow-xl transition-all duration-300"
        >
          <AnimatePresence mode="wait">
            {darkMode ? (
              <motion.svg key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </motion.svg>
            ) : (
              <motion.svg key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.25 }} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        {/* ── Card ── */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-[420px]"
        >
          <div className="relative rounded-3xl
            bg-[var(--cl-surface)]/80
            backdrop-blur-2xl
            border border-[var(--cl-border)]
            shadow-[var(--cl-shadow)]
            p-5 sm:p-6 md:p-7"
          >
            {/* inner glass sheen */}
            <div className="absolute inset-0 bg-linear-to-br from-white/60 via-transparent to-transparent dark:from-white/3 dark:to-transparent pointer-events-none rounded-3xl" />

            {/* ── Logo & header ── */}
            <motion.div variants={itemVariants} className="text-center mb-3">
              <motion.div
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-2 relative mx-auto"
                style={{ background: "linear-gradient(135deg, #0ba5ff 0%, #8b5cf6 100%)" }}
                whileHover={{ rotate: [0, -6, 6, 0], scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                {/* SVG rocket illustration */}
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path d="M14 3C14 3 19 7 19 14C19 18.4 16.5 21.5 14 23C11.5 21.5 9 18.4 9 14C9 7 14 3 14 3Z" fill="white" fillOpacity="0.9"/>
                  <path d="M14 3C14 3 19 7 19 14L14 16L9 14C9 7 14 3 14 3Z" fill="white" fillOpacity="0.3"/>
                  <circle cx="14" cy="13" r="2.5" fill="white" fillOpacity="0.95"/>
                  <path d="M9 17L6 21" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M19 17L22 21" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M11 21L10 25" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M17 21L18 25" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {/* glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: "linear-gradient(135deg, #0ba5ff, #8b5cf6)", filter: "blur(12px)", opacity: 0.5 }}
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              </motion.div>
              <h1 className="text-[28px] leading-tight font-bold tracking-tight text-[var(--cl-text)]">
                Welcome back
              </h1>
              <p className="text-sm text-[var(--cl-text-muted)] mt-1">
                Sign in to your CareerLaunch AI account
              </p>
            </motion.div>

            {/* ── Google sign-in ── */}
            <motion.div variants={itemVariants} className="mx-auto mb-3 w-full min-w-0 overflow-hidden" ref={googleButtonRef} aria-label="Continue with Google" />

            {/* ── Email divider ── */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-[var(--cl-border)] to-transparent" />
              <span className="text-xs font-medium text-[var(--cl-text-soft)] px-1">or continue with email</span>
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-[var(--cl-border)] to-transparent" />
            </motion.div>

            {/* ── Error banner ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.25 }}
                  role="alert"
                  className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-xl
                    bg-red-50/80 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 backdrop-blur-sm"
                >
                  <FaExclamationCircle className="text-red-500 mt-0.5 shrink-0 text-sm" />
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Form ── */}
            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-3" noValidate>

              {/* Email */}
              <FloatingInput
                id="email"
                label="Email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
                icon={FaEnvelope}
              />

              {/* Password */}
              <div className="space-y-1.5">
                <FloatingInput
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  icon={FaLock}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--cl-text-soft)] hover:text-[var(--cl-text)] transition-colors focus:outline-none focus-visible:text-[var(--cl-primary)]"
                    >
                      {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                    </button>
                  }
                />

              </div>

              {/* Remember me & forgot */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                      aria-label="Remember me"
                    />
                    <div className="w-4 h-4 rounded border-2 border-[var(--cl-border)] peer-checked:bg-[var(--cl-primary)] peer-checked:border-[var(--cl-primary)] transition-colors duration-200 flex items-center justify-center">
                      {rememberMe && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-[var(--cl-text-muted)] group-hover:text-[var(--cl-text)] transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[var(--cl-primary)] font-medium hover:opacity-80 transition-colors focus:outline-none focus-visible:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                onMouseDown={addBtnRipple}
                whileHover={!loading ? { y: -1, boxShadow: "0 12px 32px rgba(11,165,255,0.35)" } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                style={{
          backgroundImage: "linear-gradient(#020617, #020617), linear-gradient(90deg, #0ba5ff, #8b5cf6)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        }}
        className="group relative overflow-hidden w-full rounded-2xl border-2 border-transparent py-3 text-white
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-300 ease-out
                  hover:scale-[1.02] hover:shadow-[0_18px_80px_rgba(59,130,246,0.24)]
                  active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                  focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 mt-1"
              >
                {/* shimmer overlay */}
                {!loading && (
                  <motion.span
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                    aria-hidden="true"
                  />
                )}
                {/* btn ripples */}
                {btnRipples.map((r) => (
                  <span
                    key={r.id}
                    className="absolute rounded-full bg-white/25 pointer-events-none"
                    style={{
                      left: r.x - 40, top: r.y - 40, width: 80, height: 80,
                      animation: "ripple-out 0.6s ease-out forwards",
                    }}
                    aria-hidden="true"
                  />
                ))}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <motion.span
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                      />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </span>
              </motion.button>
            </motion.form>

            <motion.div variants={itemVariants} className="mt-3 flex items-center justify-center gap-4 text-xs">
              <Link to="/" className="text-[var(--cl-text-muted)] hover:text-[var(--cl-primary)] transition-colors focus:outline-none focus-visible:underline">
                Back to Home
              </Link>
              <span className="text-[var(--cl-border-strong)]" aria-hidden="true">•</span>
              <Link to="/register" className="font-semibold text-[var(--cl-primary)] hover:opacity-80 transition-colors focus:outline-none focus-visible:underline">
                Create account
              </Link>
            </motion.div>
          </div>

          {/* ── Footer ── */}
          <motion.p
            variants={itemVariants}
            className="text-center text-[var(--cl-text-soft)] text-[11px] mt-3"
          >
            By signing in, you agree to our{" "}
            <Link to="#" className="hover:text-[var(--cl-primary)] transition-colors">Terms of Service</Link>
            {" "}and{" "}
            <Link to="#" className="hover:text-[var(--cl-primary)] transition-colors">Privacy Policy</Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Login;
