import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

function ManageRoadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [roadmapContent, setRoadmapContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const response = await api.get("/roadmaps");
      setRoadmaps(response.data.data || []);
    } catch (err) {
      console.error(err);
      setRoadmaps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !roadmapContent) {
      setError("Title and roadmap content are required.");
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      const response = await api.post("/roadmaps", {
        title,
        targetRole,
        roadmapContent,
      });
      setSuccess(response.data.message || "Roadmap uploaded successfully.");
      setError("");
      setTitle("");
      setTargetRole("");
      setRoadmapContent("");
      fetchRoadmaps();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to upload roadmap.");
      setSuccess("");
    } finally {
      setSaving(false);
    }
  };

  const filteredRoadmaps = roadmaps.filter((roadmap) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      roadmap.title?.toLowerCase().includes(query) ||
      roadmap.targetRole?.toLowerCase().includes(query) ||
      roadmap.roadmapContent?.toLowerCase().includes(query)
    );
  });

  if (loading) return <Loader />;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Manage Roadmaps</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">Upload generic roadmaps and let authenticated users search the roadmap library.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-2xl border border-neutral-200 dark:border-white/8 bg-white dark:bg-[#0f1123] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Upload New Roadmap</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-slate-400">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Roadmap title"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-slate-400">Target Role</label>
              <input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Optional role, e.g. React Developer"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-slate-400">Roadmap Content</label>
              <textarea
                value={roadmapContent}
                onChange={(e) => setRoadmapContent(e.target.value)}
                rows={8}
                placeholder="Write the roadmap details here..."
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm text-emerald-300">{success}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Uploading..." : "Upload Roadmap"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-white/8 bg-white dark:bg-[#0f1123] shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Roadmap Library</h2>
          <div className="relative mt-4">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search uploaded roadmaps"
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/4 border-b border-gray-100 dark:border-white/8 text-left">
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Title</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Target Role</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/6">
                {filteredRoadmaps.length > 0 ? (
                  filteredRoadmaps.map((roadmap) => (
                    <tr key={roadmap.id} className="hover:bg-gray-50 dark:hover:bg-white/4 transition-colors">
                      <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{roadmap.title}</td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{roadmap.targetRole || "—"}</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400 text-xs">{new Date(roadmap.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={3}>
                      No roadmaps match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageRoadmaps;
