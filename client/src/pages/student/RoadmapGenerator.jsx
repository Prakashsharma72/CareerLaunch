import { useEffect, useMemo, useState } from "react";
import { FaRoad, FaSearch } from "react-icons/fa";
import Loader from "../../components/common/Loader";
import { getRoadmaps } from "../../services/roadmapService";

function RoadmapGenerator() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadRoadmaps = async () => {
      try {
        setLoading(true);
        const response = await getRoadmaps();
        setRoadmaps(response.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load roadmaps.");
      } finally {
        setLoading(false);
      }
    };

    loadRoadmaps();
  }, []);

  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter((roadmap) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        roadmap.title?.toLowerCase().includes(q) ||
        roadmap.targetRole?.toLowerCase().includes(q) ||
        roadmap.roadmapContent?.toLowerCase().includes(q)
      );
    });
  }, [roadmaps, searchTerm]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Roadmap Library
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
          Browse and search the collection of roadmaps uploaded by your CareerLaunch admin.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-5 sm:p-6">
        <div className="relative max-w-xl">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roadmaps by title, role, or keywords..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 shadow-sm">
          {error}
        </div>
      )}

      {filteredRoadmaps.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0f1123] p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          No roadmaps found. Try adjusting your search term or check back later.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredRoadmaps.map((roadmap) => (
            <div key={roadmap.id} className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0f1123] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <FaRoad />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{roadmap.title}</h2>
                    {roadmap.targetRole && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Target role: {roadmap.targetRole}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  {new Date(roadmap.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {roadmap.roadmapContent}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RoadmapGenerator;
