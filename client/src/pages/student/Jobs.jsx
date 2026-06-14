import { useEffect, useState } from "react";

import JobCard from "../../components/jobs/JobCard";
import JobFilter from "../../components/jobs/JobFilter";
import Loader from "../../components/common/Loader";

function Jobs() {
  const [jobs, setJobs] = useState([]);

  const [filteredJobs, setFilteredJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      // Replace with API later
      const dummyJobs = [
        {
          id: 1,
          title: "React Developer",
          company: "Google",
          location: "Pune",
          jobType: "Full Time",
          skillsRequired: [
            "React",
            "JavaScript",
            "Redux",
          ],
          description:
            "Looking for a React Developer with strong frontend skills.",
          createdAt: "2 days ago",
        },
        {
          id: 2,
          title: "MERN Stack Developer",
          company: "Infosys",
          location: "Bangalore",
          jobType: "Internship",
          skillsRequired: [
            "MongoDB",
            "Express",
            "React",
            "Node.js",
          ],
          description:
            "MERN internship opportunity for freshers.",
          createdAt: "1 day ago",
        },
        {
          id: 3,
          title: "Frontend Developer",
          company: "TCS",
          location: "Mumbai",
          jobType: "Remote",
          skillsRequired: [
            "HTML",
            "CSS",
            "JavaScript",
          ],
          description:
            "Frontend Developer role with remote work option.",
          createdAt: "Today",
        },
      ];

      setJobs(dummyJobs);
      setFilteredJobs(dummyJobs);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters) => {
    let result = [...jobs];

    // Search Title
    if (filters.search) {
      result = result.filter((job) =>
        job.title
          .toLowerCase()
          .includes(
            filters.search.toLowerCase()
          )
      );
    }

    // Location
    if (filters.location) {
      result = result.filter((job) =>
        job.location
          .toLowerCase()
          .includes(
            filters.location.toLowerCase()
          )
      );
    }

    // Job Type
    if (filters.jobType) {
      result = result.filter(
        (job) =>
          job.jobType === filters.jobType
      );
    }

    setFilteredJobs(result);
  };

  const handleSaveJob = (jobId) => {
    console.log("Saved Job:", jobId);

    alert("Job Saved Successfully");
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6">

      {/* Page Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Find Jobs
        </h1>

        <p className="text-gray-600 mt-2">
          Explore internships and fresher
          opportunities.
        </p>

      </div>

      {/* Filter Component */}
      <JobFilter
        onFilter={handleFilter}
      />

      {/* Job Count */}
      <div className="mb-6">

        <p className="text-gray-600">
          {filteredJobs.length} Jobs Found
        </p>

      </div>

      {/* Jobs Grid */}
      {filteredJobs.length > 0 ? (
        <div
          className="
          grid
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
        >
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSaveJob={handleSaveJob}
            />
          ))}
        </div>
      ) : (
        <div
          className="
          bg-white
          rounded-xl
          shadow
          p-8
          text-center
        "
        >
          <h2 className="text-xl font-semibold">
            No Jobs Found
          </h2>

          <p className="text-gray-500 mt-2">
            Try changing your filters.
          </p>
        </div>
      )}

    </div>
  );
}

export default Jobs;