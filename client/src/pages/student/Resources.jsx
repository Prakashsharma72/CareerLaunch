import { useEffect, useState } from "react";

import ResourceCard from "../../components/resources/ResourceCard";
import Loader from "../../components/common/Loader";

function Resources() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

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
    <div className="p-6">

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Learning Resources
        </h1>

        <p className="text-gray-600 mt-2">
          Explore tutorials, roadmaps,
          interview guides, and study
          materials.
        </p>

      </div>

      {/* Search & Filter */}
      <div
        className="
        bg-white
        rounded-xl
        shadow
        p-5
        mb-8
      "
      >
        <div
          className="
          grid
          md:grid-cols-2
          gap-4
        "
        >
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={
              handleSearchChange
            }
            className="
            border
            rounded-lg
            p-3
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "
          />

          <select
            value={category}
            onChange={
              handleCategoryChange
            }
            className="
            border
            rounded-lg
            p-3
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
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

            <option value="Database">
              Database
            </option>

            <option value="DSA">
              DSA
            </option>
          </select>
        </div>
      </div>

      {/* Resource Count */}
      <div className="mb-5">
        <p className="text-gray-600">
          {filteredResources.length}
          {" "}Resources Found
        </p>
      </div>

      {/* Resources Grid */}
      {filteredResources.length >
      0 ? (
        <div
          className="
          grid
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
        >
          {filteredResources.map(
            (resource) => (
              <ResourceCard
                key={resource.id}
                resource={
                  resource
                }
                onBookmark={
                  handleBookmark
                }
              />
            )
          )}
        </div>
      ) : (
        <div
          className="
          bg-white
          rounded-xl
          shadow
          p-10
          text-center
        "
        >
          <h2 className="text-xl font-semibold">
            No Resources Found
          </h2>

          <p className="text-gray-500 mt-2">
            Try another keyword or
            category.
          </p>
        </div>
      )}
    </div>
  );
}

export default Resources;