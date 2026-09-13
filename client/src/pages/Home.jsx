import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowRight,
  FaBookOpen,
  FaBriefcase,
  FaChevronDown,
  FaClipboardList,
  FaMapMarkerAlt,
  FaMicrophone,
  FaRoute,
  FaRocket,
  FaSearch,
} from "react-icons/fa";
import { getPublicHomeCompanies } from "../services/publicHomeService";
import CompanyCard from "../components/companies/CompanyCard";

const QUICK_SEARCHES = [
  "Frontend",
  "Full Stack",
  "Backend",
  "React Developer",
  "Remote",
];

const valueCards = [
  {
    icon: FaBriefcase,
    title: "Fresher-Friendly Jobs",
    description: "Explore entry-level roles, internships and opportunities suitable for new graduates.",
  },
  {
    icon: FaRoute,
    title: "Role-Based Roadmaps",
    description: "Follow structured learning paths based on the career you want to pursue.",
  },
  {
    icon: FaMicrophone,
    title: "Interview Practice",
    description: "Practice relevant questions and improve your answers before the real interview.",
  },
  {
    icon: FaBookOpen,
    title: "Curated Resources",
    description: "Learn from organized resources without wasting time searching across multiple platforms.",
  },
];

const featureCards = [
  {
    title: "Job Discovery",
    description: "Search fresher-friendly jobs by role, skill and location.",
    cta: "Explore Jobs",
    to: "/student/jobs",
    icon: FaBriefcase,
  },
  {
    title: "Career Roadmaps",
    description: "Generate a structured learning path for your target role and current skill level.",
    cta: "Create Roadmap",
    to: "/student/roadmap-generator",
    icon: FaRoute,
  },
  {
    title: "Mock Interviews",
    description: "Practice role-specific interview questions and receive useful feedback.",
    cta: "Start Practising",
    to: "/student/mock-interview",
    icon: FaMicrophone,
  },
  {
    title: "Learning Resources",
    description: "Access curated materials that help you improve technical and interview skills.",
    cta: "Browse Resources",
    to: "/student/resources",
    icon: FaBookOpen,
  },
];

const faqs = [
  {
    question: "Is CareerLaunch AI free to use?",
    answer:
      "You can create an account and access the available job search, learning resources, roadmaps and interview-preparation features. If premium features are introduced later, they will be clearly identified.",
  },
  {
    question: "Is CareerLaunch AI suitable for freshers?",
    answer:
      "Yes. The platform is designed to help students, recent graduates and entry-level candidates discover opportunities and prepare for technical interviews.",
  },
  {
    question: "Where do the job listings come from?",
    answer:
      "Job listings are collected through integrated job providers and link to the original source where you can review the full description and apply.",
  },
  {
    question: "Can I practise interview questions?",
    answer:
      "Yes. The Mock Interview feature helps you practise role-specific questions and improve your answers before an actual interview.",
  },
  {
    question: "Can I create a learning roadmap?",
    answer:
      "Yes. You can generate a structured roadmap based on your target role and current skill level.",
  },
];

function formatUpdatedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : `Updated ${date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`;
}

function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesUpdating, setCompaniesUpdating] = useState(false);
  const [companiesError, setCompaniesError] = useState("");
  const [companiesUpdatedAt, setCompaniesUpdatedAt] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const companiesRequestRef = useRef(null);

  const refreshCompanies = async (force = false) => {
    if (companiesRequestRef.current) return companiesRequestRef.current;
    if (force || companies.length) setCompaniesUpdating(true);
    else setCompaniesLoading(true);
    setCompaniesError("");

    const request = getPublicHomeCompanies(force)
      .then(({ data }) => {
        setCompanies((data?.data || []).slice(0, 6));
        setCompaniesUpdatedAt(data?.updatedAt || null);
        if (data?.stale) setTimeout(() => refreshCompanies(true), 0);
      })
      .catch(() => setCompaniesError("We couldn’t load companies right now."))
      .finally(() => {
        companiesRequestRef.current = null;
        setCompaniesLoading(false);
        setCompaniesUpdating(false);
      });
    companiesRequestRef.current = request;
    return request;
  };

  const loadHomeData = () => {
    refreshCompanies();
  };

  useEffect(() => {
    loadHomeData();
  // Public snapshot requests are intentionally bootstrapped once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCompanies = () => refreshCompanies(true);

  /* Keep the public sections independent: a failed provider never clears the other section. */
  const visibleCompanies = useMemo(() => companies.slice(0, 6), [companies]);
  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();
    const trimmedLocation = location.trim();
    const params = new URLSearchParams();

    if (trimmedKeyword) params.set("keyword", trimmedKeyword);
    if (trimmedLocation) params.set("location", trimmedLocation);

    navigate({
      pathname: "/student/jobs",
      search: params.toString() ? `?${params.toString()}` : "",
    });
  };

  const handlePopularSearch = (term) => {
    const params = new URLSearchParams();
    params.set("keyword", term === "Remote" ? "Remote" : term);
    if (term === "Remote") params.set("location", "Remote");

    navigate({
      pathname: "/student/jobs",
      search: `?${params.toString()}`,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--cl-page)] text-[var(--cl-text)]">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_40%),linear-gradient(135deg,var(--cl-page)_0%,var(--cl-surface-soft)_35%,var(--cl-surface-elevated)_100%)]">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-18 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--cl-border)] bg-[var(--cl-surface)]/70 px-4 py-2 text-sm font-medium text-[var(--cl-text)] shadow-[var(--cl-shadow)] backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Built for students and fresh graduates
            </span>

            <h1 className="mt-8 text-4xl font-black tracking-[-0.05em] text-[var(--cl-text)] sm:text-5xl lg:text-7xl">
              Find the Right Job. Build the Skills to Get Hired.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[var(--cl-text-muted)] sm:text-lg">
              Discover fresher-friendly opportunities, follow role-based learning roadmaps, access practical resources, and prepare for interviews—all in one place.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/student/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <FaSearch className="text-sm" />
                Explore Jobs
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-6 py-3.5 text-base font-semibold text-[var(--cl-text)] transition hover:bg-[var(--cl-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cl-focus)]"
              >
                <FaRocket className="text-sm" />
                Create Free Account
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="mx-auto mt-12 max-w-4xl rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)]/90 p-3 shadow-[var(--cl-shadow)] backdrop-blur-md">
            <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto]">
              <label className="block text-left">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cl-text-muted)]">Job title or skill</span>
                <div className="flex items-center gap-3 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-3 text-[var(--cl-text)] transition focus-within:border-[var(--cl-primary)] focus-within:ring-2 focus-within:ring-[var(--cl-ring)]">
                  <FaBriefcase className="text-sm text-[var(--cl-primary)]" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="React Developer, Frontend, Node.js…"
                    className="w-full bg-transparent text-sm text-[var(--cl-text)] placeholder:text-[var(--cl-text-soft)] focus:outline-none"
                    aria-label="Job title or skill"
                  />
                </div>
              </label>

              <label className="block text-left">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cl-text-muted)]">Location</span>
                <div className="flex items-center gap-3 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-3 text-[var(--cl-text)] transition focus-within:border-[var(--cl-primary)] focus-within:ring-2 focus-within:ring-[var(--cl-ring)]">
                  <FaMapMarkerAlt className="text-sm text-violet-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Pune, Bengaluru, Remote…"
                    className="w-full bg-transparent text-sm text-[var(--cl-text)] placeholder:text-[var(--cl-text-soft)] focus:outline-none"
                    aria-label="Location"
                  />
                </div>
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                Search Jobs
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="mr-2 text-sm text-[var(--cl-text-muted)]">Popular:</span>
            {QUICK_SEARCHES.map((search) => (
              <button
                key={search}
                type="button"
                onClick={() => handlePopularSearch(search)}
                className="rounded-full border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-1.5 text-sm font-medium text-[var(--cl-text)] transition hover:border-[var(--cl-primary)] hover:bg-[var(--cl-primary-soft)] hover:text-[var(--cl-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cl-focus)]"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {valueCards.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-6 shadow-[var(--cl-shadow)] transition hover:-translate-y-1 hover:border-[var(--cl-primary)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-300">
                <Icon className="text-xl" />
              </div>
              <h3 className="text-xl font-bold text-[var(--cl-text)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--cl-text-muted)]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cl-primary)]">Trusted companies</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--cl-text)] sm:text-4xl">Discover companies worth knowing</h2>
          </div>
          <Link to="/student/companies" className="hidden items-center gap-2 text-sm font-semibold text-[var(--cl-primary)] transition hover:text-[var(--cl-primary-strong)] sm:inline-flex">
            View All Companies <FaArrowRight className="text-xs" />
          </Link>
        </div>
        {companiesLoading && visibleCompanies.length === 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)]" />
            ))}
          </div>
        ) : companiesError && visibleCompanies.length === 0 ? (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--cl-danger)]/30 bg-[var(--cl-danger-soft)] p-5 text-sm text-[var(--cl-danger)]">
            <span>{companiesError}</span>
            <button type="button" onClick={loadCompanies} className="rounded-xl border border-[var(--cl-danger)]/40 px-4 py-2 font-semibold">Retry</button>
          </div>
        ) : visibleCompanies.length === 0 ? (
          <div className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] px-5 py-8 text-center text-[var(--cl-text-muted)]">
            <p>No public companies are available yet.</p>
            <button type="button" onClick={loadCompanies} className="mt-4 rounded-xl border border-[var(--cl-border)] px-4 py-2 text-sm font-semibold text-[var(--cl-text)]">Retry</button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleCompanies.map((company) => <CompanyCard key={company.placeId} company={company} />)}
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--cl-text-muted)]">
          {companiesUpdating && <span>Updating…</span>}
          {!companiesUpdating && companiesUpdatedAt && <span>{formatUpdatedAt(companiesUpdatedAt)}</span>}
          {companiesError && visibleCompanies.length > 0 && <span className="text-[var(--cl-warning)]">Showing saved results. {companiesError}</span>}
          {visibleCompanies.length > 0 && <span>Company details provided by Google Maps.</span>}
        </div>
      </section>

      <section className="bg-[var(--cl-surface)]/80 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cl-primary)]">Career tools</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--cl-text)] sm:text-4xl">Everything you need to move forward</h2>
            <p className="mt-4 text-[var(--cl-text-muted)]">Find opportunities, build job-ready skills and prepare confidently for your next interview.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map(({ title, description, cta, to, icon: Icon }) => (
              <div key={title} className="flex h-full flex-col rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-6 shadow-[var(--cl-shadow)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-300">
                  <Icon className="text-xl" />
                </div>
                <h3 className="text-xl font-bold text-[var(--cl-text)]">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-[var(--cl-text-muted)]">{description}</p>
                <Link
                  to={to}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--cl-primary)] transition hover:text-[var(--cl-primary-strong)]"
                >
                  {cta} <FaArrowRight className="text-xs" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cl-primary)]">How it works</p>
          <h2 className="mt-3 text-3xl font-bold text-[var(--cl-text)] sm:text-4xl">Move from searching to interview-ready</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Choose your goal",
              text: "Select the role, skill or opportunity you want to pursue.",
            },
            {
              title: "Learn and prepare",
              text: "Use structured roadmaps, practical resources and interview practice.",
            },
            {
              title: "Apply with confidence",
              text: "Discover relevant opportunities and apply through the original job source.",
            },
          ].map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-sm font-bold text-white">
                {index + 1}
              </div>
              <h3 className="text-xl font-bold text-[var(--cl-text)]">{step.title}</h3>
              <p className="mt-3 text-[var(--cl-text-muted)]">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--cl-surface)]/80 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cl-primary)]">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--cl-text)] sm:text-4xl">Frequently asked questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq.question} className="overflow-hidden rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)]">
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-panel-${index}`}
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cl-focus)]"
                >
                  <span className="font-semibold text-[var(--cl-text)]">{faq.question}</span>
                  <FaChevronDown className={`text-[var(--cl-text-muted)] transition ${openFaq === index ? "rotate-180" : ""}`} />
                </button>

                {openFaq === index && (
                  <div id={`faq-panel-${index}`} className="border-t border-[var(--cl-border)] px-5 py-4 text-sm leading-6 text-[var(--cl-text-muted)]">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[var(--cl-primary)]/30 bg-gradient-to-r from-blue-600/90 via-blue-500/90 to-violet-500/90 p-8 text-center shadow-2xl shadow-blue-950/40 sm:p-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-50">
            <FaClipboardList className="text-[10px]" />
            Start your journey
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Take the next step toward your first tech role</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-blue-50/90">
            Explore opportunities, strengthen your skills and prepare for interviews with one focused platform.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Create Free Account
            </Link>
            <Link
              to="/student/jobs"
              className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
