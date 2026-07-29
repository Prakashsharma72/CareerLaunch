import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  FaBriefcase, FaBookmark, FaFileAlt, FaRobot,
  FaTrophy, FaArrowRight, FaCheckCircle, FaBrain,
  FaChartLine, FaRoad, FaMapMarkerAlt, FaStar,
  FaBolt, FaFire,
} from "react-icons/fa";
import DashboardCard from "../../components/dashboard/DashboardCard";

/* ── Progress ring SVG ── */
function ProgressRing({ value, size = 64, stroke = 5, color = "#0ba5ff" }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="currentColor" strokeWidth={stroke} className="text-neutral-200 dark:text-white/10" />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  );
}

/* ── Skeleton loader ── */
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-white/10 ${className}`} />;
}

/* ── Section wrapper card ── */
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-white/3 border border-neutral-200/70 dark:border-white/8
      rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.3)]
      backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

/* ── Section header ── */
function SectionHeader({ title, action, actionLabel = "View All" }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-base font-semibold text-neutral-800 dark:text-white">{title}</h2>
      {action && (
        <button onClick={action}
          className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400
            hover:text-primary-700 dark:hover:text-primary-300 transition-colors group">
          {actionLabel}
          <FaArrowRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}

/* ── Stagger variants ── */
const containerV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const itemV = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const firstName = user?.name?.split(" ")[0] || "Student";

  /* ─── existing data (unchanged) ─── */
  const dashboardStats = {
    appliedJobs: 12,
    savedJobs: 8,
    resumeScore: 85,
    interviews: 5,
  };

  const recentJobs = [
    { id: 1, title: "React Developer",       company: "Google",   location: "Pune",      featured: true  },
    { id: 2, title: "MERN Stack Developer",  company: "Infosys",  location: "Bangalore", featured: false },
    { id: 3, title: "Frontend Developer",    company: "TCS",      location: "Mumbai",    featured: false },
  ];

  const progressData = [
    { label: "Resume Strength",    value: 85, color: "#22c55e", ringColor: "#22c55e",  tw: "from-success-400 to-success-600" },
    { label: "Interview Readiness",value: 70, color: "#0ba5ff", ringColor: "#0ba5ff",  tw: "from-primary-400 to-primary-600" },
    { label: "Roadmap Completion", value: 45, color: "#8b5cf6", ringColor: "#8b5cf6",  tw: "from-accent-400 to-accent-600"  },
  ];

  /* ─── AI insights (UI-only) ─── */
  const aiInsights = [
    { icon: FaBolt,      text: "Your resume score jumped 12% this week!", color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" },
    { icon: FaFire,      text: "3 new React jobs match your profile.",     color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10" },
    { icon: FaChartLine, text: "Interview readiness improving — keep it up!", color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
  ];

  /* ─── Activity timeline (UI-only) ─── */
  const activities = [
    { text: "Applied to React Developer at Google",    time: "2h ago",  dot: "bg-primary-500" },
    { text: "Resume analyzed — score: 85%",            time: "5h ago",  dot: "bg-success-500" },
    { text: "Completed Mock Interview session #3",      time: "1d ago",  dot: "bg-accent-500"  },
    { text: "Saved MERN Stack role at Infosys",        time: "2d ago",  dot: "bg-warning-500" },
  ];

  /* ─── Quick actions ─── */
  const quickActions = [
    { label: "Analyze Resume",    color: "from-primary-500 to-primary-600", icon: FaFileAlt, action: () => navigate("/student/resume-analyzer") },
    { label: "Generate Roadmap",  color: "from-success-500 to-success-600", icon: FaRoad,    action: () => navigate("/student/roadmap-generator") },
    { label: "Mock Interview",    color: "from-accent-500 to-accent-600",   icon: FaRobot,   action: () => navigate("/student/mock-interview") },
    { label: "Find Jobs",         color: "from-warning-500 to-warning-600", icon: FaBriefcase,action: () => navigate("/student/jobs") },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.div variants={containerV} initial="hidden" animate="visible"
      className="space-y-7 max-w-350 mx-auto">

      {/* ── Hero welcome banner ── */}
      <motion.div variants={itemV}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{ background: "linear-gradient(135deg,#0062c3 0%,#0ba5ff 45%,#8b5cf6 100%)" }}
      >
        {/* animated blobs */}
        <motion.div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle,#38bfff 0%,transparent 70%)" }}
          animate={{ scale: [1,1.12,1] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle,#a78bfa 0%,transparent 70%)" }}
          animate={{ scale: [1,1.15,1] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3 py-0.5 text-white/90 text-xs font-semibold">
                <FaTrophy className="text-yellow-300 text-[10px]" /> Premium Member
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {greeting}, {firstName}! 👋
            </h1>
            <p className="text-white/70 mt-1.5 text-sm md:text-base">
              Track your learning, jobs, and AI-powered career progress all in one place.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center bg-white/15 border border-white/20 rounded-xl px-4 py-3">
              <div className="text-2xl font-bold text-white">{dashboardStats.appliedJobs}</div>
              <div className="text-white/60 text-xs mt-0.5">Applications</div>
            </div>
            <div className="text-center bg-white/15 border border-white/20 rounded-xl px-4 py-3">
              <div className="text-2xl font-bold text-white">{dashboardStats.resumeScore}%</div>
              <div className="text-white/60 text-xs mt-0.5">Resume Score</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div variants={itemV} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Applied Jobs"   value={dashboardStats.appliedJobs}          icon={<FaBriefcase />} bgColor="from-primary-500 to-primary-700"  onClick={() => navigate("/student/jobs")} />
        <DashboardCard title="Saved Jobs"     value={dashboardStats.savedJobs}            icon={<FaBookmark />}  bgColor="from-success-500 to-success-700"  onClick={() => navigate("/student/saved-jobs")} />
        <DashboardCard title="Resume Score"   value={`${dashboardStats.resumeScore}%`}    icon={<FaFileAlt />}   bgColor="from-warning-500 to-warning-600"  onClick={() => navigate("/student/resume-analyzer")} />
        <DashboardCard title="Mock Interviews"value={dashboardStats.interviews}           icon={<FaRobot />}     bgColor="from-accent-500 to-accent-700"    onClick={() => navigate("/student/mock-interview")} />
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Recent jobs (2/3) ── */}
        <motion.div variants={itemV} className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <SectionHeader title="Recent Jobs" action={() => navigate("/student/jobs")} />
              <div className="space-y-2">
                {recentJobs.map((job, i) => (
                  <motion.div key={job.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: [0.22,1,0.36,1] }}
                    onClick={() => navigate(`/student/jobs/${job.id}`)}
                    className="flex items-center gap-4 p-3.5 rounded-xl cursor-pointer
                      hover:bg-neutral-50 dark:hover:bg-white/5
                      border border-transparent hover:border-neutral-200/70 dark:hover:border-white/8
                      transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center
                      bg-linear-to-br from-primary-100 to-primary-200 dark:from-primary-500/20 dark:to-primary-600/20
                      group-hover:from-primary-200 group-hover:to-primary-300 dark:group-hover:from-primary-500/30 transition-all">
                      <FaBriefcase className="text-primary-600 dark:text-primary-400 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-neutral-800 dark:text-white truncate">{job.title}</span>
                        {job.featured && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold rounded-full shrink-0">
                            <FaStar className="text-[8px]" /> Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300">{job.company}</span>
                        <span>·</span>
                        <FaMapMarkerAlt className="text-[10px]" />
                        <span>{job.location}</span>
                      </p>
                    </div>
                    <FaArrowRight className="text-neutral-300 dark:text-neutral-600 text-xs shrink-0
                      opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>

          {/* ── Activity timeline ── */}
          <Card>
            <div className="p-6">
              <SectionHeader title="Recent Activity" />
              <div className="relative space-y-0">
                <div className="absolute left-1.75 top-2 bottom-2 w-px bg-neutral-200 dark:bg-white/10" />
                {activities.map((a, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.07, duration: 0.35 }}
                    className="flex items-start gap-4 pb-4 last:pb-0"
                  >
                    <div className={`w-3.5 h-3.5 rounded-full shrink-0 mt-1 border-2 border-white dark:border-[#0d0f1e] ${a.dot}`} />
                    <div className="flex-1">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">{a.text}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5">{a.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Right column (1/3) ── */}
        <motion.div variants={itemV} className="space-y-6">

          {/* Progress rings */}
          <Card>
            <div className="p-6">
              <SectionHeader title="Your Progress" />
              <div className="space-y-5">
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
              </div>
              <div className="mt-5 p-3.5 rounded-xl bg-success-50 dark:bg-success-500/10 border border-success-200/60 dark:border-success-500/20 flex items-start gap-2.5">
                <FaCheckCircle className="text-success-500 mt-0.5 shrink-0 text-sm" />
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-white">Great Progress!</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Keep working on your interview skills to reach 85% readiness.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* AI Insights */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
                  <FaBrain className="text-white text-xs" />
                </div>
                <h2 className="text-base font-semibold text-neutral-800 dark:text-white">AI Insights</h2>
              </div>
              <div className="space-y-3">
                {aiInsights.map((insight, i) => {
                  const Icon = insight.icon;
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.35 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-white/4
                        border border-neutral-100 dark:border-white/6 hover:border-neutral-200 dark:hover:border-white/10 transition-colors"
                    >
                      <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${insight.color}`}>
                        <Icon className="text-xs" />
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{insight.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Quick actions ── */}
      <motion.div variants={itemV}>
        <Card className="p-6">
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button key={i} onClick={action.action}
                  whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative overflow-hidden flex flex-col items-center gap-2.5 p-5 rounded-xl
                    bg-linear-to-br ${action.color} text-white font-semibold group transition-all`}
                >
                  {/* shimmer */}
                  <motion.span className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent"
                    initial={{ x: "-100%" }} animate={{ x: "200%" }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 + i * 0.4 }}
                    aria-hidden="true" />
                  <Icon className="text-xl group-hover:scale-110 transition-transform relative z-10" />
                  <span className="text-xs relative z-10">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </Card>
      </motion.div>

    </motion.div>
  );
}

export default Dashboard;
