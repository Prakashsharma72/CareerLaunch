import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaCheckCircle, FaExclamationCircle, FaGoogle,
  FaRocket, FaBrain, FaChartLine, FaShieldAlt,
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import { getThemePreference, applyTheme } from "../../utils/helpers";

/* ─── Password strength ─── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: "Too short", color: "#ef4444" },
    { label: "Weak",      color: "#f97316" },
    { label: "Fair",      color: "#eab308" },
    { label: "Good",      color: "#22c55e" },
    { label: "Strong",    color: "#0ba5ff" },
  ];
  return { score: s, ...map[s] };
}

/* ─── Ripple ─── */
function useRipple() {
  const [ripples, setRipples] = useState([]);
  const add = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((p) => [...p, { x: e.clientX - r.left, y: e.clientY - r.top, id }]);
    setTimeout(() => setRipples((p) => p.filter((i) => i.id !== id)), 600);
  }, []);
  return { ripples, add };
}

/* ─── Floating label input ─── */
function FloatingInput({ id, label, type="text", name, value, onChange, icon: Icon, suffix, autoComplete, required: req }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative">
      <label htmlFor={id}
        className={`absolute left-10 pointer-events-none z-10 font-medium transition-all duration-200
          ${active ? "top-1.5 text-[10px] text-primary-500 dark:text-primary-400"
                   : "top-1/2 -translate-y-1/2 text-sm text-neutral-400 dark:text-neutral-500"}`}>
        {label}
      </label>
      {Icon && (
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200 pointer-events-none
          ${focused ? "text-primary-500 dark:text-primary-400" : "text-slate-400 dark:text-slate-500"}`}
          aria-hidden="true" />
      )}
      <input id={id} type={type} name={name} value={value} onChange={onChange}
        autoComplete={autoComplete} required={req}
        placeholder={focused ? (type === "password" ? "••••••••" : "") : ""}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className={`w-full pl-12 ${suffix ? "pr-18" : "pr-4"} pt-5 pb-2 rounded-2xl border text-sm font-medium
          bg-white/95 dark:bg-slate-950/90 backdrop-blur-sm
          text-slate-950 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-500
          transition-all duration-300 outline-none
          ${focused
            ? "border-primary-500 shadow-[0_0_0_12px_rgba(59,130,246,0.18)]"
            : "border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-500"
          } focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`} />
      {suffix}
    </div>
  );
}

/* ─── Hero feature pill ─── */
function FeaturePill({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
      <Icon className="text-white/80 text-sm shrink-0" />
      <span className="text-white/90 text-sm font-medium">{text}</span>
    </div>
  );
}

/* ─── Stat badge ─── */
function StatBadge({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white/60 text-xs mt-0.5">{label}</div>
    </div>
  );
}

/* ─── OTP input — 6 separate boxes ─── */
function OtpInput({ value, onChange, disabled }) {
  const inputs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleKey = (e, idx) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = digits.map((d, i) => (i === idx ? "" : d)).join("");
        onChange(next);
      } else if (idx > 0) {
        inputs.current[idx - 1]?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft" && idx > 0) { inputs.current[idx - 1]?.focus(); return; }
    if (e.key === "ArrowRight" && idx < 5) { inputs.current[idx + 1]?.focus(); return; }
  };

  const handleChange = (e, idx) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    const char = raw[raw.length - 1];
    const next = digits.map((d, i) => (i === idx ? char : d)).join("");
    onChange(next);
    if (idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6).replace(/\s/g, ""));
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input key={i} ref={(el) => (inputs.current[i] = el)}
          type="text" inputMode="numeric" maxLength={1} value={d}
          disabled={disabled}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 outline-none
            transition-all duration-150 bg-white/60 dark:bg-white/5
            text-neutral-900 dark:text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            ${d ? "border-primary-500 ring-2 ring-primary-500/20" : "border-white/40 dark:border-white/15"}
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`}
          aria-label={`OTP digit ${i + 1}`} />
      ))}
    </div>
  );
}

/* ─── Main component ─── */
function Register() {
  const { register, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  /* step: "form" | "otp" */
  const [step, setStep]         = useState("form");
  const [pendingEmail, setPendingEmail] = useState("");

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [otp, setOtp]           = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [darkMode, setDarkMode] = useState(getThemePreference);
  const { ripples, add: addRipple } = useRipple();

  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  /* Resend countdown */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  /* Step 1 — submit registration form */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match");
    if (formData.password.length < 6) return setError("Password must be at least 6 characters");
    if (!agreed) return setError("Please agree to the Terms of Service and Privacy Policy");
    setLoading(true);
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password });
      setPendingEmail(formData.email);
      setOtp("");
      setStep("otp");
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Step 2 — verify OTP */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    const cleanOtp = otp.replace(/\D/g, "");
    if (cleanOtp.length !== 6) return setError("Please enter the full 6-digit code");
    setLoading(true);
    try {
      await verifyOtp(pendingEmail, cleanOtp);
      navigate("/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Resend OTP */
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await resendOtp(pendingEmail);
      setOtp("");
      setResendCooldown(60);
      setSuccess("A new code has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength         = getStrength(formData.password);
  const passwordsMatch   = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordMismatch = formData.confirmPassword.length > 0 && !passwordsMatch;

  const heroVariants = {
    hidden:  { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const cardVariants = {
    hidden:  { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.07, delayChildren: 0.3 } },
  };
  const item = {
    hidden:  { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="min-h-screen flex font-sans
      bg-linear-to-br from-slate-50 via-blue-50/30 to-violet-50/50
      dark:from-[#080810] dark:via-[#0c0e1c] dark:to-[#080810]">

      {/* ══════════════════ LEFT HERO PANEL ══════════════════ */}
      <motion.div variants={heroVariants} initial="hidden" animate="visible"
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12 xl:p-16"
        style={{ background: "linear-gradient(135deg, #0062c3 0%, #0ba5ff 40%, #8b5cf6 100%)" }}>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <motion.div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #38bfff 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }} />

        {/* Logo */}
        <motion.div variants={item} className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <FaRocket className="text-white text-base" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">CareerLaunch AI</span>
        </motion.div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <motion.div variants={item} className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/90 text-xs font-medium">Trusted by 10,000+ students</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              Launch your career<br />
              <span className="text-white/70">with AI by your side.</span>
            </h1>
            <p className="text-white/70 text-base leading-relaxed max-w-sm">
              Get matched with top jobs, build your resume, and ace your interviews — all powered by AI built for students.
            </p>
          </motion.div>
          <motion.div variants={item} className="flex flex-wrap gap-2.5">
            <FeaturePill icon={FaBrain}     text="Career Roadmaps" />
            <FeaturePill icon={FaChartLine} text="Mock Interviews" />
            <FeaturePill icon={FaShieldAlt} text="Job Search" />
          </motion.div>
          <motion.div variants={item} className="flex items-center gap-8 pt-2">
            <StatBadge value="10K+"  label="Active Users" />
            <div className="w-px h-10 bg-white/20" />
            <StatBadge value="2.5K+" label="Jobs Posted" />
            <div className="w-px h-10 bg-white/20" />
            <StatBadge value="98%"   label="Satisfaction" />
          </motion.div>
        </div>

        {/* Testimonial */}
        <motion.div variants={item} className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
          <p className="text-white/90 text-sm leading-relaxed italic">
            "CareerLaunch AI helped me land my dream job in 3 weeks. The AI roadmap was spot on!"
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">A</div>
            <div>
              <p className="text-white text-sm font-semibold">Arjun Mehta</p>
              <p className="text-white/60 text-xs">Frontend Dev @ Razorpay</p>
            </div>
            <div className="ml-auto flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ══════════════════ RIGHT PANEL ══════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 dark:opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #0ba5ff 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15 dark:opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />

        {/* Dark mode toggle */}
        <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
          onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode"
          className="absolute top-5 right-5 z-30 w-10 h-10 rounded-full flex items-center justify-center
            bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/80
            text-slate-700 dark:text-slate-100 shadow-lg hover:shadow-xl transition-all duration-300">
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

        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="relative z-10 w-full max-w-md">
          <div className="relative rounded-3xl overflow-hidden
            bg-white/75 dark:bg-white/4 backdrop-blur-2xl
            border border-white/60 dark:border-white/10
            shadow-[0_8px_40px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_60px_rgba(0,0,0,0.5)]
            p-7 md:p-9">
            <div className="absolute inset-0 bg-linear-to-br from-white/50 via-transparent to-transparent dark:from-white/3 dark:to-transparent pointer-events-none rounded-3xl" />

            <AnimatePresence mode="wait">

              {/* ══════ STEP 1: REGISTRATION FORM ══════ */}
              {step === "form" && (
                <motion.div key="form"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>

                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-5 lg:hidden">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
                        <FaRocket className="text-white text-xs" />
                      </div>
                      <span className="font-bold text-neutral-800 dark:text-white text-base">CareerLaunch AI</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Create your account</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Join thousands of students launching their careers.</p>
                  </div>

                  {/* Google btn */}
                  {/* <motion.button type="button" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl
                      bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10
                      backdrop-blur-md text-sm font-medium text-neutral-700 dark:text-neutral-200
                      hover:bg-white/80 dark:hover:bg-white/10 transition-colors duration-200
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    aria-label="Sign up with Google">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </motion.button> */}

                  {/* <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-linear-to-r from-transparent via-neutral-200 dark:via-white/10 to-transparent" />
                    <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">or sign up with email</span>
                    <div className="flex-1 h-px bg-linear-to-r from-transparent via-neutral-200 dark:via-white/10 to-transparent" />
                  </div> */}

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.22 }} role="alert"
                        className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-xl
                          bg-red-50/80 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20">
                        <FaExclamationCircle className="text-red-500 mt-0.5 shrink-0 text-sm" />
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form fields */}
                  <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                    <FloatingInput id="name" label="Full name" type="text" name="name"
                      value={formData.name} onChange={handleChange} icon={FaUser} autoComplete="name" required />
                    <FloatingInput id="email" label="Email address" type="email" name="email"
                      value={formData.email} onChange={handleChange} icon={FaEnvelope} autoComplete="email" required />

                    {/* Password */}
                    <div className="space-y-1.5">
                      <FloatingInput id="password" label="Password" type={showPassword ? "text" : "password"}
                        name="password" value={formData.password} onChange={handleChange}
                        icon={FaLock} autoComplete="new-password" required
                        suffix={
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors focus:outline-none">
                            {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                          </button>
                        } />
                      <AnimatePresence>
                        {formData.password.length > 0 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                            <div className="flex gap-1 mt-1" role="progressbar" aria-label={`Password strength: ${strength.label}`}>
                              {[1,2,3,4].map((i) => (
                                <motion.div key={i} className="h-1 flex-1 rounded-full"
                                  style={{ backgroundColor: i <= strength.score ? strength.color : "#e5e7eb" }}
                                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                                  transition={{ duration: 0.25, delay: i * 0.05 }} />
                              ))}
                            </div>
                            <p className="text-[11px] mt-1 font-medium" style={{ color: strength.color }}>{strength.label}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-1.5">
                      <FloatingInput id="confirmPassword" label="Confirm password"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                        icon={FaLock} autoComplete="new-password" required
                        suffix={
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors focus:outline-none">
                            {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                          </button>
                        } />
                      <AnimatePresence mode="wait">
                        {passwordsMatch && (
                          <motion.div key="match" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                            <FaCheckCircle className="text-xs" />
                            <span className="text-[11px] font-medium">Passwords match</span>
                          </motion.div>
                        )}
                        {passwordMismatch && (
                          <motion.div key="mismatch" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                            <FaExclamationCircle className="text-xs" />
                            <span className="text-[11px] font-medium">Passwords don't match</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-2.5 cursor-pointer select-none pt-0.5">
                      <div className="relative mt-0.5 shrink-0">
                        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only peer" aria-label="I agree to Terms of Service and Privacy Policy" />
                        <div className="w-4 h-4 rounded border-2 border-neutral-300 dark:border-neutral-600
                          peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-colors duration-200
                          flex items-center justify-center">
                          {agreed && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        I agree to the <Link to="#" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Terms of Service</Link> and <Link to="#" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Privacy Policy</Link>
                      </span>
                    </label>

                    {/* Submit */}
                    <motion.button type="submit" disabled={loading} onMouseDown={addRipple}
                      whileHover={!loading ? { y: -1, scale: 1.02, boxShadow: "0 16px 50px rgba(59,130,246,0.22)" } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      style={{
                        backgroundImage: "linear-gradient(#020617, #020617), linear-gradient(90deg, #0ba5ff, #8b5cf6)",
                        backgroundOrigin: "border-box",
                        backgroundClip: "padding-box, border-box",
                      }}
                      className="group relative overflow-hidden w-full rounded-2xl border-2 border-transparent py-3 text-white
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-all duration-300 ease-out
                        hover:scale-[1.02] hover:shadow-[0_20px_80px_rgba(59,130,246,0.24)]
                        active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                        focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 mt-1">
                      {!loading && (
                        <motion.span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }} animate={{ x: "200%" }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }} aria-hidden="true" />
                      )}
                      {ripples.map((r) => (
                        <span key={r.id} className="absolute rounded-full bg-white/25 pointer-events-none"
                          style={{ left: r.x - 40, top: r.y - 40, width: 80, height: 80, animation: "ripple-out 0.6s ease-out forwards" }} aria-hidden="true" />
                      ))}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <><motion.span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />Sending code…</>
                        ) : "Create Account"}
                      </span>
                    </motion.button>
                  </form>

                  <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-5">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 transition-colors">Sign in</Link>
                  </p>
                </motion.div>
              )}

              {/* ══════ STEP 2: OTP VERIFICATION ══════ */}
              {step === "otp" && (
                <motion.div key="otp"
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>

                  {/* Back button */}
                  <button type="button" onClick={() => { setStep("form"); setError(""); setSuccess(""); }}
                    className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400
                      hover:text-neutral-700 dark:hover:text-neutral-200 mb-6 transition-colors focus:outline-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>

                  {/* Email icon */}
                  <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#0ba5ff22,#8b5cf622)", border: "1.5px solid #0ba5ff44" }}>
                      <FaEnvelope className="text-primary-500 text-2xl" />
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Verify your email</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                      We sent a 6-digit code to<br />
                      <span className="font-semibold text-neutral-700 dark:text-neutral-200">{pendingEmail}</span>
                    </p>
                  </div>

                  {/* Alerts */}
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.22 }} role="alert"
                        className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-xl
                          bg-red-50/80 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20">
                        <FaExclamationCircle className="text-red-500 mt-0.5 shrink-0 text-sm" />
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.22 }} role="status"
                        className="mb-4 flex items-start gap-2.5 px-4 py-3 rounded-xl
                          bg-green-50/80 dark:bg-green-500/10 border border-green-200/70 dark:border-green-500/20">
                        <FaCheckCircle className="text-green-500 mt-0.5 shrink-0 text-sm" />
                        <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* OTP boxes */}
                  <form onSubmit={handleVerifyOtp} noValidate className="space-y-6">
                    <OtpInput value={otp} onChange={setOtp} disabled={loading} />

                    <motion.button type="submit" disabled={loading || otp.replace(/\s/g,"").length < 6}
                      whileHover={!loading ? { y: -1, boxShadow: "0 12px 32px rgba(11,165,255,0.35)" } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      style={{
                        backgroundImage: "linear-gradient(#020617, #020617), linear-gradient(90deg, #0ba5ff, #8b5cf6)",
                        backgroundOrigin: "border-box",
                        backgroundClip: "padding-box, border-box",
                      }}
                      className="group relative overflow-hidden w-full rounded-2xl border-2 border-transparent py-3 text-white
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_18px_60px_rgba(59,130,246,0.22)]
                        active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                        focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                      {!loading && (
                        <motion.span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }} animate={{ x: "200%" }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }} aria-hidden="true" />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <><motion.span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />Verifying…</>
                        ) : (
                          <><FaCheckCircle className="text-sm" />Verify & Create Account</>
                        )}
                      </span>
                    </motion.button>
                  </form>

                  {/* Resend */}
                  <div className="text-center mt-5">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Didn't receive the code?{" "}
                      {resendCooldown > 0 ? (
                        <span className="font-medium text-neutral-400 dark:text-neutral-500">
                          Resend in {resendCooldown}s
                        </span>
                      ) : (
                        <button type="button" onClick={handleResend} disabled={loading}
                          className="font-semibold text-primary-600 dark:text-primary-400
                            hover:text-primary-700 dark:hover:text-primary-300 transition-colors
                            focus:outline-none disabled:opacity-50">
                          Resend code
                        </button>
                      )}
                    </p>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer */}
          <p className="text-center text-neutral-400 dark:text-neutral-600 text-[11px] mt-4">
            By creating an account, you agree to our{" "}
            <Link to="#" className="hover:text-primary-500 transition-colors">Terms</Link>
            {" "}&amp;{" "}
            <Link to="#" className="hover:text-primary-500 transition-colors">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
