import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  FaArrowRight, FaBookmark, FaBookOpen, FaBolt, FaBrain, FaBriefcase,
  FaBuilding, FaCheckCircle, FaChevronRight, FaClock, FaCode, FaCompass,
  FaChartLine, FaFire, FaMapMarkerAlt, FaRobot, FaRoad, FaSearch, FaUser,
} from "react-icons/fa";
import { fetchStats } from "../../services/authService";
import { getAllJobs } from "../../services/jobService";
import { getRoadmaps } from "../../services/roadmapService";

const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const itemV = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

function Shimmer({ className = "" }) { return <div className={`animate-pulse rounded-lg bg-[var(--cl-surface-soft)] ${className}`} />; }

function Card({ children, className = "" }) {
  return <section className={`cl-card ${className}`}>{children}</section>;
}

function SectionHeader({ title, icon: Icon, action, actionLabel = "View all" }) {
  return <div className="mb-4 flex items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-2.5">
      {Icon && <Icon className="shrink-0 text-[var(--cl-primary)]" />}
      <h2 className="truncate text-lg font-semibold text-[var(--cl-text)]">{title}</h2>
    </div>
    {action && <button type="button" onClick={action} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--cl-primary)] hover:text-[var(--cl-primary-strong)]">
      {actionLabel} <FaArrowRight className="text-[10px]" />
    </button>}
  </div>;
}

function MetricCard({ title, value, helper, icon: Icon, tone, onClick }) {
  const tones = {
    blue: "bg-blue-500/15 text-blue-500 dark:text-blue-300",
    teal: "bg-teal-500/15 text-teal-600 dark:text-teal-300",
    amber: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
    purple: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  };
  return <button type="button" onClick={onClick} className="group cl-card flex min-h-[116px] w-full items-center gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--cl-primary)] sm:p-5">
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${tones[tone]}`}><Icon /></span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-xs font-semibold text-[var(--cl-text-muted)]">{title}</span>
      <span className="mt-1 block text-3xl font-bold leading-none text-[var(--cl-text)]">{value}</span>
      <span className="mt-1 block truncate text-[11px] text-[var(--cl-text-soft)]">{helper}</span>
    </span>
    <FaChevronRight className="shrink-0 text-xs text-[var(--cl-text-soft)] transition group-hover:translate-x-0.5 group-hover:text-[var(--cl-primary)]" />
  </button>;
}

function ProgressRing({ value, color }) {
  const radius = 23;
  const circumference = 2 * Math.PI * radius;
  return <div className="relative h-14 w-14 shrink-0">
    <svg className="-rotate-90" width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--cl-track)" strokeWidth="5" />
      <motion.circle cx="28" cy="28" r={radius} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference - (value / 100) * circumference }} transition={{ duration: 0.9 }} />
    </svg>
    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[var(--cl-text)]">{value}%</span>
  </div>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const firstName = user?.name?.split(" ")[0] || "Student";
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setJobsLoading(true);
    const [statsResult, jobsResult, roadmapsResult] = await Promise.allSettled([
      fetchStats(),
      getAllJobs({ source: "database", page: 1, limit: 5 }),
      getRoadmaps({ page: 1, limit: 3, sort: "newest" }),
    ]);
    if (statsResult.status === "fulfilled") setStats(statsResult.value.data);
    if (jobsResult.status === "fulfilled") setRecentJobs(jobsResult.value.data?.jobs || []);
    if (roadmapsResult.status === "fulfilled") setRoadmaps(roadmapsResult.value.data?.data || []);
    setLoading(false);
    setJobsLoading(false);
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const interviewPct = Math.min((stats?.interviews ?? 0) * 20, 100);
  const roadmapPct = Math.min((stats?.roadmaps ?? 0) * 25, 100);

  const activity = useMemo(() => [
    stats?.interviews > 0 && { icon: FaRobot, value: stats.interviews, title: "Mock interviews completed", tone: "purple", action: () => navigate("/student/mock-interview") },
    stats?.savedCompanies > 0 && { icon: FaBuilding, value: stats.savedCompanies, title: "Saved companies", tone: "teal", action: () => navigate("/student/saved-companies") },
    recentJobs.length > 0 && { icon: FaBriefcase, value: recentJobs.length, title: "Recent job listings", tone: "blue", action: () => navigate("/student/jobs") },
  ].filter(Boolean), [navigate, recentJobs.length, stats]);

  const nextSteps = [
    { icon: FaBookOpen, title: "Explore learning roadmaps", text: "Build skills with step-by-step guides.", action: () => navigate("/student/roadmap-generator"), tone: "blue" },
    { icon: FaBuilding, title: "Review saved companies", text: "Keep track of companies you are interested in.", action: () => navigate("/student/saved-companies"), tone: "teal" },
    { icon: FaRobot, title: "Practice an interview", text: "Sharpen your skills with AI-powered practice.", action: () => navigate("/student/mock-interview"), tone: "purple" },
  ];

  const quickAccess = [
    { icon: FaBookOpen, title: "Resources", text: "Helpful guides and tips", action: () => navigate("/student/resources"), tone: "blue" },
    { icon: FaUser, title: "My profile", text: "Manage your information", action: () => navigate("/student/profile"), tone: "teal" },
    { icon: FaBookmark, title: "Saved companies", text: "View saved companies", action: () => navigate("/student/saved-companies"), tone: "purple" },
  ];

  return <motion.main variants={containerV} initial="hidden" animate="visible" className="cl-page mx-auto max-w-7xl space-y-4 p-4 sm:space-y-5 sm:p-6 lg:space-y-5 lg:p-6">
    <motion.section variants={itemV} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="mb-1 text-xs font-semibold text-[var(--cl-text-muted)]">Welcome back <span aria-hidden="true">👋</span></p>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--cl-text)] sm:text-3xl">{greeting}, {firstName}</h1>
        <p className="mt-1 text-sm text-[var(--cl-text-muted)]">Take the next step in your career.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => navigate("/student/jobs")} className="cl-primary-btn inline-flex items-center gap-2 px-4 text-sm"><FaSearch /> Explore jobs</button>
        <button type="button" onClick={() => navigate("/student/mock-interview")} className="cl-secondary-btn inline-flex items-center gap-2 px-4 text-sm"><FaRobot /> Practice interview</button>
      </div>
    </motion.section>

    <motion.section variants={itemV} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {loading ? Array.from({ length: 4 }).map((_, index) => <Shimmer key={index} className="min-h-[116px]" />) : <>
        <MetricCard title="Saved jobs" value={stats?.savedJobs ?? 0} helper="Jobs you've saved" icon={FaBriefcase} tone="blue" onClick={() => navigate("/student/saved-jobs")} />
        <MetricCard title="Saved companies" value={stats?.savedCompanies ?? 0} helper="Companies you're following" icon={FaBuilding} tone="teal" onClick={() => navigate("/student/saved-companies")} />
        <MetricCard title="Roadmaps started" value={stats?.roadmaps ?? 0} helper="Learning paths in progress" icon={FaRoad} tone="amber" onClick={() => navigate("/student/roadmap-generator")} />
        <MetricCard title="Mock interviews" value={stats?.interviews ?? 0} helper="Practice interviews completed" icon={FaRobot} tone="purple" onClick={() => navigate("/student/mock-interview")} />
      </>}
    </motion.section>

    <section className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
      <div className="space-y-4">
        <motion.div variants={itemV}><Card className="p-4 sm:p-5"><SectionHeader title="Recent jobs" icon={FaClock} action={() => navigate("/student/jobs")} />
          {jobsLoading ? <div className="space-y-2"><Shimmer className="h-14" /><Shimmer className="h-14" /><Shimmer className="h-14" /></div> : recentJobs.length === 0 ? <div className="flex min-h-[150px] flex-col items-center justify-center text-center"><FaBriefcase className="text-3xl text-[var(--cl-text-soft)]" /><p className="mt-3 text-sm font-semibold text-[var(--cl-text)]">New opportunities are on the way</p><p className="mt-1 text-xs text-[var(--cl-text-muted)]">Check back soon for new roles.</p></div> : <div className="space-y-1">{recentJobs.map(job => <button type="button" key={job.id} onClick={() => navigate(`/student/jobs/${job.id}`)} className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-[var(--cl-surface-soft)]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500"><FaBriefcase /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-[var(--cl-text)]">{job.title}</strong><span className="mt-0.5 flex items-center gap-1 truncate text-xs text-[var(--cl-text-muted)]"><span className="truncate">{job.company}</span>{job.location && <><span>·</span><FaMapMarkerAlt className="shrink-0 text-[10px]" /><span className="truncate">{job.location}</span></>}</span></span><FaChevronRight className="text-xs text-[var(--cl-text-soft)] transition group-hover:translate-x-0.5" /></button>)}</div>}
        </Card></motion.div>

        <motion.div variants={itemV}><Card className="p-4 sm:p-5"><SectionHeader title="Start your learning journey" icon={FaBookOpen} />
          {roadmaps.length === 0 ? <p className="py-5 text-sm text-[var(--cl-text-muted)]">No published roadmaps are available yet.</p> : <div className="grid gap-3 sm:grid-cols-3">{roadmaps.map(roadmap => <button type="button" key={roadmap.id} onClick={() => navigate(`/student/roadmaps/${roadmap.id}`)} className="group rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] p-3 text-left transition hover:border-[var(--cl-primary)]"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500"><FaCode /></span><strong className="mt-3 block truncate text-sm text-[var(--cl-text)]">{roadmap.title}</strong><span className="mt-1 block line-clamp-2 text-xs text-[var(--cl-text-muted)]">{roadmap.shortDescription || roadmap.category || "Published learning path"}</span><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--cl-primary)]">Explore roadmap <FaArrowRight className="text-[10px]" /></span></button>)}</div>}
        </Card></motion.div>
      </div>

      <div className="space-y-4">
        <motion.div variants={itemV}><Card className="p-4 sm:p-5"><SectionHeader title="Your activity" icon={FaChartLine} />
          {activity.length === 0 ? <p className="py-5 text-sm text-[var(--cl-text-muted)]">Your activity will appear here as you use CareerLaunch AI.</p> : <div className="space-y-1">{activity.map(item => <button type="button" key={item.title} onClick={item.action} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-[var(--cl-surface-soft)]"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.tone === "purple" ? "bg-violet-500/15 text-violet-500" : item.tone === "teal" ? "bg-teal-500/15 text-teal-500" : "bg-blue-500/15 text-blue-500"}`}><item.icon /></span><strong className="min-w-0 flex-1 truncate text-sm text-[var(--cl-text)]"><span className="mr-2">{item.value}</span>{item.title}</strong><FaChevronRight className="text-xs text-[var(--cl-text-soft)]" /></button>)}</div>}
        </Card></motion.div>

        <motion.div variants={itemV}><Card className="p-4 sm:p-5"><SectionHeader title="Next steps" icon={FaCompass} /><div className="divide-y divide-[var(--cl-border)]">{nextSteps.map(step => <button type="button" key={step.title} onClick={step.action} className="flex w-full items-center gap-3 py-3 text-left first:pt-0 last:pb-0"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${step.tone === "purple" ? "bg-violet-500/15 text-violet-500" : step.tone === "teal" ? "bg-teal-500/15 text-teal-500" : "bg-blue-500/15 text-blue-500"}`}><step.icon /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-[var(--cl-text)]">{step.title}</strong><span className="mt-0.5 block truncate text-xs text-[var(--cl-text-muted)]">{step.text}</span></span><FaChevronRight className="text-xs text-[var(--cl-text-soft)]" /></button>)}</div>
        </Card></motion.div>
      </div>
    </section>

    <motion.section variants={itemV}><Card className="p-4 sm:p-5"><SectionHeader title="Quick access" icon={FaBolt} /><div className="grid gap-2 sm:grid-cols-3">{quickAccess.map(item => <button type="button" key={item.title} onClick={item.action} className="group flex items-center gap-3 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] p-3 text-left transition hover:border-[var(--cl-primary)]"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.tone === "purple" ? "bg-violet-500/15 text-violet-500" : item.tone === "teal" ? "bg-teal-500/15 text-teal-500" : "bg-blue-500/15 text-blue-500"}`}><item.icon /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-[var(--cl-text)]">{item.title}</strong><span className="block truncate text-xs text-[var(--cl-text-muted)]">{item.text}</span></span><FaChevronRight className="text-xs text-[var(--cl-text-soft)]" /></button>)}</div></Card></motion.section>

    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="p-4 sm:p-5"><SectionHeader title="Your progress" icon={FaChartLine} /><div className="grid gap-4 sm:grid-cols-2">{[["Interview readiness", interviewPct, "#3b82f6"], ["Roadmap completion", roadmapPct, "#8b5cf6"]].map(([label, value, color]) => <div key={label} className="flex items-center gap-3"><ProgressRing value={value} color={color} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[var(--cl-text)]">{label}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--cl-track)]"><div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} /></div></div></div>)}</div></Card>
      <Card className="p-4 sm:p-5"><SectionHeader title="AI insights" icon={FaBrain} /><div className="space-y-2"><p className="rounded-lg bg-[var(--cl-surface-soft)] p-3 text-sm text-[var(--cl-text-muted)]"><FaBolt className="mr-2 text-amber-500" />{stats?.interviews > 0 ? `You've completed ${stats.interviews} mock interviews. Keep practising!` : "Start a mock interview to test your skills."}</p><p className="rounded-lg bg-[var(--cl-surface-soft)] p-3 text-sm text-[var(--cl-text-muted)]"><FaFire className="mr-2 text-orange-500" />{recentJobs.length > 0 ? `${recentJobs.length} job listings are ready to explore.` : "Search for jobs to see matching opportunities."}</p></div></Card>
    </section>

    <motion.div variants={itemV} className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-[var(--cl-text-muted)]"><FaCheckCircle className="text-emerald-500" /><span><strong className="text-[var(--cl-text)]">Data status</strong> Your dashboard metrics are connected to your account data.</span></motion.div>
  </motion.main>;
}
