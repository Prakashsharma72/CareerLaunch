import { useState } from "react";
import {
  FaFileAlt, FaCheckCircle, FaExclamationTriangle,
  FaTimes, FaSyncAlt, FaLightbulb,
} from "react-icons/fa";
import Loader from "../../components/common/Loader";

function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [analysis,   setAnalysis]   = useState(null);

  const handleAnalyze = () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume content.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        atsScore: 82,
        missingSkills: ["Redux", "Docker", "CI/CD"],
        suggestions: [
          "Add measurable achievements.",
          "Improve project descriptions.",
          "Include GitHub profile link.",
          "Highlight technical skills section.",
        ],
        careerAdvice:
          "Focus on React, PostgreSQL, and Docker to improve your chances of getting shortlisted for MERN roles.",
      });
      setLoading(false);
    }, 1500);
  };

  if (loading) return <Loader />;

  const scoreColor =
    analysis?.atsScore >= 80 ? "text-emerald-500" :
    analysis?.atsScore >= 60 ? "text-amber-500" : "text-red-500";

  const scoreBg =
    analysis?.atsScore >= 80 ? "bg-emerald-500" :
    analysis?.atsScore >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          AI Resume Analyzer
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
          Analyze your resume and get ATS-friendly suggestions.
        </p>
      </div>

      {/* ── Input card ── */}
      <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
            <FaFileAlt className="text-base" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Paste Resume Content</h2>
        </div>

        <textarea
          rows={12}
          placeholder={`Paste your resume content here…\n\nExample:\nName: Prakash Sharma\nSkills: React, Node.js, PostgreSQL\nProjects: CareerLaunch AI, E-commerce Website\nEducation: B.Tech Computer Science`}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="w-full px-4 py-3 text-sm rounded-xl resize-y
            bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
            text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-neutral-600
            focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!resumeText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
              bg-blue-600 hover:bg-blue-700 text-white transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSyncAlt /> Analyze Resume
          </button>
          {resumeText && (
            <button
              onClick={() => { setResumeText(""); setAnalysis(null); }}
              className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400
                hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <FaTimes className="text-xs" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      {analysis && (
        <div className="space-y-4">

          {/* ATS Score */}
          <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6">
            <h2 className="text-base font-bold text-neutral-800 dark:text-white mb-4">ATS Score</h2>
            <div className="flex items-center gap-5">
              <span className={`text-6xl font-extrabold tracking-tight ${scoreColor}`}>
                {analysis.atsScore}
                <span className="text-3xl">%</span>
              </span>
              <div className="flex-1">
                <div className="bg-neutral-100 dark:bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${scoreBg} h-3 rounded-full transition-all duration-700`}
                    style={{ width: `${analysis.atsScore}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                  {analysis.atsScore >= 80 ? "Great score! Your resume is well-optimised." :
                   analysis.atsScore >= 60 ? "Good, but there's room to improve." :
                   "Needs significant improvement."}
                </p>
              </div>
            </div>
          </div>

          {/* Missing Skills */}
          <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6">
            <h2 className="text-base font-bold text-neutral-800 dark:text-white mb-3">Missing Skills</h2>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill, i) => (
                <span key={i}
                  className="px-3 py-1 rounded-full text-sm font-semibold
                    bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <FaLightbulb className="text-amber-500" />
              <h2 className="text-base font-bold text-neutral-800 dark:text-white">Improvement Suggestions</h2>
            </div>
            <ul className="space-y-3">
              {analysis.suggestions.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <FaCheckCircle className="text-emerald-500 mt-0.5 shrink-0 text-sm" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Career Advice */}
          <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <FaExclamationTriangle className="text-amber-500" />
              <h2 className="text-base font-bold text-neutral-800 dark:text-white">Career Advice</h2>
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
              {analysis.careerAdvice}
            </p>
          </div>

        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
