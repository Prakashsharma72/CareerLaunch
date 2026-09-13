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
    <div className="min-h-screen flex items-center justify-center bg-[var(--cl-page)] px-4 py-10 text-[var(--cl-text)]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-8 shadow-[var(--cl-shadow)]">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-[var(--cl-text)]">Reset password</h1>
          <p className="mt-2 text-sm text-[var(--cl-text-muted)]">Choose a new password for your account.</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-[var(--cl-danger)]/30 bg-[var(--cl-danger-soft)] px-4 py-3 text-sm text-[var(--cl-danger)]">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-[var(--cl-success)]/30 bg-[var(--cl-success-soft)] px-4 py-3 text-sm text-[var(--cl-success)]">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-4 py-3">
            <label className="mb-2 block text-sm text-[var(--cl-text-muted)]">New password</label>
            <div className="flex items-center gap-3">
              <FaLock className="text-[var(--cl-text-soft)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full bg-transparent outline-none text-[var(--cl-text)] placeholder:text-[var(--cl-text-soft)]"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-4 py-3">
            <label className="mb-2 block text-sm text-[var(--cl-text-muted)]">Confirm password</label>
            <div className="flex items-center gap-3">
              <FaLock className="text-[var(--cl-text-soft)]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-transparent outline-none text-[var(--cl-text)] placeholder:text-[var(--cl-text-soft)]"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-[var(--cl-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--cl-primary-strong)] disabled:opacity-60">
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--cl-text-muted)]">
          <Link to="/login" className="text-[var(--cl-primary)] hover:text-[var(--cl-primary-strong)]">Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default ResetPassword;
