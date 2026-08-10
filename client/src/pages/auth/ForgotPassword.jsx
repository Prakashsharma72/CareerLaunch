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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-slate-900/95 border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Forgot password</h1>
          <p className="text-sm text-slate-400 mt-2">Enter your email to receive password reset instructions.</p>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">{error}</div>}
        {success && <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-200">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3">
            <label className="block text-sm text-slate-400 mb-2">Email address</label>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent outline-none text-white placeholder:text-slate-500"
                autoComplete="email"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60">
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Remembered your password? <Link to="/login" className="text-blue-400 hover:text-blue-200">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
