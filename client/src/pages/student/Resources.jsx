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
import { RESOURCE_CATEGORIES, getResourceCategory } from "../../constants/resourceCategories";

const TYPE_OPTIONS = ["All", "Video", "Article", "Course", "Documentation", "PDF"];
const DIFFICULTY_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced"];

const normalizeCategory = (category) => getResourceCategory(category).id;

const getCategoryMeta = (category) => {
  return getResourceCategory(normalizeCategory(category));
};

const getResourceType = (resource = {}) => {
  if (resource.type) return resource.type;
  if (resource.resourceType) return resource.resourceType;
  const resourceUrl = resource.link || resource.fileUrl || "";
  if (resourceUrl.toLowerCase().includes(".pdf")) return "PDF";
  if (resourceUrl.toLowerCase().includes("youtube") || resourceUrl.toLowerCase().includes("vimeo")) return "Video";
  if (resourceUrl.toLowerCase().includes("course")) return "Course";
  if (resourceUrl.toLowerCase().includes("docs") || resourceUrl.toLowerCase().includes("documentation")) return "Documentation";
  return "Article";
};

const getDifficulty = (resource = {}) => {
  if (resource.difficulty) return resource.difficulty;
  if (resource.level) return resource.level;
  return "Beginner";
};

const formatCount = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

function ResourceHeader({ totalResources, totalCategories }) {
  return (
    <header className="relative overflow-hidden rounded-xl border border-[var(--cl-primary)]/20 bg-[var(--cl-primary-soft)] p-5 shadow-[0_12px_30px_-24px_rgba(47,125,246,0.35)] sm:p-6 lg:p-7">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cl-primary)]/70 to-transparent" />

      <div className="relative">
        <div className="flex justify-center md:justify-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--cl-primary)]/20 bg-[var(--cl-surface)]/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--cl-primary)]">
            <FaBookOpen className="text-[var(--cl-primary)]" size={10} />
            Learning Center
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="max-w-2xl text-sm leading-7 text-[var(--cl-text-muted)] sm:text-base lg:text-lg">
              Everything you need to learn, prepare, and grow your career with practical, job-ready guidance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs font-medium text-[var(--cl-text)] lg:justify-end">
            <div className="rounded-full border border-[var(--cl-border)] bg-[var(--cl-surface)] px-3 py-2">
              {formatCount(totalResources, "resource", "resources")}
            </div>
            <div className="rounded-full border border-[var(--cl-border)] bg-[var(--cl-surface)] px-3 py-2">
              {formatCount(totalCategories, "category", "categories")}
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
          ? "border-[var(--cl-primary)]/40 bg-[var(--cl-primary-soft)] shadow-[0_18px_32px_-24px_rgba(47,125,246,0.45)]"
          : "border-[var(--cl-border)] bg-[var(--cl-surface)] hover:-translate-y-0.5 hover:border-[var(--cl-primary)]/30 hover:bg-[var(--cl-surface-elevated)]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--cl-surface-soft)] text-lg shadow-inner shadow-[var(--cl-primary)]/10 text-[var(--cl-primary)]">
          {meta.icon}
        </span>
        <span className="text-sm font-semibold text-[var(--cl-text)] sm:text-[15px]">{meta.name}</span>
      </div>
      <span className="mt-3 text-xs text-[var(--cl-text-muted)]">{formatCount(count, "resource", "resources")}</span>
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
    <div className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.08)] sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
        <label className="relative block">
          <span className="sr-only">Search resources</span>
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--cl-text-soft)]" />
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            type="text"
            placeholder="Search tutorials, interview guides, courses..."
            className="w-full rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] py-3 pl-11 pr-4 text-sm text-[var(--cl-text)] placeholder:text-[var(--cl-text-soft)] outline-none transition duration-200 focus:border-[var(--cl-primary)] focus:ring-2 focus:ring-[var(--cl-ring)]"
          />
        </label>

        <label className="relative block">
          <span className="sr-only">Select category</span>
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full appearance-none rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-4 py-3 pr-10 text-sm text-[var(--cl-text)] outline-none transition duration-200 focus:border-[var(--cl-primary)] focus:ring-2 focus:ring-[var(--cl-ring)]"
          >
            <option value="All">All Categories</option>
            {categories.map((option) => (
                  <option key={option} value={option}>
                    {getResourceCategory(option).name}
              </option>
            ))}
          </select>
          <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--cl-text-soft)]" size={12} />
        </label>

        <label className="relative block">
          <span className="sr-only">Select resource type</span>
          <select
            value={type}
            onChange={(event) => onTypeChange(event.target.value)}
            className="w-full appearance-none rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-4 py-3 pr-10 text-sm text-[var(--cl-text)] outline-none transition duration-200 focus:border-[var(--cl-primary)] focus:ring-2 focus:ring-[var(--cl-ring)]"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All Types" : option}
              </option>
            ))}
          </select>
          <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--cl-text-soft)]" size={12} />
        </label>

        <label className="relative block">
          <span className="sr-only">Select difficulty</span>
          <select
            value={difficulty}
            onChange={(event) => onDifficultyChange(event.target.value)}
            className="w-full appearance-none rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-4 py-3 pr-10 text-sm text-[var(--cl-text)] outline-none transition duration-200 focus:border-[var(--cl-primary)] focus:ring-2 focus:ring-[var(--cl-ring)]"
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All Levels" : option}
              </option>
            ))}
          </select>
          <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--cl-text-soft)]" size={12} />
        </label>
      </div>

      {activeFilterCount > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-2 text-xs font-medium text-[var(--cl-text)] transition hover:border-[var(--cl-primary)]/40 hover:text-[var(--cl-primary)]"
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
    <article className="group relative flex h-full flex-col rounded-[22px] border border-[var(--cl-border)] bg-[var(--cl-surface)] p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.12)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--cl-primary)]/30 hover:shadow-[0_28px_55px_-30px_rgba(47,125,246,0.25)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="inline-flex rounded-full border border-[var(--cl-primary)]/25 bg-[var(--cl-primary-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--cl-primary)]">
          {resourceType}
        </span>

        <button
          type="button"
          aria-label={`Bookmark ${resource.title}`}
          onClick={() => onToggleBookmark(resource.id)}
          className={`rounded-full border p-2 transition ${
            isBookmarked
              ? "border-[var(--cl-primary)]/40 bg-[var(--cl-primary-soft)] text-[var(--cl-primary)]"
              : "border-[var(--cl-border)] bg-[var(--cl-surface-soft)] text-[var(--cl-text-muted)] hover:border-[var(--cl-primary)]/30 hover:text-[var(--cl-primary)]"
          }`}
        >
          <FaBookmark size={13} />
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--cl-surface-soft)] text-[var(--cl-primary)] ring-1 ring-[var(--cl-primary)]/15">
          <FaBook size={16} />
        </div>
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[var(--cl-text)]">{resource.title}</h3>
      </div>

      {resource.fileName && (
        <p className="mb-3 truncate text-xs text-[var(--cl-primary)]" title={resource.fileName}>
          File: {resource.fileName}
        </p>
      )}

      <p className="line-clamp-3 flex-1 text-sm leading-6 text-[var(--cl-text-muted)]">{resource.description || "Explore this learning resource to strengthen your skills and career readiness."}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--cl-text-muted)]">
          {getResourceCategory(resource.category).name}
        </span>
        <span className="rounded-full border border-[var(--cl-primary)]/20 bg-[var(--cl-primary-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--cl-primary)]">
          {difficulty}
        </span>
      </div>

      {(resource.estimatedTime || resource.duration || resource.time) && (
        <div className="mt-4 inline-flex items-center gap-2 text-xs text-[var(--cl-text-soft)]">
          <FaClock size={10} />
          <span>{resource.estimatedTime || resource.duration || resource.time}</span>
        </div>
      )}

      {resourceTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {resourceTags.map((tag) => (
            <span key={`${resource.id}-${tag}`} className="rounded-full bg-[var(--cl-surface-soft)] px-2 py-1 text-[10px] font-medium text-[var(--cl-text-muted)] ring-1 ring-[var(--cl-border)]">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <a
          href={resource.link || resource.fileUrl || "#"}
          target={resource.link || resource.fileUrl ? "_blank" : undefined}
          rel={resource.link || resource.fileUrl ? "noreferrer" : undefined}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--cl-primary)] px-3.5 py-2 text-sm font-semibold text-[var(--cl-button-text)] transition hover:bg-[var(--cl-primary-strong)]"
        >
          Start Learning
          <FaArrowRight size={12} />
        </a>

        <span className="text-xs text-[var(--cl-text-soft)]">{resource.link || resource.fileUrl ? "Open" : "Unavailable"}</span>
      </div>
    </article>
  );
}

function ResourceSkeleton() {
  return (
    <div className="rounded-[22px] border border-[var(--cl-border)] bg-[var(--cl-surface)] p-5">
      <div className="flex items-start justify-between">
        <div className="h-5 w-20 animate-pulse rounded-full bg-[var(--cl-surface-soft)]" />
        <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--cl-surface-soft)]" />
      </div>
      <div className="mt-5 flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-[var(--cl-surface-soft)]" />
        <div className="h-5 w-32 animate-pulse rounded-md bg-[var(--cl-surface-soft)]" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-[var(--cl-surface-soft)]" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-[var(--cl-surface-soft)]" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--cl-surface-soft)]" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--cl-surface-soft)]" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-[var(--cl-surface-soft)]" />
      </div>
      <div className="mt-5 h-4 w-24 animate-pulse rounded bg-[var(--cl-surface-soft)]" />
      <div className="mt-5 flex items-center justify-between">
        <div className="h-10 w-32 animate-pulse rounded-xl bg-[var(--cl-surface-soft)]" />
        <div className="h-4 w-16 animate-pulse rounded bg-[var(--cl-surface-soft)]" />
      </div>
    </div>
  );
}

function EmptyState({ onClearFilters }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--cl-border)] bg-[var(--cl-surface)] px-6 py-12 text-center shadow-[0_12px_30px_-24px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--cl-primary-soft)] text-[var(--cl-primary)] ring-1 ring-[var(--cl-primary)]/15">
        <FaSearch size={24} />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-[var(--cl-text)]">No resources found</h2>
      <p className="mt-3 text-sm text-[var(--cl-text-muted)]">We couldn&apos;t find resources matching your filters.</p>
      <button
        type="button"
        onClick={onClearFilters}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--cl-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--cl-button-text)] transition hover:bg-[var(--cl-primary-strong)]"
      >
        <FaTimes size={10} />
        Clear Filters
      </button>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="rounded-xl border border-[var(--cl-danger)]/20 bg-[var(--cl-surface)] p-8 text-center shadow-[0_12px_30px_-24px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--cl-danger-soft)] text-[var(--cl-danger)] ring-1 ring-[var(--cl-danger)]/20">
        <FaFilter size={22} />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-[var(--cl-text)]">Unable to load resources</h2>
      <p className="mt-3 text-sm text-[var(--cl-text-muted)]">Something went wrong while fetching learning resources.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--cl-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--cl-button-text)] transition hover:bg-[var(--cl-primary-strong)]"
      >
        Try Again
      </button>
    </div>
  );
}

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      const response = await getResources();
      const safeResources = Array.isArray(response?.data) ? response.data : [];
      setResources(safeResources);
      setRefreshing(Boolean(response?.stale));
    } catch (fetchError) {
      console.error("Failed to fetch resources:", fetchError);
      setError("Unable to load resources");
      setResources([]);
      setRefreshing(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadResources = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getResources();
        setResources(Array.isArray(response?.data) ? response.data : []);
        setRefreshing(Boolean(response?.stale));
      } catch (fetchError) {
        console.error("Failed to fetch resources:", fetchError);
        setError("Unable to load resources");
        setResources([]);
        setRefreshing(false);
      } finally {
        setLoading(false);
      }
    };

    void loadResources();
    const refresh = () => void loadResources();
    window.addEventListener("focus", refresh);
    window.addEventListener("resources:changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("resources:changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const categoryCounts = {};

  resources.forEach((resource) => {
    const categoryName = normalizeCategory(resource.category || "General");
    categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
  });

  const categoryOptions = (() => {
    return RESOURCE_CATEGORIES.map((category) => category.id);
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
        <div className="mb-6 rounded-[30px] border border-[var(--cl-border)] bg-[var(--cl-surface)] p-6 sm:p-8">
          <div className="h-4 w-28 animate-pulse rounded-full bg-[var(--cl-surface-soft)]" />
          <div className="mt-5 h-10 w-64 animate-pulse rounded-xl bg-[var(--cl-surface-soft)]" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-[var(--cl-surface-soft)]" />
          <div className="mt-6 flex gap-3">
            <div className="h-8 w-28 animate-pulse rounded-full bg-[var(--cl-surface-soft)]" />
            <div className="h-8 w-28 animate-pulse rounded-full bg-[var(--cl-surface-soft)]" />
            <div className="h-8 w-28 animate-pulse rounded-full bg-[var(--cl-surface-soft)]" />
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-[22px] border border-[var(--cl-border)] bg-[var(--cl-surface)]" />
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
        <ResourceHeader totalResources={resources.length} totalCategories={Object.keys(categoryCounts).length} />

        {refreshing && (
          <div className="flex items-center justify-between rounded-xl border border-[var(--cl-primary)]/20 bg-[var(--cl-primary-soft)] px-4 py-3 text-sm text-[var(--cl-primary)]">
            <span>Updating resources…</span>
            <button type="button" onClick={fetchResources} className="rounded-full border border-[var(--cl-primary)]/30 px-3 py-1.5 text-xs font-semibold">
              Refresh now
            </button>
          </div>
        )}

        <section className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.08)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[var(--cl-text)]">Explore Categories</h2>
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
          <section className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.08)] sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-[var(--cl-text)]">
              <FaStar className="text-[var(--cl-primary)]" />
              <h2 className="text-xl font-bold">Featured Resources</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {featuredResources.map((resource) => (
                <article key={resource.id || `${resource.title}-${resource.link}`} className="rounded-[22px] border border-[var(--cl-primary)]/20 bg-[var(--cl-surface)] p-5 shadow-[0_20px_45px_-32px_rgba(47,125,246,0.18)]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="rounded-full border border-[var(--cl-primary)]/20 bg-[var(--cl-primary-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--cl-primary)]">
                      {getResourceType(resource)}
                    </span>
                    <span className="rounded-full border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-2.5 py-1 text-[10px] font-medium text-[var(--cl-text-muted)]">
                      {getResourceCategory(resource.category).name}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--cl-text)]">{resource.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--cl-text-muted)]">{resource.description || "Explore this resource to deepen your skills and stay ahead in your career journey."}</p>

                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--cl-text-muted)]">
                    <span className="inline-flex items-center gap-1.5 text-[var(--cl-text-muted)]">
                      <FaCheckCircle className="text-[var(--cl-success)]" size={10} />
                      {getDifficulty(resource)}
                    </span>
                    {resource.estimatedTime && (
                      <span className="inline-flex items-center gap-1.5 text-[var(--cl-text-soft)]">
                        <FaClock size={10} />
                        {resource.estimatedTime}
                      </span>
                    )}
                  </div>

                  <a
                    href={resource.link || resource.fileUrl || "#"}
                    target={resource.link || resource.fileUrl ? "_blank" : undefined}
                    rel={resource.link || resource.fileUrl ? "noreferrer" : undefined}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--cl-primary)]/20 bg-[var(--cl-primary-soft)] px-3.5 py-2 text-sm font-semibold text-[var(--cl-primary)] transition hover:bg-[var(--cl-primary-soft)]"
                  >
                    Open Resource
                    <FaExternalLinkAlt size={11} />
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.08)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[var(--cl-text)]">Recommended Resources</h2>
            <span className="rounded-full border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--cl-text-muted)]">
              {formatCount(filteredResources.length, "resource", "resources")}
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
          <section className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[var(--cl-text)]">Your Learning Progress</h2>
              <span className="text-sm text-[var(--cl-text-muted)]">{learningProgress.progressPercent}%</span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--cl-text-muted)]">Resources Completed</p>
                <p className="mt-3 text-2xl font-bold text-[var(--cl-text)]">{learningProgress.completed}</p>
              </div>
              <div className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--cl-text-muted)]">Currently Learning</p>
                <p className="mt-3 text-2xl font-bold text-[var(--cl-text)]">{learningProgress.currentlyLearning}</p>
              </div>
              <div className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--cl-text-muted)]">Saved Resources</p>
                <p className="mt-3 text-2xl font-bold text-[var(--cl-text)]">{learningProgress.savedResources}</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--cl-surface-soft)]">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--cl-primary)] via-[var(--cl-primary)] to-[var(--cl-primary-strong)]" style={{ width: `${learningProgress.progressPercent}%` }} />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Resources;