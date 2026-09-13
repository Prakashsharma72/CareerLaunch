import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope } from "react-icons/fa";
import { forgotPasswordApi } from "../../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      return setError("Please enter your email address.");
    }

    setLoading(true);
    try {
      await forgotPasswordApi({ email: email.trim().toLowerCase() });
      setSuccess("If your email exists, instructions have been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send reset instructions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cl-page)] px-4 py-10 text-[var(--cl-text)]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-8 shadow-[var(--cl-shadow)]">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-[var(--cl-text)]">Forgot password</h1>
          <p className="mt-2 text-sm text-[var(--cl-text-muted)]">Enter your email to receive password reset instructions.</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-[var(--cl-danger)]/30 bg-[var(--cl-danger-soft)] px-4 py-3 text-sm text-[var(--cl-danger)]">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-[var(--cl-success)]/30 bg-[var(--cl-success-soft)] px-4 py-3 text-sm text-[var(--cl-success)]">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-4 py-3">
            <label className="mb-2 block text-sm text-[var(--cl-text-muted)]">Email address</label>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-[var(--cl-text-soft)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent outline-none text-[var(--cl-text)] placeholder:text-[var(--cl-text-soft)]"
                autoComplete="email"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-[var(--cl-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--cl-primary-strong)] disabled:opacity-60">
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--cl-text-muted)]">
          Remembered your password? <Link to="/login" className="text-[var(--cl-primary)] hover:text-[var(--cl-primary-strong)]">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
