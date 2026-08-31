import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaBook,
  FaBookOpen,
  FaBookmark,
  FaCheckCircle,
  FaChevronDown,
  FaClock,
  FaExternalLinkAlt,
  FaFilter,
  FaSearch,
  FaStar,
  FaTimes,
} from "react-icons/fa";

import { getResources } from "../../services/resourceService";

const DEFAULT_CATEGORY_CARDS = [
  { name: "Web Development", icon: "💻" },
  { name: "React", icon: "⚛️" },
  { name: "Node.js", icon: "🟢" },
  { name: "Database", icon: "🗄️" },
  { name: "Interview Preparation", icon: "🧠" },
  { name: "DSA", icon: "📚" },
  { name: "AI & Tools", icon: "🤖" },
  { name: "Career Guides", icon: "🎯" },
];

const TYPE_OPTIONS = ["All", "Video", "Article", "Course", "Documentation", "PDF"];
const DIFFICULTY_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced"];

const normalizeText = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ");

const normalizeCategory = (category) => {
  const raw = String(category || "General");
  const normalized = normalizeText(raw);

  if (!normalized) return "General";

  if (normalized.includes("react")) return "React";
  if (normalized.includes("node")) return "Node.js";
  if (normalized.includes("database") || normalized.includes("sql") || normalized.includes("postgres")) return "Database";
  if (normalized.includes("interview") || normalized.includes("prep")) return "Interview Preparation";
  if (normalized.includes("dsa") || normalized.includes("algorithm")) return "DSA";
  if (normalized.includes("ai") || normalized.includes("tool")) return "AI & Tools";
  if (normalized.includes("career") || normalized.includes("guide")) return "Career Guides";
  if (normalized.includes("web") || normalized.includes("frontend") || normalized.includes("javascript") || normalized.includes("html") || normalized.includes("css")) return "Web Development";

  return raw;
};

const getCategoryMeta = (category) => {
  const displayName = normalizeCategory(category);

  const card = DEFAULT_CATEGORY_CARDS.find((item) => normalizeCategory(item.name) === normalizeCategory(displayName));
  return card || { name: displayName, icon: "📘" };
};

const getResourceType = (resource = {}) => {
  if (resource.type) return resource.type;
  if (resource.resourceType) return resource.resourceType;
  if (resource.link?.toLowerCase().includes(".pdf")) return "PDF";
  if (resource.link?.toLowerCase().includes("youtube") || resource.link?.toLowerCase().includes("vimeo")) return "Video";
  if (resource.link?.toLowerCase().includes("course")) return "Course";
  if (resource.link?.toLowerCase().includes("docs") || resource.link?.toLowerCase().includes("documentation")) return "Documentation";
  return "Article";
};

const getDifficulty = (resource = {}) => {
  if (resource.difficulty) return resource.difficulty;
  if (resource.level) return resource.level;
  return "Beginner";
};

function ResourceHeader({ totalResources, totalCategories }) {
  return (
    <header className="relative overflow-hidden rounded-[28px] border border-blue-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-5 shadow-[0_20px_55px_-35px_rgba(59,130,246,0.75)] sm:p-6 lg:p-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

      <div className="relative">
        <div className="flex justify-center md:justify-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200">
            <FaBookOpen className="text-blue-300" size={10} />
            Learning Center
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base lg:text-lg">
              Everything you need to learn, prepare, and grow your career with practical, job-ready guidance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-200 lg:justify-end">
            <div className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-2">
              {totalResources}+ Resources
            </div>
            <div className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-2">
              {totalCategories} Categories
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function CategoryCard({ category, count, isActive, onClick }) {
  const meta = getCategoryMeta(category);

  return (
    <button
      type="button"
      onClick={() => onClick(category)}
      className={`group flex min-h-[82px] flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all duration-200 ease-out ${
        isActive
          ? "border-blue-400/50 bg-blue-500/12 shadow-[0_18px_32px_-24px_rgba(96,165,250,0.9)]"
          : "border-white/10 bg-slate-950/60 hover:-translate-y-0.5 hover:border-blue-400/30 hover:bg-slate-900/80"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/80 text-lg shadow-inner shadow-blue-500/10">
          {meta.icon}
        </span>
        <span className="text-sm font-semibold text-white sm:text-[15px]">{meta.name}</span>
      </div>
      <span className="mt-3 text-xs text-slate-400">{count} resources</span>
    </button>
  );
}

function ResourceFilters({
  searchTerm,
  category,
  type,
  difficulty,
  activeFilterCount,
  categories,
  onSearchChange,
  onCategoryChange,
  onTypeChange,
  onDifficultyChange,
  onClearFilters,
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-4 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.9)] sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
        <label className="relative block">
          <span className="sr-only">Search resources</span>
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            type="text"
            placeholder="Search tutorials, interview guides, courses..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition duration-200 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/15"
          />
        </label>

        <label className="relative block">
          <span className="sr-only">Select category</span>
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 pr-10 text-sm text-slate-100 outline-none transition duration-200 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/15"
          >
            <option value="All">All Categories</option>
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
        </label>

        <label className="relative block">
          <span className="sr-only">Select resource type</span>
          <select
            value={type}
            onChange={(event) => onTypeChange(event.target.value)}
            className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 pr-10 text-sm text-slate-100 outline-none transition duration-200 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/15"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All Types" : option}
              </option>
            ))}
          </select>
          <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
        </label>

        <label className="relative block">
          <span className="sr-only">Select difficulty</span>
          <select
            value={difficulty}
            onChange={(event) => onDifficultyChange(event.target.value)}
            className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 pr-10 text-sm text-slate-100 outline-none transition duration-200 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/15"
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All Levels" : option}
              </option>
            ))}
          </select>
          <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
        </label>
      </div>

      {activeFilterCount > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-blue-400/40 hover:text-white"
          >
            <FaTimes size={10} />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource, isBookmarked, onToggleBookmark }) {
  const resourceType = getResourceType(resource);
  const difficulty = getDifficulty(resource);
  const resourceTags = Array.isArray(resource.tags) ? resource.tags.slice(0, 3) : [resource.category, "Career"].filter(Boolean);

  return (
    <article className="group relative flex h-full flex-col rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.88))] p-5 shadow-[0_20px_45px_-30px_rgba(59,130,246,0.75)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-[0_28px_55px_-30px_rgba(59,130,246,0.8)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-200">
          {resourceType}
        </span>

        <button
          type="button"
          aria-label={`Bookmark ${resource.title}`}
          onClick={() => onToggleBookmark(resource.id)}
          className={`rounded-full border p-2 transition ${
            isBookmarked
              ? "border-blue-400/50 bg-blue-500/10 text-blue-200"
              : "border-white/10 bg-slate-950/70 text-slate-300 hover:border-blue-400/30 hover:text-blue-200"
          }`}
        >
          <FaBookmark size={13} />
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/90 text-blue-300 ring-1 ring-blue-400/20">
          <FaBook size={16} />
        </div>
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white">{resource.title}</h3>
      </div>

      <p className="line-clamp-3 flex-1 text-sm leading-6 text-slate-300">{resource.description || "Explore this learning resource to strengthen your skills and career readiness."}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-300">
          {normalizeCategory(resource.category || "General")}
        </span>
        <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-200">
          {difficulty}
        </span>
      </div>

      {(resource.estimatedTime || resource.duration || resource.time) && (
        <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-400">
          <FaClock size={10} />
          <span>{resource.estimatedTime || resource.duration || resource.time}</span>
        </div>
      )}

      {resourceTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {resourceTags.map((tag) => (
            <span key={`${resource.id}-${tag}`} className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-medium text-slate-300 ring-1 ring-white/5">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <a
          href={resource.link || "#"}
          target={resource.link ? "_blank" : undefined}
          rel={resource.link ? "noreferrer" : undefined}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Start Learning
          <FaArrowRight size={12} />
        </a>

        <span className="text-xs text-slate-400">{resource.link ? "Open" : "Unavailable"}</span>
      </div>
    </article>
  );
}

function ResourceSkeleton() {
  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-950/80 p-5">
      <div className="flex items-start justify-between">
        <div className="h-5 w-20 animate-pulse rounded-full bg-slate-800" />
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-800" />
      </div>
      <div className="mt-5 flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-800" />
        <div className="h-5 w-32 animate-pulse rounded-md bg-slate-800" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-800" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-slate-800" />
      </div>
      <div className="mt-5 h-4 w-24 animate-pulse rounded bg-slate-800" />
      <div className="mt-5 flex items-center justify-between">
        <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-800" />
        <div className="h-4 w-16 animate-pulse rounded bg-slate-800" />
      </div>
    </div>
  );
}

function EmptyState({ onClearFilters }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-700 bg-slate-950/70 px-6 py-12 text-center shadow-[0_20px_45px_-35px_rgba(15,23,42,0.8)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-200 ring-1 ring-blue-400/20">
        <FaSearch size={24} />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-white">No resources found</h2>
      <p className="mt-3 text-sm text-slate-400">We couldn&apos;t find resources matching your filters.</p>
      <button
        type="button"
        onClick={onClearFilters}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        <FaTimes size={10} />
        Clear Filters
      </button>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="rounded-[28px] border border-red-500/20 bg-slate-950/80 p-8 text-center shadow-[0_20px_45px_-35px_rgba(15,23,42,0.8)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-300 ring-1 ring-red-500/20">
        <FaFilter size={22} />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-white">Unable to load resources</h2>
      <p className="mt-3 text-sm text-slate-400">Something went wrong while fetching learning resources.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        Try Again
      </button>
    </div>
  );
}

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await getResources();
      const safeResources = Array.isArray(data) ? data : [];
      setResources(safeResources);
    } catch (fetchError) {
      console.error("Failed to fetch resources:", fetchError);
      setError("Unable to load resources");
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadResources = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await getResources();
        setResources(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        console.error("Failed to fetch resources:", fetchError);
        setError("Unable to load resources");
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    void loadResources();
  }, []);

  const categoryCounts = {};

  resources.forEach((resource) => {
    const categoryName = normalizeCategory(resource.category || "General");
    categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
  });

  const categoryOptions = (() => {
    const categoriesFromData = Object.keys(categoryCounts).sort((a, b) => a.localeCompare(b));
    const allOptions = [...new Set([...DEFAULT_CATEGORY_CARDS.map((item) => item.name), ...categoriesFromData])];

    return allOptions.filter((option) => option && option !== "General");
  })();

  const featuredResources = (() => {
    const featured = resources.filter((resource) => resource.featured || resource.isFeatured);
    if (featured.length >= 1) {
      return featured.slice(0, 3);
    }

    return resources.slice(0, 3);
  })();

  let filteredResources = [...resources];

  if (searchTerm.trim()) {
    const query = searchTerm.trim().toLowerCase();
    filteredResources = filteredResources.filter((resource) => {
      const searchableText = [
        resource.title,
        resource.description,
        resource.category,
        resource.type,
        resource.difficulty,
        resource.level,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }

  if (selectedCategory !== "All") {
    filteredResources = filteredResources.filter((resource) => normalizeCategory(resource.category || "General") === selectedCategory);
  }

  if (selectedType !== "All") {
    filteredResources = filteredResources.filter((resource) => getResourceType(resource) === selectedType);
  }

  if (selectedDifficulty !== "All") {
    filteredResources = filteredResources.filter((resource) => getDifficulty(resource) === selectedDifficulty);
  }

  const activeFilterCount = [
    searchTerm.trim() ? 1 : 0,
    selectedCategory !== "All" ? 1 : 0,
    selectedType !== "All" ? 1 : 0,
    selectedDifficulty !== "All" ? 1 : 0,
  ].reduce((sum, value) => sum + value, 0);

  const handleToggleBookmark = (resourceId) => {
    setBookmarkedIds((current) =>
      current.includes(resourceId) ? current.filter((id) => id !== resourceId) : [...current, resourceId]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedType("All");
    setSelectedDifficulty("All");
  };

  const learningProgress = resources.some((resource) => resource.progress !== undefined || resource.completed !== undefined || resource.saved !== undefined)
    ? {
        completed: resources.filter((resource) => Number(resource.progress) >= 100 || resource.completed).length,
        currentlyLearning: resources.filter((resource) => Number(resource.progress) > 0 && Number(resource.progress) < 100).length,
        savedResources: resources.filter((resource) => resource.saved).length,
        progressPercent: (() => {
          const values = resources
            .map((resource) => Number(resource.progress))
            .filter((value) => !Number.isNaN(value));

          if (!values.length) return 0;
          return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
        })(),
      }
    : null;

  if (loading) {
    return (
      <div className="min-h-full p-4 sm:p-6 lg:p-8">
        <div className="mb-6 rounded-[30px] border border-blue-500/20 bg-slate-950/80 p-6 sm:p-8">
          <div className="h-4 w-28 animate-pulse rounded-full bg-slate-800" />
          <div className="mt-5 h-10 w-64 animate-pulse rounded-xl bg-slate-800" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-800" />
          <div className="mt-6 flex gap-3">
            <div className="h-8 w-28 animate-pulse rounded-full bg-slate-800" />
            <div className="h-8 w-28 animate-pulse rounded-full bg-slate-800" />
            <div className="h-8 w-28 animate-pulse rounded-full bg-slate-800" />
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-[22px] border border-white/10 bg-slate-950/80" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ResourceSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full p-4 sm:p-6 lg:p-8">
        <ErrorState onRetry={fetchResources} />
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <ResourceHeader totalResources={resources.length} totalCategories={categoryOptions.length} />

        <section className="rounded-[28px] border border-white/10 bg-slate-950/80 p-4 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.8)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">Explore Categories</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {categoryOptions.map((category) => (
              <CategoryCard
                key={category}
                category={category}
                count={categoryCounts[category] || 0}
                isActive={selectedCategory === category}
                onClick={(value) => setSelectedCategory((current) => (current === value ? "All" : value))}
              />
            ))}
          </div>
        </section>

        <ResourceFilters
          searchTerm={searchTerm}
          category={selectedCategory}
          type={selectedType}
          difficulty={selectedDifficulty}
          activeFilterCount={activeFilterCount}
          categories={categoryOptions}
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onTypeChange={setSelectedType}
          onDifficultyChange={setSelectedDifficulty}
          onClearFilters={clearFilters}
        />

        {featuredResources.length > 0 && (
          <section className="rounded-[28px] border border-white/10 bg-slate-950/80 p-4 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.8)] sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-white">
              <FaStar className="text-blue-300" />
              <h2 className="text-xl font-bold">Featured Resources</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {featuredResources.map((resource) => (
                <article key={resource.id || `${resource.title}-${resource.link}`} className="rounded-[22px] border border-blue-400/20 bg-[linear-gradient(180deg,rgba(59,130,246,0.14),rgba(15,23,42,0.96))] p-5 shadow-[0_20px_45px_-32px_rgba(59,130,246,0.8)]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-100">
                      {getResourceType(resource)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-slate-900/70 px-2.5 py-1 text-[10px] font-medium text-slate-300">
                      {normalizeCategory(resource.category || "General")}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{resource.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{resource.description || "Explore this resource to deepen your skills and stay ahead in your career journey."}</p>

                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <FaCheckCircle className="text-emerald-400" size={10} />
                      {getDifficulty(resource)}
                    </span>
                    {resource.estimatedTime && (
                      <span className="inline-flex items-center gap-1.5">
                        <FaClock size={10} />
                        {resource.estimatedTime}
                      </span>
                    )}
                  </div>

                  <a
                    href={resource.link || "#"}
                    target={resource.link ? "_blank" : undefined}
                    rel={resource.link ? "noreferrer" : undefined}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-3.5 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/15"
                  >
                    Open Resource
                    <FaExternalLinkAlt size={11} />
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-[28px] border border-white/10 bg-slate-950/80 p-4 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.8)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">Recommended Resources</h2>
            <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-300">
              {filteredResources.length} Resources
            </span>
          </div>

          {filteredResources.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id || `${resource.title}-${resource.link}`}
                  resource={resource}
                  isBookmarked={bookmarkedIds.includes(resource.id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          ) : (
            <EmptyState onClearFilters={clearFilters} />
          )}
        </section>

        {learningProgress && (
          <section className="rounded-[28px] border border-white/10 bg-slate-950/80 p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.8)]">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white">Your Learning Progress</h2>
              <span className="text-sm text-slate-400">{learningProgress.progressPercent}%</span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Resources Completed</p>
                <p className="mt-3 text-2xl font-bold text-white">{learningProgress.completed}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Currently Learning</p>
                <p className="mt-3 text-2xl font-bold text-white">{learningProgress.currentlyLearning}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Saved Resources</p>
                <p className="mt-3 text-2xl font-bold text-white">{learningProgress.savedResources}</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" style={{ width: `${learningProgress.progressPercent}%` }} />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Resources;