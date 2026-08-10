import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaGoogle, FaGithub, FaExclamationCircle,
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import { getThemePreference, applyTheme } from "../../utils/helpers";

/* ─── Password strength helper ─── */
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too short", color: "#ef4444" },
    { label: "Weak", color: "#f97316" },
    { label: "Fair", color: "#eab308" },
    { label: "Good", color: "#22c55e" },
    { label: "Strong", color: "#0ba5ff" },
  ];
  return { score, ...map[score] };
}

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

/* ─── Social button ─── */
function SocialButton({ icon: Icon, label, onClick }) {
  const { ripples, addRipple } = useRipple();
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => { addRipple(e); onClick?.(); }}
      aria-label={`Sign in with ${label}`}
      className="relative overflow-hidden flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl border border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-md text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-white/20 dark:hover:bg-white/10 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/30 animate-ping pointer-events-none"
          style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40 }}
        />
      ))}
      <Icon className="text-base" />
      <span>{label}</span>
    </motion.button>
  );
}

/* ─── Animated input ─── */
function FloatingInput({
  id, label, type = "text", name, value, onChange,
  placeholder, required, icon: Icon, suffix, autoComplete,
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`absolute left-10 transition-all duration-200 pointer-events-none z-10 font-medium
          ${focused || filled
            ? "top-1.5 text-[10px] text-primary-500 dark:text-primary-400"
            : "top-1/2 -translate-y-1/2 text-sm text-neutral-400 dark:text-neutral-500"
          }`}
      >
        {label}
      </label>
      {Icon && (
        <Icon
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200 pointer-events-none
            ${focused ? "text-primary-500 dark:text-primary-400" : "text-slate-400 dark:text-slate-500"}`}
          aria-hidden="true"
        />
      )}
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={focused ? placeholder : ""}
        autoComplete={autoComplete}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full pl-12 ${suffix ? "pr-18" : "pr-4"} pt-5 pb-2 rounded-2xl border text-sm font-medium
          bg-white/95 dark:bg-slate-950/90 backdrop-blur-sm
          text-slate-950 dark:text-slate-100
          placeholder-slate-500 dark:placeholder-slate-500
          transition-all duration-300 outline-none
          ${focused
            ? "border-primary-500 shadow-[0_0_0_12px_rgba(59,130,246,0.18)]"
            : "border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-500"
          } focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`}
      />
      {suffix}
    </div>
  );
}

/* ─── Main component ─── */
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [darkMode, setDarkMode] = useState(getThemePreference);
  const { ripples: btnRipples, addRipple: addBtnRipple } = useRipple();

  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

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

  const strength = getPasswordStrength(formData.password);

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
        className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 font-sans
          bg-linear-to-br from-slate-50 via-blue-50/40 to-violet-50/60
          dark:from-[#0a0a14] dark:via-[#0d0f1e] dark:to-[#0a0a14]"
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
            bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/80
            text-slate-700 dark:text-slate-100 shadow-lg hover:shadow-xl transition-all duration-300"
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
          className="relative z-10 w-full max-w-105"
        >
          <div className="relative rounded-3xl overflow-hidden
            bg-white/70 dark:bg-white/4
            backdrop-blur-2xl
            border border-white/50 dark:border-white/10
            shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_60px_rgba(0,0,0,0.5)]
            p-8 md:p-9"
          >
            {/* inner glass sheen */}
            <div className="absolute inset-0 bg-linear-to-br from-white/60 via-transparent to-transparent dark:from-white/3 dark:to-transparent pointer-events-none rounded-3xl" />

            {/* ── Logo & header ── */}
            <motion.div variants={itemVariants} className="text-center mb-7">
              <motion.div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 relative mx-auto"
                style={{ background: "linear-gradient(135deg, #0ba5ff 0%, #8b5cf6 100%)" }}
                whileHover={{ rotate: [0, -6, 6, 0], scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                {/* SVG rocket illustration */}
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
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
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Welcome back
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Sign in to your CareerLaunch AI account
              </p>
            </motion.div>

            {/* ── Social login ── */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-5">
              <SocialButton icon={FaGoogle} label="Google" />
              <SocialButton icon={FaGithub} label="GitHub" />
            </motion.div>

            {/* ── Divider ── */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-neutral-200 dark:via-white/10 to-transparent" />
              <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 px-1">or continue with email</span>
              <div className="flex-1 h-px bg-linear-to-r from-transparent via-neutral-200 dark:via-white/10 to-transparent" />
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
            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4" noValidate>

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
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors focus:outline-none focus-visible:text-primary-500"
                    >
                      {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                    </button>
                  }
                />

                {/* Password strength */}
                <AnimatePresence>
                  {formData.password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex gap-1 mt-1.5" aria-label={`Password strength: ${strength.label}`}>
                        {[1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-colors duration-300"
                            style={{ backgroundColor: i <= strength.score ? strength.color : "#e5e7eb" }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] mt-1 font-medium" style={{ color: strength.color }}>
                        {strength.label}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                    <div className="w-4 h-4 rounded border-2 border-neutral-300 dark:border-neutral-600 peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-colors duration-200 flex items-center justify-center">
                      {rememberMe && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors focus:outline-none focus-visible:underline"
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

            {/* ── Register link ── */}
            <motion.p variants={itemVariants} className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors focus:outline-none focus-visible:underline"
              >
                Create one
              </Link>
            </motion.p>
          </div>

          {/* ── Footer ── */}
          <motion.p
            variants={itemVariants}
            className="text-center text-neutral-400 dark:text-neutral-600 text-[11px] mt-5"
          >
            By signing in, you agree to our{" "}
            <Link to="#" className="hover:text-primary-500 transition-colors">Terms of Service</Link>
            {" "}and{" "}
            <Link to="#" className="hover:text-primary-500 transition-colors">Privacy Policy</Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Login;
