import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  FaBriefcase, FaBookmark, FaFileAlt, FaRobot,
  FaArrowRight, FaCheckCircle, FaBrain,
  FaChartLine, FaRoad, FaMapMarkerAlt, FaStar,
  FaBolt, FaFire, FaTrophy,
} from "react-icons/fa";
import DashboardCard from "../../components/dashboard/DashboardCard";
import { fetchStats } from "../../services/authService";
import { getAllJobs } from "../../services/jobService";

/* ── helpers ── */
function ProgressRing({ value, size = 64, stroke = 5, color = "#3b82f6" }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-neutral-200 dark:text-white/10" />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (value / 100) * circ }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }} />
    </svg>
  );
}
function Shimmer({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-white/10 ${className}`} />;
}
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-white/3 border border-neutral-200/70 dark:border-white/8
      rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}
function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-base font-semibold text-neutral-800 dark:text-white">{title}</h2>
      {action && (
        <button onClick={action} className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors group">
          View All <FaArrowRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}
const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const itemV = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22,1,0.36,1] } } };

export default function Dashboard() {
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);
  const firstName = user?.name?.split(" ")[0] || "Student";

  const [stats,       setStats]       = useState(null);
  const [statsLoading,setStatsLoading]= useState(true);
  const [recentJobs,  setRecentJobs]  = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await fetchStats();
      setStats(data);
    } catch { setStats(null); }
    finally { setStatsLoading(false); }
  }, []);

  const loadJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const { data } = await getAllJobs({ page: 1, limit: 5 });
      setRecentJobs(data.jobs || []);
    } catch { setRecentJobs([]); }
    finally { setJobsLoading(false); }
  }, []);

  useEffect(() => { loadStats(); loadJobs(); }, [loadStats, loadJobs]);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const resumeScore = stats?.resumeScore ?? 0;
  const interviewPct = Math.min((stats?.interviews ?? 0) * 20, 100);
  const roadmapPct   = Math.min((stats?.roadmaps   ?? 0) * 25, 100);

  const progressData = [
    { label: "Resume Strength",    value: resumeScore,   ringColor: "#22c55e", tw: "from-green-400 to-green-600"   },
    { label: "Interview Readiness",value: interviewPct,  ringColor: "#3b82f6", tw: "from-blue-400 to-blue-600"    },
    { label: "Roadmap Completion", value: roadmapPct,    ringColor: "#8b5cf6", tw: "from-violet-400 to-violet-600" },
  ];

  const quickActions = [
    { label: "Analyze Resume",   color: "from-blue-500 to-blue-600",    icon: FaFileAlt,  action: () => navigate("/student/resume-analyzer")  },
    { label: "Generate Roadmap", color: "from-green-500 to-green-600",  icon: FaRoad,     action: () => navigate("/student/roadmap-generator") },
    { label: "Mock Interview",   color: "from-violet-500 to-violet-600",icon: FaRobot,    action: () => navigate("/student/mock-interview")    },
    { label: "Find Jobs",        color: "from-amber-500 to-amber-600",  icon: FaBriefcase,action: () => navigate("/student/jobs")              },
  ];

  const aiInsights = [
    { icon: FaBolt,       text: resumeScore > 0 ? `Your resume score is ${resumeScore}% — keep improving!` : "Analyze your resume to get an AI score.", color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" },
    { icon: FaFire,       text: recentJobs.length > 0 ? `${recentJobs.length} new jobs match your profile.` : "Search for jobs to see matches.", color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10" },
    { icon: FaChartLine,  text: stats?.appliedJobs > 0 ? `You've applied to ${stats.appliedJobs} jobs — great work!` : "Start applying to jobs to track your progress.", color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
  ];

  return (
    <motion.div variants={containerV} initial="hidden" animate="visible" className="space-y-7 max-w-7xl mx-auto">

      {/* ── Welcome banner ── */}
      <motion.div variants={itemV} className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{ background: "linear-gradient(135deg,#0062c3 0%,#3b82f6 45%,#8b5cf6 100%)" }}>
        <motion.div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle,#60a5fa 0%,transparent 70%)" }}
          animate={{ scale:[1,1.12,1] }} transition={{ duration:8, repeat:Infinity }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3 py-0.5 text-white/90 text-xs font-semibold mb-2">
              <FaTrophy className="text-yellow-300 text-[10px]" /> Welcome back
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{greeting}, {firstName}! 👋</h1>
            <p className="text-white/70 mt-1.5 text-sm">Track your career progress — all data from your MySQL account.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {statsLoading
              ? <><Shimmer className="w-20 h-16 rounded-xl" /><Shimmer className="w-20 h-16 rounded-xl" /></>
              : <>
                  <div className="text-center bg-white/15 border border-white/20 rounded-xl px-4 py-3">
                    <div className="text-2xl font-bold text-white">{stats?.appliedJobs ?? 0}</div>
                    <div className="text-white/60 text-xs mt-0.5">Applications</div>
                  </div>
                  <div className="text-center bg-white/15 border border-white/20 rounded-xl px-4 py-3">
                    <div className="text-2xl font-bold text-white">{resumeScore > 0 ? `${resumeScore}%` : "—"}</div>
                    <div className="text-white/60 text-xs mt-0.5">Resume Score</div>
                  </div>
                </>}
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div variants={itemV} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({length:4}).map((_,i) => <Shimmer key={i} className="h-28 rounded-2xl" />)
          : <>
              <DashboardCard title="Applied Jobs"    value={stats?.appliedJobs  ?? 0}                     icon={<FaBriefcase/>} bgColor="from-blue-500 to-blue-700"    onClick={() => navigate("/student/jobs")} />
              <DashboardCard title="Saved Jobs"      value={stats?.savedJobs    ?? 0}                     icon={<FaBookmark/>}  bgColor="from-green-500 to-green-700"   onClick={() => navigate("/student/saved-jobs")} />
              <DashboardCard title="Resume Score"    value={resumeScore > 0 ? `${resumeScore}%` : "—"}   icon={<FaFileAlt/>}   bgColor="from-amber-500 to-amber-600"   onClick={() => navigate("/student/resume-analyzer")} />
              <DashboardCard title="Mock Interviews" value={stats?.interviews   ?? 0}                     icon={<FaRobot/>}     bgColor="from-violet-500 to-violet-700" onClick={() => navigate("/student/mock-interview")} />
            </>}
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={itemV} className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <SectionHeader title="Recent Jobs" action={() => navigate("/student/jobs")} />
              {jobsLoading
                ? <div className="space-y-3">{Array.from({length:4}).map((_,i) => <Shimmer key={i} className="h-14 rounded-xl" />)}</div>
                : recentJobs.length === 0
                  ? <p className="text-sm text-neutral-400 dark:text-neutral-500">No jobs in database yet. Add jobs from the Admin panel or import them.</p>
                  : <div className="space-y-2">
                      {recentJobs.map((job, i) => (
                        <motion.div key={job.id}
                          initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                          transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                          onClick={() => navigate(`/student/jobs/${job.id}`)}
                          className="flex items-center gap-4 p-3.5 rounded-xl cursor-pointer
                            hover:bg-neutral-50 dark:hover:bg-white/5
                            border border-transparent hover:border-neutral-200/70 dark:hover:border-white/8 transition-all group">
                          <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center
                            bg-blue-50 dark:bg-blue-500/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/30 transition-all">
                            <FaBriefcase className="text-blue-600 dark:text-blue-400 text-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-neutral-800 dark:text-white truncate">{job.title}</span>
                              {job.status === "active" && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full shrink-0">
                                  <FaStar className="text-[8px]" /> Active
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1">
                              <span className="font-medium text-neutral-600 dark:text-neutral-300">{job.company}</span>
                              {job.location && <><span>·</span><FaMapMarkerAlt className="text-[10px]" /><span>{job.location}</span></>}
                            </p>
                          </div>
                          <FaArrowRight className="text-neutral-300 dark:text-neutral-600 text-xs shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </motion.div>
                      ))}
                    </div>}
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <SectionHeader title="AI Insights" />
              <div className="space-y-3">
                {aiInsights.map((insight, i) => {
                  const Icon = insight.icon;
                  return (
                    <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.4 + i * 0.1, duration: 0.35 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-white/4 border border-neutral-100 dark:border-white/6 hover:border-neutral-200 dark:hover:border-white/10 transition-colors">
                      <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${insight.color}`}><Icon className="text-xs" /></div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{insight.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemV} className="space-y-6">
          <Card>
            <div className="p-6">
              <SectionHeader title="Your Progress" />
              {statsLoading
                ? <div className="space-y-4">{Array.from({length:3}).map((_,i) => <Shimmer key={i} className="h-12 rounded-xl" />)}</div>
                : <div className="space-y-5">
                    {progressData.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <ProgressRing value={item.value} size={56} stroke={5} color={item.ringColor} />
                          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-neutral-700 dark:text-neutral-200">
                            {item.value}%
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 truncate">{item.label}</p>
                          <div className="mt-1.5 h-1.5 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div className={`h-full rounded-full bg-linear-to-r ${item.tw}`}
                              initial={{ width: 0 }} animate={{ width: `${item.value}%` }}
                              transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 + i * 0.1 }} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 p-3.5 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200/60 dark:border-green-500/20 flex items-start gap-2.5">
                      <FaCheckCircle className="text-green-500 mt-0.5 shrink-0 text-sm" />
                      <div>
                        <p className="text-sm font-semibold text-neutral-800 dark:text-white">Live from MySQL</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Stats update in real-time from your database.</p>
                      </div>
                    </div>
                  </div>}
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-linear-to-br from-blue-500 to-violet-500">
                  <FaBrain className="text-white text-xs" />
                </div>
                <h2 className="text-base font-semibold text-neutral-800 dark:text-white">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button key={i} onClick={action.action}
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-linear-to-br ${action.color} text-white font-semibold group transition-all`}>
                      <Icon className="text-lg group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-center leading-tight">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
