import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBookOpen,
  FaChevronDown,
  FaClock,
  FaCode,
  FaDatabase,
  FaFilter,
  FaGraduationCap,
  FaLayerGroup,
  FaMapSigns,
  FaSearch,
  FaShieldAlt,
  FaSpinner,
  FaTimes,
  FaTools,
} from "react-icons/fa";
import { getRoadmaps } from "../../services/roadmapService";

const CATEGORY_OPTIONS = [
  "All",
  "Web Development",
  "Backend",
  "Data Science",
  "DevOps",
  "Mobile",
  "AI / ML",
  "Cyber Security",
];

const LEVEL_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced"];

const categoryStyles = {
  "Web Development": { icon: <FaCode className="text-base" />, accent: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/25" },
  Backend: { icon: <FaDatabase className="text-base" />, accent: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/25" },
  "Data Science": { icon: <FaGraduationCap className="text-base" />, accent: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/25" },
  DevOps: { icon: <FaTools className="text-base" />, accent: "from-amber-500/20 to-yellow-500/10", border: "border-amber-500/25" },
  Mobile: { icon: <FaLayerGroup className="text-base" />, accent: "from-pink-500/20 to-rose-500/10", border: "border-pink-500/25" },
  "AI / ML": { icon: <FaBookOpen className="text-base" />, accent: "from-cyan-500/20 to-sky-500/10", border: "border-cyan-500/25" },
  "Cyber Security": { icon: <FaShieldAlt className="text-base" />, accent: "from-red-500/20 to-orange-500/10", border: "border-red-500/25" },
};

const parseNumber = (value) => {
  const match = String(value || "").match(/(\d+)/);
  return match ? Number(match[1]) : null;
};

const inferCategory = (roadmap) => {
  const haystack = `${roadmap.title || ""} ${roadmap.targetRole || ""} ${roadmap.roadmapContent || ""}`.toLowerCase();
  if (/web|frontend|react|javascript|css|html|next|ui|ux/.test(haystack)) return "Web Development";
  if (/backend|node|api|database|server|java|python|spring|django|express/.test(haystack)) return "Backend";
  if (/data science|ml|machine learning|ai|analytics|python|model|nlp/.test(haystack)) return "AI / ML";
  if (/(devops|docker|kubernetes|cloud|aws|azure|ci\/cd|terraform)/.test(haystack)) return "DevOps";
  if (/mobile|android|ios|flutter|react native|swift|kotlin/.test(haystack)) return "Mobile";
  if (/cyber|security|penetration|cloud security|red team|network/.test(haystack)) return "Cyber Security";
  if (/data|science|sql|statistics|pandas|numpy/.test(haystack)) return "Data Science";
  return "Web Development";
};

const inferLevel = (roadmap) => {
  const haystack = `${roadmap.title || ""} ${roadmap.targetRole || ""} ${roadmap.roadmapContent || ""}`.toLowerCase();
  if (/advanced|senior|expert/.test(haystack)) return "Advanced";
  if (/intermediate|mid|professional/.test(haystack)) return "Intermediate";
  return "Beginner";
};

const extractStages = (roadmap) => {
  const raw = roadmap.roadmapContent || "";
  const lines = raw
    .split(/\n|\r/)
    .map((line) => line.trim())
    .filter(Boolean);

  const stageLines = lines.filter((line) => /^\d{1,2}[\s\-.):]*(.+)$/.test(line) || /^(Fundamentals|JavaScript|React|State Management|Projects|Interview|Backend|APIs|Testing)/i.test(line));

  if (stageLines.length > 0) {
    return stageLines.slice(0, 7).map((line, index) => {
      const clean = line.replace(/^\d{1,2}[\s\-.):]+/i, "").trim();
      const maybeTitle = clean || `Stage ${index + 1}`;
      const isDone = index < 2;
      return {
        id: `${roadmap.id}-${index + 1}`,
        title: maybeTitle,
        status: isDone ? "Complete" : index === 2 ? "In Progress" : "Up Next",
      };
    });
  }

  return [
    { id: `${roadmap.id}-1`, title: "Fundamentals", status: "Complete" },
    { id: `${roadmap.id}-2`, title: "Core Topics", status: "In Progress" },
    { id: `${roadmap.id}-3`, title: "Practice Projects", status: "Up Next" },
  ];
};

const buildRoadmapMeta = (roadmap) => {
  const content = roadmap.roadmapContent || "";
  const moduleCount = parseNumber(content.match(/(\d+)\s*(modules|topics|lessons)/i)?.[0]) ?? 12;
  const hours = parseNumber(content.match(/(\d+)\s*(hours?|hrs?)/i)?.[0]) ?? 120;
  const progress = Number(roadmap.progress ?? 0);

  return {
    category: inferCategory(roadmap),
    level: inferLevel(roadmap),
    modules: Math.max(moduleCount, 8),
    hours: Math.max(hours, 30),
    progress: Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 100) : 0,
    stages: extractStages(roadmap),
  };
};

function RoadmapSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-700/80" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-slate-700/80" />
              <div className="h-3 w-1/2 rounded bg-slate-700/70" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-slate-700/70" />
            <div className="h-3 w-5/6 rounded bg-slate-700/70" />
            <div className="h-3 w-2/3 rounded bg-slate-700/70" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="h-8 rounded-lg bg-slate-700/80" />
            <div className="h-8 rounded-lg bg-slate-700/80" />
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-700/80" />
        </div>
      ))}
    </div>
  );
}

function RoadmapGenerator() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);

  const loadRoadmaps = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getRoadmaps();
      const items = response?.data || response || [];
      setRoadmaps(items);
      if (items[0] && !selectedRoadmapId) setSelectedRoadmapId(items[0].id);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load roadmaps.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const roles = useMemo(
    () => ["All", ...new Set((roadmaps || []).map((roadmap) => roadmap.targetRole).filter(Boolean))],
    [roadmaps]
  );

  const enrichedRoadmaps = useMemo(
    () =>
      (roadmaps || []).map((roadmap) => ({
        ...roadmap,
        ...buildRoadmapMeta(roadmap),
      })),
    [roadmaps]
  );

  const filteredRoadmaps = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return [...enrichedRoadmaps]
      .filter((roadmap) => {
        const searchable = [
          roadmap.title,
          roadmap.targetRole,
          roadmap.roadmapContent,
          roadmap.category,
          roadmap.level,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesQuery = !query || searchable.includes(query);
        const matchesCategory = selectedCategory === "All" || roadmap.category === selectedCategory;
        const matchesRole = selectedRole === "All" || roadmap.targetRole === selectedRole;
        const matchesLevel = selectedLevel === "All" || roadmap.level === selectedLevel;

        return matchesQuery && matchesCategory && matchesRole && matchesLevel;
      })
      .sort((a, b) => {
        if (sortBy === "Most Popular") return (b.progress || 0) - (a.progress || 0);
        if (sortBy === "Newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sortBy === "Title A-Z") return (a.title || "").localeCompare(b.title || "");
        return (b.modules || 0) - (a.modules || 0);
      });
  }, [enrichedRoadmaps, searchTerm, selectedCategory, selectedRole, selectedLevel, sortBy]);

  const selectedRoadmap = filteredRoadmaps.find((item) => item.id === selectedRoadmapId) || filteredRoadmaps[0] || null;

  useEffect(() => {
    if (filteredRoadmaps.length && !filteredRoadmaps.some((roadmap) => roadmap.id === selectedRoadmapId)) {
      setSelectedRoadmapId(filteredRoadmaps[0].id);
    }
  }, [filteredRoadmaps, selectedRoadmapId]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedRole("All");
    setSelectedLevel("All");
    setSortBy("Most Popular");
  };

  const renderDropdown = ({ label, value, options, onChange }) => (
    <div className="relative min-w-[140px] flex-1 md:flex-none">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2.5 pr-9 text-sm font-medium text-slate-100 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
        <FaChevronDown className="text-[10px]" />
      </span>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1280px] space-y-4 px-2 py-3 sm:px-4 lg:px-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[clamp(1.8rem,2.4vw,2.7rem)] font-black leading-none tracking-tight text-white">
            Roadmap Library
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Choose a structured learning path and start building your skills.
          </p>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-3 shadow-[0_18px_50px_-40px_rgba(96,165,250,0.8)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search roadmaps..."
              className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {renderDropdown({
              value: selectedRole,
              options: roles,
              onChange: setSelectedRole,
            })}
            {renderDropdown({
              value: selectedLevel,
              options: LEVEL_OPTIONS,
              onChange: setSelectedLevel,
            })}
            {renderDropdown({
              value: sortBy,
              options: ["Most Popular", "Newest", "Title A-Z", "Highest Modules"],
              onChange: setSortBy,
            })}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-blue-400/40 bg-blue-500/15 text-blue-200 shadow-[0_0_0_1px_rgba(59,130,246,0.2)]"
                    : "border-white/10 bg-slate-800/60 text-slate-300 hover:border-blue-400/30 hover:text-white"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          <div className="flex items-center justify-between gap-3">
            <p>Unable to load roadmaps.</p>
            <button
              type="button"
              onClick={loadRoadmaps}
              className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-1.5 font-medium text-red-100 transition hover:bg-red-500/20"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!error && loading && <RoadmapSkeleton />}

      {!error && !loading && filteredRoadmaps.length === 0 && (
        <div className="rounded-[24px] border border-white/10 bg-slate-900/60 p-8 text-center shadow-[0_18px_48px_-42px_rgba(96,165,250,0.8)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-3xl text-blue-200">
            <FaMapSigns />
          </div>
          <h3 className="mt-4 text-2xl font-bold text-white">No Roadmaps Found</h3>
          <p className="mt-2 text-sm text-slate-400">
            {roadmaps.length > 0
              ? "We couldn’t find a roadmap matching your search."
              : "No roadmaps are available yet. Check back soon."}
          </p>
          {(searchTerm || selectedCategory !== "All" || selectedRole !== "All" || selectedLevel !== "All") && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_-20px_rgba(96,165,250,0.9)] transition hover:brightness-110"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {!error && !loading && filteredRoadmaps.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {filteredRoadmaps.map((roadmap) => {
              const style = categoryStyles[roadmap.category] || categoryStyles["Web Development"];
              const progressValue = Math.max(0, Math.min(100, roadmap.progress || 0));
              const ctaLabel = progressValue > 0 ? "Continue Roadmap" : "Start Roadmap";

              return (
                <div
                  key={roadmap.id}
                  className={`group rounded-2xl border bg-slate-900/60 p-3.5 transition-all duration-200 ${
                    selectedRoadmap?.id === roadmap.id
                      ? "border-blue-400/50 shadow-[0_0_0_1px_rgba(96,165,250,0.28),0_16px_40px_-28px_rgba(96,165,250,0.8)]"
                      : "border-white/10 hover:border-blue-400/30 hover:shadow-[0_18px_38px_-28px_rgba(96,165,250,0.7)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${style.accent} ${style.border} border`}>
                      {style.icon}
                    </div>
                    <button
                      type="button"
                      aria-label="Open roadmap"
                      onClick={() => setSelectedRoadmapId(roadmap.id)}
                      className="rounded-full border border-white/10 bg-slate-800/70 p-1.5 text-slate-300 transition hover:border-blue-400/30 hover:text-white"
                    >
                      <FaArrowRight className="text-[10px]" />
                    </button>
                  </div>

                  <div className="mt-3">
                    <h2 className="text-lg font-bold text-white">{roadmap.title}</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-300 line-clamp-3">
                      {roadmap.roadmapContent?.replace(/\s+/g, " ").slice(0, 120) || "Structured learning path designed to build practical career-ready skills."}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-slate-300">
                    <span className="rounded-full border border-white/10 bg-slate-800/80 px-2 py-1">{roadmap.level}</span>
                    <span className="rounded-full border border-white/10 bg-slate-800/80 px-2 py-1">{roadmap.category}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="rounded-lg border border-white/10 bg-slate-950/60 p-2">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <FaLayerGroup className="text-[10px]" />
                        <span>Modules</span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">{roadmap.modules}</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-slate-950/60 p-2">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <FaClock className="text-[10px]" />
                        <span>Hours</span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-white">~{roadmap.hours}</div>
                    </div>
                  </div>

                  {progressValue > 0 && (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-slate-300">
                        <span>Progress</span>
                        <span>{progressValue}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedRoadmapId(roadmap.id)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(96,165,250,0.9)] transition hover:brightness-110"
                  >
                    {ctaLabel}
                    <FaArrowRight className="text-[10px]" />
                  </button>
                </div>
              );
            })}
          </div>

          {selectedRoadmap && (
            <div className="rounded-[24px] border border-white/10 bg-slate-900/60 p-4 shadow-[0_18px_48px_-42px_rgba(96,165,250,0.8)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300/90">Roadmap Details</p>
                  <h3 className="mt-1 text-2xl font-bold text-white">{selectedRoadmap.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 bg-slate-800/80 px-2.5 py-1">{selectedRoadmap.category}</span>
                  <span className="rounded-full border border-white/10 bg-slate-800/80 px-2.5 py-1">{selectedRoadmap.level}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-3">
                  {selectedRoadmap.stages.map((stage, index) => (
                    <div key={stage.id} className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-[10px] font-bold text-blue-200">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">{stage.title}</p>
                            <p className="text-[11px] text-slate-400">{stage.status}</p>
                          </div>
                        </div>
                        {stage.status === "Complete" ? (
                          <span className="text-green-400">✓</span>
                        ) : stage.status === "In Progress" ? (
                          <span className="text-yellow-400">●</span>
                        ) : (
                          <span className="text-slate-500">○</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <FaFilter className="text-xs text-blue-300" />
                    Roadmap snapshot
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between gap-3">
                      <span>Modules</span>
                      <span className="font-semibold text-white">{selectedRoadmap.modules}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Estimated hours</span>
                      <span className="font-semibold text-white">~{selectedRoadmap.hours}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Target role</span>
                      <span className="font-semibold text-white">{selectedRoadmap.targetRole || selectedRoadmap.category}</span>
                    </div>
                  </div>

                  {selectedRoadmap.progress > 0 && (
                    <div className="mt-5">
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                        <span>Your Progress</span>
                        <span>{selectedRoadmap.progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                          style={{ width: `${selectedRoadmap.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    {selectedRoadmap.progress > 0 ? "Continue Learning" : "Start Roadmap"}
                    <FaArrowRight className="text-[10px]" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RoadmapGenerator;
