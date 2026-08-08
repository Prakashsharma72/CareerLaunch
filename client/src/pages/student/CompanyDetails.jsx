/**
 * CompanyDetails.jsx — Full company detail page
 * Route: /student/companies/:placeId
 *
 * Sections: header (logo, name, rating, status), photos carousel,
 * about, opening hours, reviews, contact info, Careers + Maps buttons.
 */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link }      from "react-router-dom";
import { motion, AnimatePresence }            from "framer-motion";
import {
  FaArrowLeft, FaStar, FaMapMarkerAlt, FaGlobe, FaPhone,
  FaBriefcase, FaMapMarkedAlt, FaRegClock, FaChevronLeft,
  FaChevronRight, FaExternalLinkAlt, FaRegBuilding, FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { getCompanyDetails } from "../../services/placesService";
import AvatarIcon from "../../components/common/AvatarIcon";

/* ── Helpers ─────────────────────────────────────────────────────────── */
const GRADS = [
  ["#3b82f6","#6366f1"], ["#8b5cf6","#a855f7"], ["#10b981","#14b8a6"],
  ["#f43f5e","#ec4899"], ["#f59e0b","#f97316"], ["#06b6d4","#0ea5e9"],
];
const grad = (s = "") => GRADS[(s.charCodeAt(0) || 0) % GRADS.length];

function Stars({ rating, count }) {
  if (!rating) return <span className="text-sm text-gray-400">No rating</span>;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="flex items-center gap-1 flex-wrap">
      {Array.from({ length: full  }).map((_, i) => <FaStar key={`f${i}`} className="text-amber-400" />)}
      {half && <FaStar className="text-amber-300/70" />}
      {Array.from({ length: empty }).map((_, i) => <FaStar key={`e${i}`} className="text-gray-200 dark:text-white/10" />)}
      <span className="ml-1 font-bold text-gray-900 dark:text-white">{rating.toFixed(1)}</span>
      {count && <span className="text-sm text-gray-500">({count.toLocaleString()} reviews)</span>}
    </span>
  );
}

/* ── Photos carousel ─────────────────────────────────────────────────── */
function PhotoCarousel({ photos }) {
  const [idx, setIdx] = useState(0);
  if (!photos?.length) return null;
  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx(i => (i + 1) % photos.length);
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 aspect-16/7">
      <AnimatePresence mode="wait">
        <motion.img
          key={photos[idx]}
          src={photos[idx]}
          alt="Company photo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full object-cover"
          onError={e => { e.currentTarget.style.display = "none"; }}
        />
      </AnimatePresence>
      {photos.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl
              bg-black/40 hover:bg-black/60 text-white flex items-center justify-center
              backdrop-blur-sm transition">
            <FaChevronLeft />
          </button>
          <button onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl
              bg-black/40 hover:bg-black/60 text-white flex items-center justify-center
              backdrop-blur-sm transition">
            <FaChevronRight />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === idx ? "bg-white scale-125" : "bg-white/50"
                }`} />
            ))}
          </div>
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white
            text-xs font-semibold px-2.5 py-1 rounded-full">
            {idx + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Review card ─────────────────────────────────────────────────────── */
function ReviewCard({ review }) {
  const [exp, setExp] = useState(false);
  const long = review.text?.length > 200;
  return (
    <div className="bg-gray-50 dark:bg-white/4 border border-gray-100 dark:border-white/8
      rounded-xl p-4 space-y-2.5">
      <div className="flex items-start gap-3">
        {review.photoUrl ? (
          <img src={review.photoUrl} alt={review.author} loading="lazy"
            className="w-10 h-10 rounded-full object-cover shrink-0
              border border-gray-200 dark:border-white/10" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30
            flex items-center justify-center shrink-0 text-blue-600 font-bold text-sm">
            {review.author?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {review.author}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {review.rating && (
              <span className="flex items-center gap-0.5">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <FaStar key={i} className="text-amber-400 text-xs" />
                ))}
              </span>
            )}
            {review.time && (
              <span className="text-xs text-gray-400 dark:text-gray-500">{review.time}</span>
            )}
          </div>
        </div>
      </div>
      {review.text && (
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {long && !exp ? review.text.slice(0, 200) + "…" : review.text}
          {long && (
            <button onClick={() => setExp(e => !e)}
              className="ml-1.5 text-blue-500 hover:underline text-xs font-medium">
              {exp ? "Less" : "More"}
            </button>
          )}
        </p>
      )}
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────── */
function Sk({ h = "h-4", w = "w-full", r = "rounded-lg" }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-white/8 ${h} ${w} ${r}`} />;
}
function PageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
      <Sk h="h-8" w="w-28" />
      <Sk h="h-56" r="rounded-2xl" />
      <div className="bg-white dark:bg-[#0f1123] rounded-2xl p-8 space-y-4
        border border-gray-100 dark:border-white/8">
        <div className="flex gap-4">
          <Sk h="h-16" w="w-16" r="rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Sk h="h-7" w="w-3/4" />
            <Sk h="h-4" w="w-1/2" />
          </div>
        </div>
        <Sk h="h-24" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════ */
export default function CompanyDetails() {
  const { placeId }  = useParams();
  const navigate     = useNavigate();
  const [company, setCompany]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);

  const load = useCallback(async () => {
    if (!placeId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getCompanyDetails(decodeURIComponent(placeId));
      setCompany(data.company ?? data);
    } catch (e) {
      const msg = e?.response?.data?.reason || e.message || "Failed to load company details";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageSkeleton />;

  if (error || !company) return (
    <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center gap-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/25 flex items-center justify-center">
        <FaExclamationTriangle className="text-2xl text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Company not found</h2>
      <p className="text-sm text-gray-500 max-w-sm">{error}</p>
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700
          text-white font-semibold text-sm rounded-xl transition-colors">
        <FaArrowLeft className="text-xs" /> Go Back
      </button>
    </div>
  );

  const {
    companyName, logo, rating, reviewCount, address, website, phone,
    mapsUrl, businessStatus, isOpenNow, careerPage, industry,
    openingHours, photos, reviews, editorialSummary, types,
  } = company;

  const [g1, g2] = grad(companyName);
  const isOpen   = isOpenNow === true || businessStatus === "OPERATIONAL";
  const isClosed = isOpenNow === false;

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#080810]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Back */}
        <motion.button initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium
            text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <FaArrowLeft className="text-xs" /> Back
        </motion.button>

        {/* Photos carousel */}
        {photos?.length > 0 && <PhotoCarousel photos={photos} />}

        {/* ── Main card ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0f1123] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm overflow-hidden">
          <div className="h-1.5" style={{ background: `linear-gradient(90deg,${g1},${g2})` }} />
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <AvatarIcon name={companyName} size={64} className="rounded-2xl shadow-md shrink-0" />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  {companyName}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <Stars rating={rating} count={reviewCount} />
                  {(isOpen || isClosed) && (
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
                      ${isOpen && !isClosed
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-500 dark:bg-white/8 dark:text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${isOpen && !isClosed ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                      {isOpen && !isClosed ? "Open Now" : "Closed"}
                    </span>
                  )}
                  {industry && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full
                      bg-indigo-50 text-indigo-700 dark:bg-indigo-900/25 dark:text-indigo-400
                      border border-indigo-200 dark:border-indigo-500/30 capitalize">
                      {industry}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Editorial summary / about */}
            {editorialSummary && (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5 pb-5
                border-b border-gray-100 dark:border-white/8">
                {editorialSummary}
              </p>
            )}

            {/* Contact info grid */}
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              {address && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl
                  bg-gray-50 dark:bg-white/4 border border-gray-100 dark:border-white/6">
                  <FaMapMarkerAlt className="mt-0.5 shrink-0 text-blue-500 text-sm" />
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-0.5">Address</p>
                    <p className="text-sm text-gray-700 dark:text-gray-200">{address}</p>
                  </div>
                </div>
              )}
              {phone && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl
                  bg-gray-50 dark:bg-white/4 border border-gray-100 dark:border-white/6">
                  <FaPhone className="mt-0.5 shrink-0 text-emerald-500 text-sm" />
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-0.5">Phone</p>
                    <a href={`tel:${phone}`} className="text-sm text-gray-700 dark:text-gray-200 hover:text-emerald-600 transition-colors">
                      {phone}
                    </a>
                  </div>
                </div>
              )}
              {website && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl
                  bg-gray-50 dark:bg-white/4 border border-gray-100 dark:border-white/6">
                  <FaGlobe className="mt-0.5 shrink-0 text-violet-500 text-sm" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-0.5">Website</p>
                    <a href={website} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-violet-600 dark:text-violet-400 hover:underline truncate block">
                      {website.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  </div>
                </div>
              )}
              {types?.length > 0 && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl
                  bg-gray-50 dark:bg-white/4 border border-gray-100 dark:border-white/6">
                  <FaRegBuilding className="mt-0.5 shrink-0 text-gray-400 text-sm" />
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-0.5">Type</p>
                    <p className="text-sm text-gray-700 dark:text-gray-200 capitalize">
                      {types.slice(0, 3).join(", ").replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-5 border-t border-gray-100 dark:border-white/8">
              {careerPage && (
                <a href={careerPage} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700
                    text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all">
                  <FaBriefcase className="text-xs" /> View Careers
                </a>
              )}
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5
                    text-gray-700 dark:text-gray-200 font-semibold text-sm rounded-xl
                    border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
                  <FaGlobe className="text-xs" /> Website
                </a>
              )}
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5
                    text-gray-700 dark:text-gray-200 font-semibold text-sm rounded-xl
                    border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
                  <FaMapMarkedAlt className="text-xs" /> Google Maps
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Opening hours ──────────────────────────────────────── */}
        {openingHours?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white dark:bg-[#0f1123] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-white/8">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/25 flex items-center justify-center">
                <FaRegClock className="text-blue-600 dark:text-blue-400 text-sm" />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Opening Hours</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {openingHours.map((line, i) => {
                const [day, ...rest] = line.split(":");
                const hours = rest.join(":").trim();
                const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }) === day?.trim();
                return (
                  <div key={i} className={`flex justify-between gap-3 px-3 py-2 rounded-xl text-sm
                    ${isToday ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30" : "bg-gray-50 dark:bg-white/4"}`}>
                    <span className={`font-medium ${isToday ? "text-blue-700 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"}`}>
                      {day}
                    </span>
                    <span className={`${isToday ? "text-blue-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"}`}>
                      {hours || "Closed"}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Reviews ───────────────────────────────────────────── */}
        {reviews?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="bg-white dark:bg-[#0f1123] rounded-2xl border border-gray-100 dark:border-white/8 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-white/8">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/25 flex items-center justify-center">
                <FaStar className="text-amber-500 text-sm" />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Google Reviews
                {reviewCount && <span className="ml-2 text-sm font-normal text-gray-400">({reviewCount.toLocaleString()} total)</span>}
              </h2>
            </div>
            <div className="space-y-3">
              {reviews.map((r, i) => <ReviewCard key={i} review={r} />)}
            </div>
          </motion.div>
        )}

        {/* ── Find jobs CTA ──────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white">
          <h3 className="text-lg font-bold mb-1">Interested in working here?</h3>
          <p className="text-blue-100 text-sm mb-4">
            {careerPage
              ? `${companyName} has an active careers page — explore open roles directly.`
              : `Visit ${companyName}'s website to find open positions.`}
          </p>
          <div className="flex flex-wrap gap-3">
            {careerPage && (
              <a href={careerPage} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700
                  font-semibold text-sm rounded-xl shadow-md hover:bg-blue-50 transition-all">
                <FaBriefcase className="text-xs" /> View Careers <FaExternalLinkAlt className="text-[10px]" />
              </a>
            )}
            {!careerPage && website && (
              <a href={website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700
                  font-semibold text-sm rounded-xl shadow-md hover:bg-blue-50 transition-all">
                <FaGlobe className="text-xs" /> Visit Website <FaExternalLinkAlt className="text-[10px]" />
              </a>
            )}
            <Link to="/student/companies"
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30
                text-white font-semibold text-sm rounded-xl transition-all border border-white/30">
              ← Back to Companies
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
