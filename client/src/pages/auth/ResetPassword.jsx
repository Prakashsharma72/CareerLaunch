import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock } from "react-icons/fa";
import { resetPasswordApi } from "../../services/authService";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (!email || !token) {
      return setError("Invalid reset link. Please request a new password reset.");
    }

    setLoading(true);
    try {
      await resetPasswordApi({ email, token, password });
      setSuccess("Your password has been reset. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-slate-900/95 border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Reset password</h1>
          <p className="text-sm text-slate-400 mt-2">Choose a new password for your account.</p>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-200">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3">
            <label className="block text-sm text-slate-400 mb-2">New password</label>
            <div className="flex items-center gap-3">
              <FaLock className="text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full bg-transparent outline-none text-white placeholder:text-slate-500"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3">
            <label className="block text-sm text-slate-400 mb-2">Confirm password</label>
            <div className="flex items-center gap-3">
              <FaLock className="text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-transparent outline-none text-white placeholder:text-slate-500"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60">
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link to="/login" className="text-blue-400 hover:text-blue-200">Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default ResetPassword;
