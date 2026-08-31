import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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
import { getAllJobs } from "../services/jobService";
import JobCard from "../components/Jobs/JobCard";

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

function normalizeJobData(rawJob) {
  if (!rawJob) return null;

  const companyName = rawJob.companyName || rawJob.company || rawJob.name || "CareerLaunch";
  const location = rawJob.address || rawJob.location || rawJob.city || "Remote";
  const title = rawJob.title || rawJob.jobTitle || "Opportunity";

  return {
    id: rawJob.id || rawJob.placeId || rawJob.externalJobId || `${companyName}-${title}`,
    title,
    company: companyName,
    location,
    type: rawJob.type || rawJob.jobType || "Full Time",
    salary: rawJob.salary || rawJob.estimatedSalary || "",
    description: rawJob.description || rawJob.descriptionText || "Explore this opportunity and apply through the original source.",
    createdAt: rawJob.createdAt || rawJob.postedAt || new Date().toISOString(),
  };
}

function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const loadJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAllJobs({ 
        city: "Bengaluru",
        keyword: "software company",
        radius: 25,
        limit: 6,
      });

      const data = Array.isArray(response?.data?.companies)
        ? response.data.companies
        : Array.isArray(response?.data?.jobs)
          ? response.data.jobs
          : [];

      const mapped = data
        .map(normalizeJobData)
        .filter(Boolean)
        .slice(0, 6);

      setJobs(mapped);
      if (!mapped.length) {
        setError("");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 503 || status === 502) {
        setError("warmup");
      } else {
        setError("load");
      }
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadJobs();
  }, []);

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

  const visibleJobs = useMemo(() => jobs.slice(0, 6), [jobs]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.26),_transparent_40%),linear-gradient(135deg,#020817_0%,#0b132b_35%,#171b38_100%)]">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-18 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Built for students and fresh graduates
            </span>

            <h1 className="mt-8 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl lg:text-7xl">
              Find the Right Job. Build the Skills to Get Hired.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <FaRocket className="text-sm" />
                Create Free Account
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="mx-auto mt-12 max-w-4xl rounded-2xl border border-white/10 bg-slate-900/70 p-3 shadow-2xl shadow-slate-950/30 backdrop-blur-md">
            <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto]">
              <label className="block text-left">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Job title or skill</span>
                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-slate-200 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/25">
                  <FaBriefcase className="text-sm text-blue-400" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="React Developer, Frontend, Node.js…"
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
                    aria-label="Job title or skill"
                  />
                </div>
              </label>

              <label className="block text-left">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Location</span>
                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-slate-200 transition focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/25">
                  <FaMapMarkerAlt className="text-sm text-violet-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Pune, Bengaluru, Remote…"
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
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
            <span className="mr-2 text-sm text-slate-400">Popular:</span>
            {QUICK_SEARCHES.map((search) => (
              <button
                key={search}
                type="button"
                onClick={() => handlePopularSearch(search)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-blue-400/70 hover:bg-blue-500/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
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
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:border-blue-500/60"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-300">
                <Icon className="text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Latest opportunities</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Explore jobs that match your goals</h2>
          </div>
          <Link to="/student/jobs" className="hidden items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200 sm:inline-flex">
            View All Jobs <FaArrowRight className="text-xs" />
          </Link>
        </div>

        <p className="mb-8 max-w-2xl text-slate-300">
          Browse recent opportunities and continue to the Jobs page for advanced search and filters.
        </p>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="mb-4 h-10 w-10 animate-pulse rounded-xl bg-slate-700" />
                <div className="mb-3 h-4 w-2/3 animate-pulse rounded bg-slate-700" />
                <div className="mb-2 h-3 w-1/2 animate-pulse rounded bg-slate-700" />
                <div className="mb-4 h-3 w-full animate-pulse rounded bg-slate-700" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-slate-700" />
              </div>
            ))}
          </div>
        ) : error === "warmup" ? (
          <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-5 text-sm text-amber-100">
            The job service is starting. This may take a moment.
          </div>
        ) : error === "load" ? (
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100 sm:flex-row sm:items-center">
            <span>We couldn’t load opportunities right now.</span>
            <button
              type="button"
              onClick={loadJobs}
              className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2 font-semibold text-red-50 transition hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              Try Again
            </button>
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl text-slate-200">
              <FaSearch />
            </div>
            <p className="text-lg font-semibold text-white">No opportunities found for this search.</p>
            <p className="mt-2 text-sm text-slate-400">Try another job title, skill or location.</p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setKeyword("");
                  setLocation("");
                  navigate("/student/jobs");
                }}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-blue-400 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                Clear Search
              </button>
              <Link
                to="/student/jobs"
                className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                Browse All Jobs
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job} isSaved={false} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-900/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Career tools</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Everything you need to move forward</h2>
            <p className="mt-4 text-slate-300">Find opportunities, build job-ready skills and prepare confidently for your next interview.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map(({ title, description, cta, to, icon: Icon }) => (
              <div key={title} className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-lg shadow-slate-950/10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-blue-300">
                  <Icon className="text-xl" />
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">{description}</p>
                <Link
                  to={to}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">How it works</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Move from searching to interview-ready</h2>
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
            <div key={step.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-sm font-bold text-white">
                {index + 1}
              </div>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-3 text-slate-300">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900/60 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Frequently asked questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq.question} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-panel-${index}`}
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  <span className="font-semibold text-white">{faq.question}</span>
                  <FaChevronDown className={`text-slate-300 transition ${openFaq === index ? "rotate-180" : ""}`} />
                </button>

                {openFaq === index && (
                  <div id={`faq-panel-${index}`} className="border-t border-slate-800 px-5 py-4 text-sm leading-6 text-slate-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-600/90 via-blue-500/90 to-violet-500/90 p-8 text-center shadow-2xl shadow-blue-950/40 sm:p-12">
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
