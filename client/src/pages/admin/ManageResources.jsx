import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaBook } from "react-icons/fa";
import Loader from "../../components/common/Loader";
import { RESOURCE_CATEGORIES, getResourceCategory } from "../../constants/resourceCategories";
import { addResource, deleteResource, getAdminResources, updateResource } from "../../services/resourceService";

const RESOURCE_TYPES = ["Video", "Article", "Course", "Documentation", "PDF"];
const STATUSES = ["draft", "published"];
const EMPTY_FORM = {
  title: "",
  description: "",
  category: "web-development",
  resourceType: "Article",
  link: "",
  status: "published",
  file: null,
};

function ManageResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchResources = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getAdminResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error("Failed to fetch admin resources:", fetchError);
      setError(fetchError.response?.data?.message || "Unable to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchResources();
    const refresh = () => void fetchResources();
    window.addEventListener("focus", refresh);
    window.addEventListener("resources:changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("resources:changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const openAddModal = () => {
    setEditingResource(null);
    setFormData({ ...EMPTY_FORM });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title || "",
      description: resource.description || "",
      category: resource.category || "web-development",
      resourceType: resource.resourceType || "Article",
      link: resource.link || resource.fileUrl || "",
      status: resource.status || "draft",
      file: null,
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.link && !formData.file) {
      setError("Provide a URL or upload a file.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = editingResource
        ? await updateResource(editingResource.id, formData)
        : await addResource(formData);

      const savedResource = response.data;
      setResources((current) => editingResource
        ? current.map((resource) => resource.id === savedResource.id ? savedResource : resource)
        : [savedResource, ...current]
      );
      setShowModal(false);
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to save resource");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;

    try {
      await deleteResource(id);
      setResources((current) => current.filter((resource) => resource.id !== id));
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Unable to delete resource");
    }
  };

  const filtered = resources.filter((resource) => {
    const matchSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "All" || resource.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const updateField = (name, value) =>
    setFormData((current) => ({ ...current, [name]: value }));

  if (loading) return <Loader />;

  return (
    <div className="cl-page p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--cl-text)] sm:text-3xl">
            Manage Resources
          </h1>
          <p className="mt-1 text-sm text-[var(--cl-text-muted)]">
            Add, update and delete learning resources.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="cl-primary-btn flex items-center justify-center gap-2 self-start px-4 py-2.5 text-sm md:self-auto"
        >
          <FaPlus />
          Add Resource
        </button>
      </div>

      {error && !showModal && (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--cl-danger)]/20 bg-[var(--cl-danger-soft)] px-4 py-3 text-sm text-[var(--cl-danger)] sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void fetchResources()}
            className="font-semibold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      <div className="cl-card p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--cl-text-soft)]" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="cl-control w-full pl-10 pr-4 py-2.5 text-sm"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="cl-control px-3 py-2.5 text-sm"
          >
            <option value="All">All Categories</option>
            {RESOURCE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="cl-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cl-surface-soft)]">
              <FaBook className="text-2xl text-[var(--cl-text-soft)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--cl-text)]">No resources found</h3>
            <p className="max-w-xs text-sm text-[var(--cl-text-muted)]">
              Try adjusting your search or add a new resource.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-[var(--cl-border)] bg-[var(--cl-surface-soft)] text-left">
                  <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Title
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Category
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((resource) => {
                  const category = getResourceCategory(resource.category);

                  return (
                    <tr
                      key={resource.id}
                      className="border-b border-[var(--cl-border)] transition-colors last:border-b-0 hover:bg-[var(--cl-surface-soft)]"
                    >
                      <td className="px-5 py-4 align-top">
                        <div className="font-medium text-[var(--cl-text)]">{resource.title}</div>
                        <div className="mt-1 max-w-xs truncate text-xs text-[var(--cl-text-muted)]">
                          {resource.description}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <span className="inline-flex rounded-full bg-[var(--cl-primary-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--cl-primary-strong)]">
                          {category?.name || resource.category}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            resource.status === "published"
                              ? "bg-[var(--cl-success-soft)] text-[var(--cl-success)]"
                              : "bg-[var(--cl-warning-soft)] text-[var(--cl-warning)]"
                          }`}
                        >
                          {resource.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(resource)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-2.5 py-1.5 text-xs font-medium text-[var(--cl-text)] transition-colors hover:bg-[var(--cl-surface-elevated)]"
                          >
                            <FaEdit className="text-[10px]" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDelete(resource.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--cl-danger)]/20 bg-[var(--cl-danger-soft)] px-2.5 py-1.5 text-xs font-medium text-[var(--cl-danger)] transition-colors hover:bg-[var(--cl-danger)] hover:text-[var(--cl-button-text)]"
                          >
                            <FaTrash className="text-[10px]" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--cl-overlay)] p-4 backdrop-blur-sm">
          <div className="cl-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--cl-border)] px-6 py-4">
              <h2 className="text-lg font-bold text-[var(--cl-text)]">
                {editingResource ? "Edit Resource" : "Add Resource"}
              </h2>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--cl-surface-soft)] text-[var(--cl-text-muted)] transition-colors hover:bg-[var(--cl-surface-elevated)]"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {error && (
                <p className="rounded-lg border border-[var(--cl-danger)]/20 bg-[var(--cl-danger-soft)] p-3 text-sm text-[var(--cl-danger)]">
                  {error}
                </p>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--cl-text)]">
                  Resource title
                </label>
                <input
                  name="title"
                  placeholder="Resource title"
                  value={formData.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  required
                  className="cl-control w-full px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--cl-text)]">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Description"
                  value={formData.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  required
                  className="cl-control w-full resize-none px-4 py-2.5 text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--cl-text)]">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    className="cl-control w-full px-3 py-2.5 text-sm"
                  >
                    {RESOURCE_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--cl-text)]">
                    Type
                  </label>
                  <select
                    value={formData.resourceType}
                    onChange={(event) => updateField("resourceType", event.target.value)}
                    className="cl-control w-full px-3 py-2.5 text-sm"
                  >
                    {RESOURCE_TYPES.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--cl-text)]">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(event) => updateField("status", event.target.value)}
                  className="cl-control w-full px-3 py-2.5 text-sm"
                >
                  {STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--cl-text)]">
                  Resource URL
                </label>
                <input
                  type="url"
                  placeholder="Resource URL (optional when uploading a file)"
                  value={formData.link}
                  disabled={Boolean(formData.file)}
                  onChange={(event) => updateField("link", event.target.value)}
                  className="cl-control w-full px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="rounded-xl border border-dashed border-[var(--cl-border)] bg-[var(--cl-surface-soft)] p-3">
                <label className="block text-sm font-medium text-[var(--cl-text)]">
                  Upload resource file
                  <span className="ml-1 font-normal text-[var(--cl-text-muted)]">
                    (optional if a URL is provided)
                  </span>
                </label>

                <input
                  type="file"
                  name="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.webp,.mp4,.webm"
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      file: event.target.files?.[0] || null,
                      link: "",
                    }))
                  }
                  className="mt-2 block w-full text-sm text-[var(--cl-text-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--cl-primary-soft)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--cl-primary-strong)] file:transition-colors hover:file:bg-[var(--cl-primary)] hover:file:text-[var(--cl-button-text)]"
                />

                {formData.file && (
                  <p className="mt-2 text-xs text-[var(--cl-primary-strong)]">
                    Selected: {formData.file.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cl-secondary-btn flex-1"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="cl-primary-btn flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingResource ? "Update Resource" : "Add Resource"}
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
