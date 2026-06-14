import { useState } from "react";

function JobFilter({ onFilter }) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");

  const handleFilter = () => {
    onFilter({
      search,
      location,
      jobType,
    });
  };

  const handleReset = () => {
    setSearch("");
    setLocation("");
    setJobType("");

    onFilter({
      search: "",
      location: "",
      jobType: "",
    });
  };

  return (
    <div className="bg-white shadow rounded-xl p-5 mb-6">

      <h2 className="text-lg font-semibold mb-4">
        Search Jobs
      </h2>

      <div className="grid md:grid-cols-4 gap-4">

        {/* Search */}
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="border rounded-lg px-4 py-2"
        />

        {/* Location */}
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
          className="border rounded-lg px-4 py-2"
        />

        {/* Job Type */}
        <select
          value={jobType}
          onChange={(e) =>
            setJobType(e.target.value)
          }
          className="border rounded-lg px-4 py-2"
        >
          <option value="">
            All Types
          </option>

          <option value="Full Time">
            Full Time
          </option>

          <option value="Part Time">
            Part Time
          </option>

          <option value="Internship">
            Internship
          </option>

          <option value="Remote">
            Remote
          </option>
        </select>

        {/* Buttons */}
        <div className="flex gap-2">

          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Search
          </button>

          <button
            onClick={handleReset}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Reset
          </button>

        </div>

      </div>
    </div>
  );
}

export default JobFilter;