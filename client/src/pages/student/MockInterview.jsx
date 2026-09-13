/**
 * MockInterview.jsx
 *
 * Responsive:
 *  Mobile  : single column, chat window h-72 sm:h-96, input bar stacks vertically,
 *            report cards full-width single column
 *  Tablet+ : input bar stays in a row, report uses sm:grid-cols-2 for strengths/weaknesses
 *  All     : no horizontal overflow, touch-friendly button sizes
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRobot, FaUser, FaPaperPlane, FaForward, FaStop,
  FaRedo, FaHistory, FaTimes, FaChevronDown,
  FaCheckCircle, FaExclamationCircle, FaLightbulb,
  FaTrophy, FaChartBar, FaArrowRight, FaStar,
  FaCode, FaBrain, FaGraduationCap, FaBookOpen,
  FaSpinner, FaPlay, FaAngleRight,
} from "react-icons/fa";
import {
  startInterviewSession,
  submitInterviewAnswer,
  skipInterviewQuestion,
  endInterviewSession,
  getInterviewHistory,
  getInterviewSession,
} from "../../services/aiService";

/* ── constants ── */
const ROLES = [
  "Frontend Developer", "Backend Developer", "MERN Stack Developer",
  "Full Stack Developer", "React Developer", "Node.js Developer",
  "Java Developer", "Python Developer", "DevOps Engineer",
  "Data Scientist", "Machine Learning Engineer", "Mobile Developer",
  "Cloud Engineer", "System Design", "DSA / Competitive Programming",
];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const TOTAL_Q      = 12;

/* ── score helpers ── */
const scoreColor = s => s >= 8 ? "text-green-500" : s >= 6 ? "text-yellow-500" : s >= 4 ? "text-orange-500" : "text-red-500";
const scoreBg    = s => s >= 8
  ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20"
  : s >= 6
  ? "bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20"
  : s >= 4
  ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20"
  : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20";
const gradeColor = g => ({
  "A+": "text-green-400", A: "text-green-500", "B+": "text-blue-400", B: "text-blue-500",
  "C+": "text-yellow-400", C: "text-yellow-500", D: "text-orange-500", F: "text-red-500",
}[g] ?? "text-neutral-500");

const categoryIcon = c =>
  c === "behavioral" ? <FaUser    className="text-purple-400 text-xs" />
  : c === "conceptual" ? <FaBrain  className="text-blue-400 text-xs" />
  : <FaCode className="text-green-400 text-xs" />;

function ts() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── Card ── */
function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] shadow-[var(--cl-shadow)] ${className}`}>
      {children}
    </div>
  );
}

/* ── TypingDots ── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.span key={i} className="w-2 h-2 bg-blue-400 rounded-full block"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </div>
  );
}

/* ── ProgressBar ── */
function ProgressBar({ answered, total }) {
  const pct = Math.round((answered / total) * 100);
  return (
    <div className="w-full">
      <div className="mb-1.5 flex justify-between text-xs text-[var(--cl-text-muted)]">
        <span>Question {answered} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--cl-track)]">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
          animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
      </div>
    </div>
  );
}

/* ── ScoreBadge ── */
function ScoreBadge({ score }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold border ${scoreBg(score)}`}>
      <FaStar className={`text-xs ${scoreColor(score)}`} />
      <span className={scoreColor(score)}>{score}/10</span>
    </div>
  );
}

/* ── FeedbackCard ── */
function FeedbackCard({ feedback, onNext, isLast }) {
  const [open, setOpen] = useState(true);
  if (!feedback) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className={`rounded-2xl border p-4 space-y-3 ${scoreBg(feedback.score)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaRobot className="text-blue-500" />
          <span className="font-semibold text-sm text-neutral-800 dark:text-white">AI Feedback</span>
        </div>
        <div className="flex items-center gap-2">
          <ScoreBadge score={feedback.score} />
          <button onClick={() => setOpen(!open)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <motion.span animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
              <FaChevronDown className="text-xs" />
            </motion.span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="space-y-3 pt-1">
              {feedback.strengths?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1.5">✓ Strengths</p>
                  <ul className="space-y-1">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                        <FaCheckCircle className="text-green-500 mt-0.5 shrink-0 text-[10px]" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {feedback.weaknesses?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1.5">✗ Weaknesses</p>
                  <ul className="space-y-1">
                    {feedback.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                        <FaExclamationCircle className="text-red-400 mt-0.5 shrink-0 text-[10px]" />{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {feedback.idealAnswer && (
                <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-neutral-200/60 dark:border-white/10">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
                    <FaLightbulb className="inline mr-1" />Ideal Answer
                  </p>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{feedback.idealAnswer}</p>
                </div>
              )}
              {feedback.tip && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20">
                  <FaLightbulb className="text-blue-500 mt-0.5 shrink-0 text-xs" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">{feedback.tip}</p>
                </div>
              )}
            </div>
            {onNext && (
              <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }} onClick={onNext}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white
                  bg-linear-to-r from-blue-500 to-violet-500 hover:shadow-lg transition-shadow">
                {isLast ? "View Report" : "Next Question"} <FaArrowRight className="text-xs" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── InterviewReport ── */
function InterviewReport({ report, session, onRestart, onHistory }) {
  if (!report) return null;
  const pct = Math.round(((report.overallScore ?? 0) / 10) * 100);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-5">

      {/* Header card */}
      <Card className="p-4 sm:p-6 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg,#0062c3,#0ba5ff,#8b5cf6)", opacity: 0.06 }} />
        {/* stacks on mobile, row on sm+ */}
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FaTrophy className="text-yellow-400 text-xl shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">Interview Complete!</h2>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{session?.role} · {session?.difficulty}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{report.summary}</p>
          </div>
          {/* score row — wraps on very small screens */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap shrink-0">
            <div className="text-center">
              <div className={`text-3xl sm:text-4xl font-extrabold ${gradeColor(report.grade)}`}>{report.grade}</div>
              <div className="text-xs text-neutral-400 mt-0.5">Grade</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl sm:text-4xl font-extrabold ${scoreColor(report.overallScore)}`}>
                {report.overallScore?.toFixed(1)}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">Score/10</div>
            </div>
            <div className="text-center">
              <div className={`text-xl sm:text-2xl font-bold ${report.jobReady ? "text-green-500" : "text-orange-500"}`}>
                {report.jobReady ? "✓ Ready" : "Not Yet"}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">Job Ready</div>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <div className="h-2.5 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-linear-to-r from-blue-500 to-violet-500"
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }} />
          </div>
        </div>
      </Card>

      {/* Category breakdown */}
      {report.categoryBreakdown && (
        <Card className="p-4 sm:p-5">
          <h3 className="text-xs font-bold text-neutral-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <FaChartBar className="text-blue-500" /> Category Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(report.categoryBreakdown).map(([cat, data]) => (
              <div key={cat} className="p-3 rounded-xl bg-neutral-50 dark:bg-white/4 border border-neutral-100 dark:border-white/8">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 capitalize">{cat}</span>
                  <span className={`text-sm font-bold ${scoreColor(data.score)}`}>{data.score?.toFixed(1)}/10</span>
                </div>
                <div className="h-1.5 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-linear-to-r from-blue-400 to-violet-400"
                    initial={{ width: 0 }} animate={{ width: `${(data.score / 10) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.4 }} />
                </div>
                {data.comment && <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">{data.comment}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Strengths + Weaknesses — 1 col on mobile, 2 col on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 sm:p-5">
          <h3 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-3">✓ Strengths</h3>
          <ul className="space-y-2">
            {(report.strengths ?? []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <FaCheckCircle className="text-green-500 mt-0.5 shrink-0 text-xs" />{s}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-4 sm:p-5">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">✗ Weaknesses</h3>
          <ul className="space-y-2">
            {(report.weaknesses ?? []).map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <FaExclamationCircle className="text-red-400 mt-0.5 shrink-0 text-xs" />{w}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Improvements */}
      {report.improvementSuggestions?.length > 0 && (
        <Card className="p-4 sm:p-5">
          <h3 className="text-xs font-bold text-neutral-800 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
            <FaLightbulb className="text-yellow-400" /> Improvement Suggestions
          </h3>
          <ul className="space-y-2">
            {report.improvementSuggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <FaAngleRight className="text-blue-500 mt-0.5 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recommended resources */}
      {report.recommendedResources?.length > 0 && (
        <Card className="p-4 sm:p-5">
          <h3 className="text-xs font-bold text-neutral-800 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
            <FaBookOpen className="text-violet-500" /> Recommended Resources
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {report.recommendedResources.map((r, i) => (
              <a key={i}
                href={r.url?.startsWith("http") ? r.url : `https://www.google.com/search?q=${encodeURIComponent(r.url ?? r.title)}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl
                  bg-neutral-50 dark:bg-white/4 border border-neutral-100 dark:border-white/8
                  hover:border-blue-300 dark:hover:border-blue-500/40 transition-colors group">
                <FaGraduationCap className="text-blue-500 shrink-0 text-sm" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate
                    group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {r.title}
                  </p>
                  <p className="text-[10px] text-neutral-400 capitalize">{r.type}</p>
                </div>
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Next steps */}
      {report.nextSteps?.length > 0 && (
        <Card className="p-4 sm:p-5">
          <h3 className="text-xs font-bold text-neutral-800 dark:text-white uppercase tracking-widest mb-3">🚀 Next Steps</h3>
          <ol className="space-y-2">
            {report.nextSteps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20
                  text-blue-600 dark:text-blue-400 text-[10px] font-bold
                  flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Encouragement */}
      {report.encouragement && (
        <div className="p-4 rounded-2xl text-center text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg,#0062c3,#8b5cf6)" }}>
          {report.encouragement}
        </div>
      )}

      {/* Actions — full-width on mobile */}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} onClick={onRestart}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2
            px-5 py-2.5 rounded-xl text-sm font-semibold text-white
            bg-linear-to-r from-blue-500 to-violet-500 shadow hover:shadow-lg transition-shadow">
          <FaRedo className="text-xs" /> New Interview
        </motion.button>
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} onClick={onHistory}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2
            px-5 py-2.5 rounded-xl text-sm font-semibold
            text-neutral-700 dark:text-neutral-300
            bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10
            hover:border-blue-300 dark:hover:border-blue-500/40 transition-colors">
          <FaHistory className="text-xs" /> Interview History
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── HistoryPanel ── */
function HistoryPanel({ history, onSelect, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }} className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-neutral-800 dark:text-white flex items-center gap-2">
          <FaHistory className="text-blue-500" /> Interview History
        </h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <FaTimes />
        </button>
      </div>
      {history.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 dark:text-neutral-600 text-sm">
          No past interviews yet.
        </div>
      ) : (
        history.map(s => (
          <motion.div key={s.id} whileHover={{ y: -1 }} onClick={() => onSelect(s.id)}
            className="p-4 rounded-2xl border border-neutral-200 dark:border-white/8 bg-white dark:bg-white/3
              hover:border-blue-300 dark:hover:border-blue-500/40 cursor-pointer transition-colors group">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-neutral-800 dark:text-white truncate">{s.role}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {s.difficulty} · {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
                {s.overallScore > 0 && <ScoreBadge score={s.overallScore} />}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${s.status === "completed"
                    ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400"
                    : "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400"}`}>
                  {s.status}
                </span>
                <FaArrowRight className="text-neutral-300 dark:text-neutral-600 text-xs
                  group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
function MockInterview() {
  const [view,       setView]       = useState("setup");
  const [role,       setRole]       = useState("MERN Stack Developer");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [session,    setSession]    = useState(null);
  const [currentQuestion,  setCurrentQuestion]  = useState(null);
  const [answeredCount,    setAnsweredCount]     = useState(0);
  const [messages,         setMessages]          = useState([]);
  const [inputText,        setInputText]         = useState("");
  const [typing,           setTyping]            = useState(false);
  const [aiLoading,        setAiLoading]         = useState(false);
  const [pendingFeedback,  setPendingFeedback]   = useState(null);
  const [report,           setReport]            = useState(null);
  const [endLoading,       setEndLoading]        = useState(false);
  const [history,          setHistory]           = useState([]);
  const [histLoading,      setHistLoading]       = useState(false);
  const [selectedSession,  setSelectedSession]   = useState(null);
  const [error,            setError]             = useState("");

  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const pushMsg = useCallback(msg => {
    setMessages(p => [...p, { id: Date.now() + Math.random(), time: ts(), ...msg }]);
  }, []);

  /* START */
  const handleStart = async () => {
    try {
      setError(""); setAiLoading(true);
      setMessages([]); setPendingFeedback(null);
      pushMsg({ type: "system", content: `Starting ${role} interview at ${difficulty} level…` });
      setTyping(true);
      const res = await startInterviewSession(role, difficulty);
      const { session: sess, question } = res.data;
      setSession(sess); setCurrentQuestion(question); setAnsweredCount(0); setTyping(false);
      pushMsg({ type: "question", content: question.text, category: question.category, number: question.number });
      setView("interview");
    } catch (err) {
      setTyping(false);
      const code = err?.response?.data?.code;
      if (code === "NO_API_KEY") {
        setError("Gemini API key is not configured. Add GEMINI_API_KEY to server/.env — get a free key at aistudio.google.com/app/apikey");
      } else if (code === "INVALID_KEY") {
        setError("Gemini API key is invalid. Check GEMINI_API_KEY in server/.env");
      } else if (code === "RATE_LIMIT") {
        setError("Gemini rate limit reached. Please wait a moment and try again.");
      } else if (code === "MODEL_UNAVAILABLE") {
        setError("The configured Gemini AI model is unavailable. Please contact the administrator to update the server AI configuration.");
      } else {
        setError(err?.response?.data?.message || "Failed to start interview. Check server logs.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  /* SEND */
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || aiLoading || !currentQuestion) return;
    setInputText(""); setError("");
    pushMsg({ type: "user", content: text });
    try {
      setAiLoading(true); setTyping(true);
      const questionId = currentQuestion.dbId ?? currentQuestion.id;
      const res = await submitInterviewAnswer(session.id, questionId, text);
      const { feedback, nextQuestion, sessionProgress } = res.data;
      setTyping(false); setAnsweredCount(sessionProgress.answered);
      if (feedback) {
        setPendingFeedback({ ...feedback, isLast: sessionProgress.isLast });
        pushMsg({ type: "feedback", feedback, isLast: sessionProgress.isLast });
      }
      if (nextQuestion) setCurrentQuestion({ ...nextQuestion, dbId: nextQuestion.id });
      else setCurrentQuestion(null);
    } catch (err) {
      setTyping(false); setError(err?.response?.data?.message || "Failed to submit answer.");
    } finally { setAiLoading(false); }
  };

  /* NEXT */
  const handleNextQuestion = () => {
    if (!currentQuestion) { handleEndInterview(); return; }
    pushMsg({ type: "question", content: currentQuestion.text,
      category: currentQuestion.category,
      number: currentQuestion.questionNumber ?? currentQuestion.number });
    setPendingFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  /* SKIP */
  const handleSkip = async () => {
    if (!currentQuestion || aiLoading) return;
    try {
      setAiLoading(true); setTyping(true);
      const questionId = currentQuestion.dbId ?? currentQuestion.id;
      const res = await skipInterviewQuestion(session.id, questionId);
      setTyping(false);
      if (res.data.isLast || !res.data.nextQuestion) {
        setCurrentQuestion(null);
        pushMsg({ type: "system", content: "All questions complete. Click 'End Interview' for your report." });
      } else {
        const nq = res.data.nextQuestion;
        setCurrentQuestion({ ...nq, dbId: nq.id });
        pushMsg({ type: "question", content: nq.text, category: nq.category, number: nq.number });
      }
    } catch { setTyping(false); setError("Failed to skip question."); }
    finally   { setAiLoading(false); }
  };

  /* END */
  const handleEndInterview = async () => {
    try {
      setEndLoading(true); setError("");
      const res = await endInterviewSession(session.id);
      setReport(res.data.report); setView("report");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to generate report.");
    } finally { setEndLoading(false); }
  };

  /* RESTART */
  const handleRestart = () => {
    setView("setup"); setSession(null); setCurrentQuestion(null);
    setMessages([]); setReport(null); setError("");
    setAnsweredCount(0); setPendingFeedback(null);
  };

  /* HISTORY */
  const handleOpenHistory = async () => {
    try {
      setHistLoading(true);
      const res = await getInterviewHistory();
      setHistory(res.data); setView("history");
    } catch { setError("Failed to load history."); }
    finally   { setHistLoading(false); }
  };

  const handleSelectSession = async id => {
    try {
      const res = await getInterviewSession(id);
      setSelectedSession(res.data); setView("sessionDetail");
    } catch { setError("Failed to load session."); }
  };

  /* ── RENDER ── */
  return (
    <div className="mx-auto max-w-[1180px] space-y-4 px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-[clamp(1.7rem,2vw,2.4rem)] font-bold leading-none text-[var(--cl-text)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] shadow-[var(--cl-shadow)]">
              <FaRobot className="text-sm text-[var(--cl-primary)]" />
            </span>
            AI Mock Interview
          </h1>
          <p className="mt-1 text-sm text-[var(--cl-text-muted)]">Practice. Improve. Get hired.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenHistory}
          disabled={histLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] px-3.5 py-2 text-sm font-semibold text-[var(--cl-text)] transition hover:border-[var(--cl-primary)] hover:bg-[var(--cl-surface-soft)]"
        >
          {histLoading ? <FaSpinner className="animate-spin text-xs" /> : <FaHistory className="text-xs" />}
          Interview History
        </button>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity:0,y:-8,height:0 }} animate={{ opacity:1,y:0,height:"auto" }}
            exit={{ opacity:0,y:-8,height:0 }} transition={{ duration:0.22 }}
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl
              bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20" role="alert">
            <FaExclamationCircle className="text-red-500 mt-0.5 shrink-0 text-sm" />
            <div className="text-sm text-red-600 dark:text-red-400 flex-1">
              <p>{error}</p>
              {(error.includes("Gemini") || error.includes("API key") || error.includes("aistudio")) && (
                <a href="https://aistudio.google.com/app/apikey"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold
                    text-red-700 dark:text-red-300 underline hover:no-underline">
                  Get free Gemini API key →
                </a>
              )}
            </div>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 transition-colors">
              <FaTimes className="text-xs" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ══ SETUP ══ */}
        {view === "setup" && (
          <motion.div key="setup" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}
            exit={{ opacity:0,y:-12 }} transition={{ duration:0.3 }}>
            <div className="grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
              <div className="rounded-[22px] border border-[var(--cl-border)] bg-[var(--cl-surface)] p-3.5 shadow-[var(--cl-shadow)] sm:p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--cl-primary-soft)] ring-1 ring-[var(--cl-primary)]/20">
                      <FaPlay className="text-xs text-[var(--cl-primary)]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--cl-primary)]">CareerLaunch AI</p>
                      <h2 className="text-[clamp(1.3rem,1.8vw,1.9rem)] font-bold leading-tight text-[var(--cl-text)]">Interview Launcher</h2>
                    </div>
                  </div>
                  <span className="rounded-full border border-[var(--cl-success-soft)] bg-[var(--cl-success-soft)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--cl-success)]">
                    Ready
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--cl-text-muted)]">Role</label>
                    <div className="relative">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="cl-control w-full appearance-none px-3.5 py-2.5 pr-10 text-base font-medium outline-none"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--cl-text-muted)]">
                        <FaChevronDown className="text-xs" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--cl-text-muted)]">Difficulty</label>
                    <div className="grid gap-2.5 md:grid-cols-3">
                      {DIFFICULTIES.map((d) => {
                        const selected = difficulty === d;
                        const labels = {
                          Beginner: "Fundamentals",
                          Intermediate: "Scenario-based",
                          Advanced: "Deep-dive",
                        };

                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDifficulty(d)}
                            className={`rounded-xl border p-2.5 text-left transition-all duration-200 ${
                              selected
                                ? "border-[var(--cl-primary)] bg-[var(--cl-primary-soft)] shadow-sm"
                                : "border-[var(--cl-border)] bg-[var(--cl-surface-soft)] hover:border-[var(--cl-primary)] hover:bg-[var(--cl-surface)]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-[var(--cl-text)]">{d}</span>
                              <span className={`flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-bold ${
                                selected
                                  ? "border-[var(--cl-primary)] bg-[var(--cl-primary)] text-[var(--cl-button-text)]"
                                  : "border-[var(--cl-border-strong)] bg-transparent text-transparent"
                              }`}>{selected ? "✓" : ""}</span>
                            </div>
                            <span className="mt-1.5 block text-[11px] text-[var(--cl-text-muted)]">{labels[d]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--cl-text)]">Session Setup</p>
                        <p className="text-[11px] text-[var(--cl-text-muted)]">AI interview flow</p>
                      </div>
                      <span className="rounded-full bg-[var(--cl-primary-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--cl-primary)]">
                        12 questions
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                      {[
                        { label: "Duration", value: "~15 min" },
                        { label: "Format", value: "Live Q&A" },
                        { label: "Focus", value: "Real-world" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg border border-[var(--cl-border)] bg-[var(--cl-surface)] p-2.5">
                          <p className="text-[9px] uppercase tracking-[0.16em] text-[var(--cl-text-muted)]">{item.label}</p>
                          <p className="mt-1.5 text-xs font-semibold text-[var(--cl-text)]">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="rounded-[22px] border border-[var(--cl-border)] bg-[var(--cl-surface)] p-3.5 shadow-[var(--cl-shadow)] sm:p-4">
                <div className="mb-4 flex justify-center">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[var(--cl-border)] bg-[var(--cl-primary-soft)]">
                    <div className="absolute inset-3 rounded-full border border-[var(--cl-border)]" />
                    <FaRobot className="text-3xl text-[var(--cl-primary)]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--cl-primary)]">AI session preview</p>
                    <h3 className="mt-1.5 text-[clamp(1.7rem,2vw,2.5rem)] font-black leading-tight tracking-tight text-[var(--cl-text)]">Ready to Practice?</h3>
                  </div>

                  <div className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] p-3.5">
                    <div className="flex items-center justify-between gap-3 text-sm text-[var(--cl-text-muted)]">
                      <span>Role</span>
                      <span className="font-semibold text-[var(--cl-text)]">{role}</span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-3 text-sm text-[var(--cl-text-muted)]">
                      <span>Level</span>
                      <span className="font-semibold text-[var(--cl-text)]">{difficulty}</span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-3 text-sm text-[var(--cl-text-muted)]">
                      <span>Questions</span>
                      <span className="font-semibold text-[var(--cl-text)]">12 total</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-sm text-[var(--cl-text-muted)]">
                    {[
                      "AI-generated interview flow",
                      "Actionable scoring and feedback",
                      "Personalized improvement tips",
                      "Final performance summary",
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-[9px] text-emerald-300 ring-1 ring-emerald-400/20">
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    onClick={handleStart}
                    disabled={aiLoading}
                    whileHover={!aiLoading ? { y: -1, boxShadow: "0 18px 32px -18px rgba(96,165,250,0.9)" } : {}}
                    whileTap={!aiLoading ? { scale: 0.98 } : {}}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_18px_32px_-20px_rgba(96,165,250,0.9)] transition disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {aiLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" />
                        Preparing Interview...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FaPlay className="text-xs" />
                        Start Mock Interview
                      </span>
                    )}
                  </motion.button>
                </div>
              </aside>
            </div>
          </motion.div>
        )}

        {/* ══ INTERVIEW ══ */}
        {view === "interview" && session && (
          <motion.div key="interview" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}
            exit={{ opacity:0,y:-12 }} transition={{ duration:0.3 }} className="space-y-3 sm:space-y-4">

            {/* Info bar — wraps on mobile */}
            <Card className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                  <div className="shrink-0">
                    <p className="text-xs text-neutral-400">Role</p>
                    <p className="text-sm font-bold text-neutral-800 dark:text-white">{session.role}</p>
                  </div>
                  <div className="shrink-0">
                    <p className="text-xs text-neutral-400">Level</p>
                    <p className="text-sm font-bold text-neutral-800 dark:text-white">{session.difficulty}</p>
                  </div>
                </div>
                <div className="w-full sm:w-52 sm:ml-auto">
                  <ProgressBar answered={answeredCount} total={session.totalQuestions ?? TOTAL_Q} />
                </div>
              </div>
            </Card>

            {/* Chat window — responsive height */}
            <Card className="p-0 overflow-hidden">
              <div className="h-72 sm:h-96 md:h-120 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth">
                {messages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
                    transition={{ duration:0.3 }}>

                    {msg.type === "system" && (
                      <div className="text-center">
                        <span className="inline-block text-xs text-neutral-400 dark:text-neutral-600
                          bg-neutral-100 dark:bg-white/5 px-3 py-1 rounded-full">
                          {msg.content}
                        </span>
                      </div>
                    )}

                    {msg.type === "question" && (
                      <div className="flex items-start gap-2 sm:gap-3 justify-start">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background:"linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
                          <FaRobot className="text-white text-[10px] sm:text-xs" />
                        </div>
                        <div className="max-w-[85%] sm:max-w-[80%] space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {categoryIcon(msg.category)}
                            <span className="text-[10px] font-semibold text-neutral-400 capitalize">
                              {msg.category} · Q{msg.number}
                            </span>
                          </div>
                          <div className="p-3 sm:p-4 rounded-2xl rounded-tl-sm
                            bg-neutral-100 dark:bg-white/8 text-sm text-neutral-800 dark:text-white leading-relaxed">
                            {msg.content}
                          </div>
                          <p className="text-[10px] text-neutral-400">{msg.time}</p>
                        </div>
                      </div>
                    )}

                    {msg.type === "user" && (
                      <div className="flex items-start gap-2 sm:gap-3 justify-end">
                        <div className="max-w-[85%] sm:max-w-[80%] space-y-1 items-end flex flex-col">
                          <div className="p-3 sm:p-4 rounded-2xl rounded-tr-sm text-white text-sm leading-relaxed"
                            style={{ background:"linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
                            {msg.content}
                          </div>
                          <p className="text-[10px] text-neutral-400">{msg.time}</p>
                        </div>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-neutral-200 dark:bg-white/10
                          flex items-center justify-center shrink-0">
                          <FaUser className="text-neutral-500 dark:text-neutral-400 text-[10px] sm:text-xs" />
                        </div>
                      </div>
                    )}

                    {msg.type === "feedback" && (
                      <div className="pl-9 sm:pl-11">
                        <FeedbackCard feedback={msg.feedback} isLast={msg.isLast}
                          onNext={msg.isLast ? handleEndInterview : handleNextQuestion} />
                      </div>
                    )}
                  </motion.div>
                ))}

                {typing && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background:"linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
                      <FaRobot className="text-white text-[10px] sm:text-xs" />
                    </div>
                    <div className="bg-neutral-100 dark:bg-white/8 rounded-2xl rounded-tl-sm">
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </Card>

            {/* Input bar */}
            <Card className="p-3 sm:p-4">
              <div className="flex gap-2 sm:gap-3">
                <textarea ref={inputRef} rows={2}
                  value={inputText} onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={pendingFeedback
                    ? "Review feedback above, then click Next Question…"
                    : "Type your answer… (Enter to send)"}
                  disabled={aiLoading || !!pendingFeedback || !currentQuestion}
                  className="flex-1 min-w-0 resize-none px-3 sm:px-4 py-2.5 rounded-xl
                    border border-neutral-200 dark:border-white/10
                    bg-white/60 dark:bg-white/5 text-sm text-neutral-800 dark:text-white
                    placeholder-neutral-400 dark:placeholder-neutral-600 outline-none
                    focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed" />
                {/* buttons column */}
                <div className="flex flex-col gap-2 shrink-0">
                  <motion.button onClick={handleSend}
                    disabled={!inputText.trim() || aiLoading || !!pendingFeedback || !currentQuestion}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white
                      bg-linear-to-r from-blue-500 to-violet-500
                      disabled:opacity-40 disabled:cursor-not-allowed">
                    {aiLoading
                      ? <FaSpinner className="animate-spin text-xs sm:text-sm" />
                      : <FaPaperPlane className="text-xs sm:text-sm" />}
                  </motion.button>
                  <motion.button onClick={handleSkip}
                    disabled={aiLoading || !!pendingFeedback || !currentQuestion}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    title="Skip question"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center
                      bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10
                      text-neutral-400 hover:text-neutral-600
                      disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <FaForward className="text-xs sm:text-sm" />
                  </motion.button>
                </div>
              </div>
            </Card>

            {/* End interview — full-width on mobile */}
            <div className="flex justify-end">
              <motion.button onClick={handleEndInterview} disabled={endLoading}
                whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2
                  px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                  bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors shadow">
                {endLoading
                  ? <><FaSpinner className="animate-spin text-xs" /> Generating Report…</>
                  : <><FaStop className="text-xs" /> End Interview &amp; Get Report</>}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ══ REPORT ══ */}
        {view === "report" && (
          <motion.div key="report" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}
            exit={{ opacity:0,y:-12 }} transition={{ duration:0.3 }}>
            <InterviewReport report={report} session={session}
              onRestart={handleRestart} onHistory={handleOpenHistory} />
          </motion.div>
        )}

        {/* ══ HISTORY ══ */}
        {view === "history" && (
          <motion.div key="history" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}
            exit={{ opacity:0,y:-12 }} transition={{ duration:0.3 }}>
            <Card className="p-4 sm:p-6">
              <HistoryPanel history={history} onSelect={handleSelectSession}
                onClose={() => setView("setup")} />
            </Card>
          </motion.div>
        )}

        {/* ══ SESSION DETAIL ══ */}
        {view === "sessionDetail" && selectedSession && (
          <motion.div key="detail" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}
            exit={{ opacity:0,y:-12 }} transition={{ duration:0.3 }} className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => setView("history")}
                className="text-neutral-400 hover:text-neutral-600 transition-colors text-sm flex items-center gap-1">
                <FaTimes className="text-xs" /> Close
              </button>
              <h2 className="text-sm sm:text-base font-bold text-neutral-800 dark:text-white">
                {selectedSession.session.role} · {selectedSession.session.difficulty}
              </h2>
              {selectedSession.session.overallScore > 0 && (
                <ScoreBadge score={selectedSession.session.overallScore} />
              )}
            </div>
            {selectedSession.session.report
              ? <InterviewReport report={selectedSession.session.report} session={selectedSession.session}
                  onRestart={handleRestart} onHistory={handleOpenHistory} />
              : (
                <Card className="p-4 sm:p-6 space-y-4">
                  {selectedSession.questions.map(q => (
                    <div key={q.id} className="border-b border-neutral-100 dark:border-white/8 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {categoryIcon(q.category)}
                        <span className="text-xs font-semibold text-neutral-500">Q{q.questionNumber} · {q.category}</span>
                        {q.score && <ScoreBadge score={q.score} />}
                        {q.skipped && <span className="text-[10px] text-orange-400 font-medium">Skipped</span>}
                      </div>
                      <p className="text-sm font-medium text-neutral-800 dark:text-white mb-1.5">{q.question}</p>
                      {q.userAnswer && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">"{q.userAnswer}"</p>
                      )}
                    </div>
                  ))}
                </Card>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MockInterview;
