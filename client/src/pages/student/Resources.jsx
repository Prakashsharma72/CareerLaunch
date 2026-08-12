import { useEffect, useState } from "react";

import ResourceCard from "../../components/resources/ResourceCard";
import Loader from "../../components/common/Loader";

function Resources() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);

      // Replace with API later
      const dummyResources = [
        {
          id: 1,
          title: "React Complete Guide",
          category: "React",
          description:
            "Learn React from beginner to advanced level including Hooks, Router and Redux.",
          link: "https://react.dev",
        },

        {
          id: 2,
          title: "Node.js Documentation",
          category: "Node.js",
          description:
            "Official Node.js documentation and guides.",
          link: "https://nodejs.org",
        },

        {
          id: 3,
          title: "PostgreSQL Tutorial",
          category: "Database",
          description:
            "Learn PostgreSQL from scratch with examples.",
          link: "https://www.postgresql.org/docs/",
        },

        {
          id: 4,
          title: "JavaScript Interview Questions",
          category: "JavaScript",
          description:
            "Most asked JavaScript interview questions for freshers.",
          link: "#",
        },

        {
          id: 5,
          title: "DSA Preparation Sheet",
          category: "DSA",
          description:
            "Important DSA questions and roadmap for placements.",
          link: "#",
        },
      ];

      setResources(dummyResources);
      setFilteredResources(dummyResources);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (
    value,
    selectedCategory
  ) => {
    let filtered = [...resources];

    if (value) {
      filtered = filtered.filter(
        (resource) =>
          resource.title
            .toLowerCase()
            .includes(
              value.toLowerCase()
            ) ||
          resource.description
            .toLowerCase()
            .includes(
              value.toLowerCase()
            )
      );
    }

    if (
      selectedCategory &&
      selectedCategory !== "All"
    ) {
      filtered = filtered.filter(
        (resource) =>
          resource.category ===
          selectedCategory
      );
    }

    setFilteredResources(filtered);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearchTerm(value);

    handleSearch(
      value,
      category
    );
  };

  const handleCategoryChange = (e) => {
    const selected =
      e.target.value;

    setCategory(selected);

    handleSearch(
      searchTerm,
      selected
    );
  };

  const handleBookmark = (
    resourceId
  ) => {
    alert(
      `Resource ${resourceId} bookmarked successfully`
    );

    console.log(
      "Bookmarked Resource:",
      resourceId
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-full p-6 sm:p-8 lg:p-10">

      {/* Header */}
      <div className="mb-8 rounded-4xl border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.95)]">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 text-blue-200 px-3 py-1 text-xs font-semibold tracking-wide">
          Learning Center
        </div>
        <div className="mt-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Learning Resources
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl">
            Explore tutorials, career guides, interview prep content, and curated study materials to level up your job search.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-3xl bg-slate-900/90 border border-white/5 px-5 py-3 text-sm text-slate-300">
            {filteredResources.length} Resources Found
          </div>
          <div className="rounded-3xl bg-slate-900/90 border border-white/5 px-5 py-3 text-sm text-slate-300">
            Filter by category or keyword to refine your learning path.
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-8 rounded-[28px] border border-white/10 bg-slate-950/90 p-6 shadow-[0_24px_56px_-30px_rgba(15,23,42,0.8)]">
        <div className="grid gap-4 sm:grid-cols-[1.8fr_1fr]">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          />

          <select
            value={category}
            onChange={handleCategoryChange}
            className="w-full rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All">All Categories</option>
            <option value="React">React</option>
            <option value="Node.js">Node.js</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Database">Database</option>
            <option value="DSA">DSA</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onBookmark={handleBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-white/10 bg-slate-950/90 p-10 text-center text-slate-300 shadow-[0_24px_56px_-30px_rgba(15,23,42,0.8)]">
          <h2 className="text-2xl font-semibold text-white">No Resources Found</h2>
          <p className="mt-3 text-sm text-slate-400">Try another keyword, category, or clear your search.</p>
        </div>
      )}
    </div>
  );
}

export default Resources;