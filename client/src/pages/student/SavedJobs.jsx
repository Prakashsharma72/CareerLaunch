import { useEffect, useState } from "react";

import JobCard from "../../components/jobs/JobCard";
import Loader from "../../components/common/Loader";

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);

      // Replace with API later
      const dummySavedJobs = [
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
      ];

      setSavedJobs(dummySavedJobs);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSavedJob = (jobId) => {
    const updatedJobs = savedJobs.filter(
      (job) => job.id !== jobId
    );

    setSavedJobs(updatedJobs);

    alert("Job removed from saved jobs");
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Saved Jobs
        </h1>

        <p className="text-gray-600 mt-2">
          Manage jobs you bookmarked for later.
        </p>

      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow p-5 mb-8">

        <h2 className="text-xl font-semibold">
          Total Saved Jobs
        </h2>

        <p className="text-3xl font-bold text-blue-600 mt-2">
          {savedJobs.length}
        </p>

      </div>

      {/* Saved Jobs List */}
      {savedJobs.length > 0 ? (
        <div
          className="
          grid
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
        >
          {savedJobs.map((job) => (
            <div
              key={job.id}
              className="relative"
            >
              <JobCard
                job={job}
                onSaveJob={() =>
                  handleRemoveSavedJob(job.id)
                }
              />

              <button
                onClick={() =>
                  handleRemoveSavedJob(job.id)
                }
                className="
                absolute
                top-4
                right-4
                bg-red-500
                text-white
                px-3
                py-1
                rounded-lg
                hover:bg-red-600
              "
              >
                Remove
              </button>
            </div>
          ))}
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
          <h2 className="text-2xl font-semibold">
            No Saved Jobs
          </h2>

          <p className="text-gray-500 mt-3">
            Save jobs from the Jobs page
            to view them here later.
          </p>
        </div>
      )}

    </div>
  );
}

export default SavedJobs;