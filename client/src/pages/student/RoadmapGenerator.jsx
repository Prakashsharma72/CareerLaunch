import { useState } from "react";
import {
  FaRoad, FaCalendarAlt, FaProjectDiagram,
  FaBookOpen, FaSyncAlt,
} from "react-icons/fa";
import Loader from "../../components/common/Loader";

const CAREER_PATHS = [
  "MERN Stack Developer",
  "React Developer",
  "Java Developer",
  "Full Stack Developer",
  "Python Developer",
  "DevOps Engineer",
];

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];

function RoadmapGenerator() {
  const [careerPath,       setCareerPath]       = useState("MERN Stack Developer");
  const [experienceLevel,  setExperienceLevel]  = useState("Beginner");
  const [loading,          setLoading]          = useState(false);
  const [roadmap,          setRoadmap]          = useState(null);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setRoadmap({
        title: "MERN Stack Developer Roadmap",
        duration: "6 Months",
        months: [
          { month: "Month 1", topics: ["HTML", "CSS", "JavaScript Basics", "Git & GitHub"] },
          { month: "Month 2", topics: ["Advanced JavaScript", "ES6+", "DOM", "Async JavaScript"] },
          { month: "Month 3", topics: ["React Basics", "Hooks", "React Router", "State Management"] },
          { month: "Month 4", topics: ["Node.js", "Express.js", "REST APIs", "Authentication"] },
          { month: "Month 5", topics: ["PostgreSQL", "Database Design", "Joins", "Indexes"] },
          { month: "Month 6", topics: ["Full Stack Projects", "Deployment", "Interview Prep", "Resume Building"] },
        ],
        projects: ["Todo App", "Blog Platform", "E-commerce Website", "CareerLaunch AI"],
        skills: ["React", "Node.js", "Express", "PostgreSQL", "JWT", "Git", "REST API"],
      });
      setLoading(false);
    }, 1500);
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          AI Roadmap Generator
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
          Generate a personalised learning roadmap based on your career goal.
        </p>
      </div>

      {/* ── Form card ── */}
      <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6 space-y-5">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Select Career Goal</h2>

        <div className="grid md:grid-cols-2 gap-4">

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Career Path
            </label>
            <select
              value={careerPath}
              onChange={(e) => setCareerPath(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl
                bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                text-gray-800 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
            >
              {CAREER_PATHS.map((p) => (
                <option key={p} value={p} className="bg-white dark:bg-[#0f1123]">{p}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl
                bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                text-gray-800 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
            >
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l} value={l} className="bg-white dark:bg-[#0f1123]">{l}</option>
              ))}
            </select>
          </div>

        </div>

        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
            bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <FaSyncAlt /> Generate Roadmap
        </button>
      </div>

      {/* ── Result ── */}
      {roadmap && (
        <div className="space-y-4">

          {/* Title + duration */}
          <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
                <FaRoad className="text-base" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{roadmap.title}</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Duration: {roadmap.duration}</p>
              </div>
            </div>
          </div>

          {/* Monthly timeline */}
          <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                <FaCalendarAlt className="text-base" />
              </div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Learning Timeline</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roadmap.months.map((m, i) => (
                <div key={i}
                  className="rounded-xl border border-neutral-100 dark:border-white/8
                    bg-gray-50 dark:bg-white/3 p-4 space-y-3">
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-white">{m.month}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {m.topics.map((t, idx) => (
                      <span key={idx}
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold
                          bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 shrink-0">
                <FaProjectDiagram className="text-base" />
              </div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Recommended Projects</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {roadmap.projects.map((p, i) => (
                <div key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl
                    bg-gray-50 dark:bg-white/5 border border-neutral-100 dark:border-white/8">
                  <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-500/20
                    text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-neutral-800 dark:text-white">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                <FaBookOpen className="text-base" />
              </div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Skills To Master</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {roadmap.skills.map((s, i) => (
                <span key={i}
                  className="px-3 py-1 rounded-full text-sm font-semibold
                    bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  {s}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default RoadmapGenerator;
