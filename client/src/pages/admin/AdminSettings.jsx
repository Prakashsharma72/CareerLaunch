/**
 * AdminSettings.jsx
 *
 * Lets the admin view and update OPENAI_API_KEY and GOOGLE_MAPS_API_KEY.
 * Keys are fetched masked from the server; the admin can type a new value
 * and save — which rewrites the .env file on the server.
 */
import { useEffect, useState } from "react";
import {
  FaCog, FaKey, FaEye, FaEyeSlash,
  FaSave, FaCheckCircle, FaExclamationTriangle,
  FaSyncAlt, FaRobot, FaMapMarkerAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

/* ── one key card ── */
function KeyField({ id, label, icon: Icon, description, value, masked, isSet, onChange }) {
  const [show, setShow] = useState(false);

  return (
    <div className="bg-white dark:bg-white/3 rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6 space-y-4">

      {/* label row */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Icon className="text-base" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-neutral-900 dark:text-white text-sm">{label}</h3>
            {isSet ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full
                bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full
                bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Not set
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
          {isSet && masked && (
            <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500 mt-1">
              Current: {masked}
            </p>
          )}
        </div>
      </div>

      {/* input */}
      <div className="relative">
        <FaKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isSet ? "Enter new key to replace current…" : "Paste your API key here…"}
          className="w-full pl-9 pr-11 py-2.5 text-sm font-mono rounded-xl
            bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
            text-gray-800 dark:text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label={show ? "Hide key" : "Show key"}
        >
          {show ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
        </button>
      </div>
    </div>
  );
}

/* ── main page ── */
export default function AdminSettings() {
  const [keys, setKeys]       = useState({ OPENAI_API_KEY: "", GOOGLE_MAPS_API_KEY: "" });
  const [meta, setMeta]       = useState({ OPENAI_API_KEY: {}, GOOGLE_MAPS_API_KEY: {} });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null); // { type: "success"|"error", msg }

  /* fetch masked current values */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/settings/keys");
        setMeta(data);
      } catch (err) {
        showToast("error", err?.response?.data?.message || "Failed to load current keys.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!keys.OPENAI_API_KEY && !keys.GOOGLE_MAPS_API_KEY) {
      showToast("error", "Enter at least one key to save.");
      return;
    }
    try {
      setSaving(true);
      const payload = {};
      if (keys.OPENAI_API_KEY)      payload.OPENAI_API_KEY      = keys.OPENAI_API_KEY;
      if (keys.GOOGLE_MAPS_API_KEY) payload.GOOGLE_MAPS_API_KEY = keys.GOOGLE_MAPS_API_KEY;

      const { data } = await api.put("/settings/keys", payload);

      // refresh masked display
      const { data: fresh } = await api.get("/settings/keys");
      setMeta(fresh);
      setKeys({ OPENAI_API_KEY: "", GOOGLE_MAPS_API_KEY: "" });
      showToast("success", data.message || "Keys saved successfully.");
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to save keys.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <FaSyncAlt className="animate-spin text-2xl text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            API Settings
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Update API keys used by the platform. Changes take effect immediately.
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0">
          <FaCog className="text-xl" />
        </div>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border
              ${toast.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400"
              }`}
          >
            {toast.type === "success"
              ? <FaCheckCircle className="shrink-0" />
              : <FaExclamationTriangle className="shrink-0" />
            }
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Info banner ── */}
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl
        bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
        <FaExclamationTriangle className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          These keys are stored in the server's <code className="font-mono bg-amber-100 dark:bg-amber-500/20 px-1 rounded">.env</code> file.
          Leave a field blank to keep the existing key unchanged.
          The server picks up changes immediately without a restart.
        </p>
      </div>

      {/* ── Key cards ── */}
      <form onSubmit={handleSave} className="space-y-4">
        <KeyField
          id="openai"
          label="OpenAI API Key"
          icon={FaRobot}
          description="Used for AI features: mock interviews, resume analysis, roadmap generation."
          value={keys.OPENAI_API_KEY}
          masked={meta.OPENAI_API_KEY?.masked}
          isSet={meta.OPENAI_API_KEY?.set}
          onChange={(v) => setKeys((k) => ({ ...k, OPENAI_API_KEY: v }))}
        />

        <KeyField
          id="gmaps"
          label="Google Maps API Key"
          icon={FaMapMarkerAlt}
          description="Used for the company search and places features via Google Places API."
          value={keys.GOOGLE_MAPS_API_KEY}
          masked={meta.GOOGLE_MAPS_API_KEY?.masked}
          isSet={meta.GOOGLE_MAPS_API_KEY?.set}
          onChange={(v) => setKeys((k) => ({ ...k, GOOGLE_MAPS_API_KEY: v }))}
        />

        {/* ── Save button ── */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={saving || (!keys.OPENAI_API_KEY && !keys.GOOGLE_MAPS_API_KEY)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm
              bg-indigo-600 hover:bg-indigo-700 text-white transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? <><FaSyncAlt className="animate-spin" /> Saving…</>
              : <><FaSave /> Save Changes</>
            }
          </button>
        </div>
      </form>

      {/* ── Quick reference ── */}
      <div className="bg-white dark:bg-white/3 rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-bold text-neutral-800 dark:text-white">Where to get these keys</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2 text-neutral-600 dark:text-neutral-300">
            <FaRobot className="mt-0.5 shrink-0 text-indigo-400" />
            <span>
              <strong className="text-neutral-800 dark:text-white">OpenAI</strong> —{" "}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline">
                platform.openai.com/api-keys
              </a>
            </span>
          </li>
          <li className="flex items-start gap-2 text-neutral-600 dark:text-neutral-300">
            <FaMapMarkerAlt className="mt-0.5 shrink-0 text-emerald-400" />
            <span>
              <strong className="text-neutral-800 dark:text-white">Google Maps</strong> —{" "}
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline">
                console.cloud.google.com/apis/credentials
              </a>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
