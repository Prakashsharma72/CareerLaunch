import { useEffect, useState } from "react";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import Loader from "../../components/common/Loader";

function ManageResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [showModal, setShowModal] =
    useState(false);

  const [editingResource, setEditingResource] =
    useState(null);

  const [formData, setFormData] =
    useState({
      title: "",
      category: "",
      description: "",
      link: "",
    });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);

      const dummyResources = [
        {
          id: 1,
          title: "React Complete Guide",
          category: "React",
          description:
            "Complete React learning resource.",
          link: "https://react.dev",
        },

        {
          id: 2,
          title: "Node.js Docs",
          category: "Node.js",
          description:
            "Official Node.js documentation.",
          link: "https://nodejs.org",
        },

        {
          id: 3,
          title: "DSA Sheet",
          category: "DSA",
          description:
            "Important DSA questions.",
          link: "#",
        },
      ];

      setResources(dummyResources);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const openAddModal = () => {
    setEditingResource(null);

    setFormData({
      title: "",
      category: "",
      description: "",
      link: "",
    });

    setShowModal(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);

    setFormData({
      title: resource.title,
      category: resource.category,
      description:
        resource.description,
      link: resource.link,
    });

    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingResource) {
      const updatedResources =
        resources.map((resource) =>
          resource.id ===
          editingResource.id
            ? {
                ...resource,
                ...formData,
              }
            : resource
        );

      setResources(updatedResources);

      alert(
        "Resource Updated Successfully"
      );
    } else {
      const newResource = {
        id: Date.now(),
        ...formData,
      };

      setResources([
        newResource,
        ...resources,
      ]);

      alert(
        "Resource Added Successfully"
      );
    }

    setShowModal(false);
  };

  const handleDeleteResource = (
    resourceId
  ) => {
    const confirmDelete =
      window.confirm(
        "Delete this resource?"
      );

    if (!confirmDelete) return;

    const updatedResources =
      resources.filter(
        (resource) =>
          resource.id !==
          resourceId
      );

    setResources(updatedResources);

    alert(
      "Resource Deleted Successfully"
    );
  };

  const filteredResources =
    resources.filter((resource) => {
      const matchesSearch =
        resource.title
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesCategory =
        categoryFilter === "All"
          ? true
          : resource.category ===
            categoryFilter;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div
        className="
        flex
        flex-col
        md:flex-row
        md:justify-between
        md:items-center
        gap-4
        mb-8
      "
      >
        <div>
          <h1 className="text-3xl font-bold">
            Manage Resources
          </h1>

          <p className="text-gray-600 mt-2">
            Add, update and delete
            learning resources.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="
          bg-blue-600
          text-white
          px-5
          py-3
          rounded-lg
          flex
          items-center
          gap-2
          hover:bg-blue-700
        "
        >
          <FaPlus />
          Add Resource
        </button>
      </div>

      {/* Search + Filter */}
      <div
        className="
        bg-white
        shadow
        rounded-xl
        p-5
        mb-6
      "
      >
        <div
          className="
          grid
          md:grid-cols-2
          gap-4
        "
        >

          <div className="relative">

            <FaSearch
              className="
              absolute
              left-4
              top-4
              text-gray-500
            "
            />

            <input
              type="text"
              placeholder="Search Resource..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="
              w-full
              border
              rounded-lg
              py-3
              pl-12
              pr-4
            "
            />

          </div>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value
              )
            }
            className="
            border
            rounded-lg
            p-3
          "
          >
            <option value="All">
              All Categories
            </option>

            <option value="React">
              React
            </option>

            <option value="Node.js">
              Node.js
            </option>

            <option value="JavaScript">
              JavaScript
            </option>

            <option value="DSA">
              DSA
            </option>

            <option value="Database">
              Database
            </option>
          </select>

        </div>
      </div>

      {/* Table */}
      <div
        className="
        bg-white
        shadow
        rounded-xl
        overflow-x-auto
      "
      >
        <table className="w-full">

          <thead>
            <tr className="bg-gray-100">

              <th className="p-4 text-left">
                Title
              </th>

              <th className="p-4 text-left">
                Category
              </th>

              <th className="p-4 text-left">
                Description
              </th>

              <th className="p-4 text-left">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {filteredResources.map(
              (resource) => (
                <tr
                  key={resource.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {resource.title}
                  </td>

                  <td className="p-4">
                    {resource.category}
                  </td>

                  <td className="p-4">
                    {resource.description}
                  </td>

                  <td className="p-4">

                    <div className="flex gap-3">

                      <button
                        onClick={() =>
                          openEditModal(
                            resource
                          )
                        }
                        className="
                        text-blue-600
                      "
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteResource(
                            resource.id
                          )
                        }
                        className="
                        text-red-600
                      "
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </td>
                </tr>
              )
            )}

          </tbody>

        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="
          fixed
          inset-0
          bg-black/50
          flex
          justify-center
          items-center
          z-50
        "
        >
          <div
            className="
            bg-white
            w-full
            max-w-2xl
            rounded-xl
            p-6
          "
          >

            <div
              className="
              flex
              justify-between
              items-center
              mb-6
            "
            >
              <h2 className="text-2xl font-bold">
                {editingResource
                  ? "Edit Resource"
                  : "Add Resource"}
              </h2>

              <button
                onClick={() =>
                  setShowModal(false)
                }
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <input
                type="text"
                name="title"
                placeholder="Resource Title"
                value={formData.title}
                onChange={handleChange}
                className="
                w-full
                border
                rounded-lg
                p-3
              "
                required
              />

              <input
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
                className="
                w-full
                border
                rounded-lg
                p-3
              "
                required
              />

              <textarea
                rows="4"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="
                w-full
                border
                rounded-lg
                p-3
              "
                required
              />

              <input
                type="url"
                name="link"
                placeholder="Resource Link"
                value={formData.link}
                onChange={handleChange}
                className="
                w-full
                border
                rounded-lg
                p-3
              "
                required
              />

              <button
                type="submit"
                className="
                bg-blue-600
                text-white
                px-5
                py-3
                rounded-lg
                hover:bg-blue-700
              "
              >
                {editingResource
                  ? "Update Resource"
                  : "Add Resource"}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default ManageResources;