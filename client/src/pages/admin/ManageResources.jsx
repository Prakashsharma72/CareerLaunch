import { useEffect, useState } from "react";
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaBook,
} from "react-icons/fa";
import Loader from "../../components/common/Loader";

const CATEGORIES = ["All", "React", "Node.js", "JavaScript", "DSA", "Database"];

function ManageResources() {
  const [resources,        setResources]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [searchTerm,       setSearchTerm]       = useState("");
  const [categoryFilter,   setCategoryFilter]   = useState("All");
  const [showModal,        setShowModal]        = useState(false);
  const [editingResource,  setEditingResource]  = useState(null);
  const [formData,         setFormData]         = useState({ title: "", category: "", description: "", link: "" });

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setResources([
        { id: 1, title: "React Complete Guide", category: "React",  description: "Complete React learning resource.", link: "https://react.dev"   },
        { id: 2, title: "Node.js Docs",          category: "Node.js",description: "Official Node.js documentation.",  link: "https://nodejs.org"  },
        { id: 3, title: "DSA Sheet",             category: "DSA",   description: "Important DSA questions.",          link: "#"                  },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAddModal = () => {
    setEditingResource(null);
    setFormData({ title: "", category: "", description: "", link: "" });
    setShowModal(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setFormData({ title: resource.title, category: resource.category, description: resource.description, link: resource.link });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingResource) {
      setResources(resources.map((r) => r.id === editingResource.id ? { ...r, ...formData } : r));
    } else {
      setResources([{ id: Date.now(), ...formData }, ...resources]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this resource?")) return;
    setResources(resources.filter((r) => r.id !== id));
  };

  const filtered = resources.filter((r) => {
    const matchSearch   = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "All" || r.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  if (loading) return <Loader />;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Manage Resources
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Add, update and delete learning resources.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
            text-white font-semibold text-sm rounded-xl transition-colors self-start md:self-auto"
        >
          <FaPlus /> Add Resource
        </button>
      </div>

      {/* ── Search + Filter ── */}
      <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search resources…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl
                bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                text-gray-800 dark:text-white placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2.5 px-3 text-sm rounded-xl
              bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
              text-gray-800 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-[#0f1123]">{c === "All" ? "All Categories" : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/8 flex items-center justify-center">
              <FaBook className="text-2xl text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-700 dark:text-white">No resources found</h3>
            <p className="text-sm text-gray-400 max-w-xs">Try adjusting your search or add a new resource.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/4 border-b border-gray-100 dark:border-white/8 text-left">
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Title</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Description</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/6">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/4 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{r.title}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">{r.description}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(r)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                            bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400
                            hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                            bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400
                            hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-[#0f1123] border border-neutral-200 dark:border-white/10
            rounded-2xl shadow-2xl w-full max-w-lg">

            {/* Modal header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100 dark:border-white/8">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {editingResource ? "Edit Resource" : "Add Resource"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center
                  bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-400
                  hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { name: "title",       placeholder: "Resource title",    type: "text" },
                { name: "category",    placeholder: "Category",          type: "text" },
                { name: "link",        placeholder: "Resource URL",      type: "url"  },
              ].map(({ name, placeholder, type }) => (
                <input
                  key={name}
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl
                    bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                    text-gray-800 dark:text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
                />
              ))}
              <textarea
                rows={3}
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 text-sm rounded-xl resize-none
                  bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                  text-gray-800 dark:text-white placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
              />
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl
                    border border-gray-200 dark:border-white/10
                    text-gray-600 dark:text-gray-300
                    hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl
                    bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  {editingResource ? "Update Resource" : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageResources;
