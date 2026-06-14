import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  FaMapMarkerAlt,
  FaBuilding,
  FaBriefcase,
  FaMoneyBillWave,
  FaBookmark,
} from "react-icons/fa";

import Loader from "../../components/common/Loader";

function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);

      // Replace with API call later
      const dummyJob = {
        id,
        title: "MERN Stack Developer",
        company: "Infosys",
        location: "Pune",
        jobType: "Full Time",
        salary: "₹5 LPA - ₹8 LPA",

        description:
          "We are looking for a passionate MERN Stack Developer who has strong knowledge of React, Node.js, Express, and PostgreSQL. The candidate should be eager to learn and contribute to real-world projects.",

        responsibilities: [
          "Develop frontend using React",
          "Build REST APIs using Node.js",
          "Work with PostgreSQL database",
          "Debug and optimize applications",
        ],

        requirements: [
          "React.js",
          "Node.js",
          "Express.js",
          "PostgreSQL",
          "JavaScript",
          "Git",
        ],

        createdAt: "2 days ago",
      };

      setJob(dummyJob);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = () => {
    alert("Job Saved Successfully");
  };

  const handleApply = () => {
    alert("Application Submitted Successfully");
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* Job Header */}
      <div className="bg-white shadow rounded-xl p-8">

        <h1 className="text-4xl font-bold">
          {job.title}
        </h1>

        <div className="flex flex-wrap gap-6 mt-6 text-gray-600">

          <div className="flex items-center gap-2">
            <FaBuilding />
            <span>{job.company}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaMapMarkerAlt />
            <span>{job.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaBriefcase />
            <span>{job.jobType}</span>
          </div>

          <div className="flex items-center gap-2">
            <FaMoneyBillWave />
            <span>{job.salary}</span>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8">

          <button
            onClick={handleApply}
            className="
              bg-green-600
              text-white
              px-6
              py-3
              rounded-lg
              hover:bg-green-700
            "
          >
            Apply Now
          </button>

          <button
            onClick={handleSaveJob}
            className="
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-lg
              hover:bg-blue-700
              flex
              items-center
              gap-2
            "
          >
            <FaBookmark />
            Save Job
          </button>

        </div>

      </div>

      {/* Job Description */}
      <div className="bg-white shadow rounded-xl p-8 mt-6">

        <h2 className="text-2xl font-semibold mb-4">
          Job Description
        </h2>

        <p className="text-gray-700 leading-8">
          {job.description}
        </p>

      </div>

      {/* Responsibilities */}
      <div className="bg-white shadow rounded-xl p-8 mt-6">

        <h2 className="text-2xl font-semibold mb-4">
          Responsibilities
        </h2>

        <ul className="list-disc ml-6 space-y-3">
          {job.responsibilities.map(
            (item, index) => (
              <li key={index}>
                {item}
              </li>
            )
          )}
        </ul>

      </div>

      {/* Required Skills */}
      <div className="bg-white shadow rounded-xl p-8 mt-6">

        <h2 className="text-2xl font-semibold mb-4">
          Required Skills
        </h2>

        <div className="flex flex-wrap gap-3">

          {job.requirements.map(
            (skill, index) => (
              <span
                key={index}
                className="
                  bg-blue-100
                  text-blue-700
                  px-4
                  py-2
                  rounded-full
                  font-medium
                "
              >
                {skill}
              </span>
            )
          )}

        </div>

      </div>

      {/* Company Section */}
      <div className="bg-white shadow rounded-xl p-8 mt-6">

        <h2 className="text-2xl font-semibold mb-4">
          Company Information
        </h2>

        <p className="text-gray-700 leading-7">
          {job.company} is actively hiring
          talented freshers and developers
          who are passionate about modern
          web technologies and software
          development.
        </p>

      </div>

      {/* Job Meta */}
      <div className="bg-white shadow rounded-xl p-8 mt-6">

        <div className="flex justify-between">

          <div>
            <h3 className="font-semibold">
              Posted
            </h3>

            <p className="text-gray-600">
              {job.createdAt}
            </p>
          </div>

          <div>
            <h3 className="font-semibold">
              Job Type
            </h3>

            <p className="text-gray-600">
              {job.jobType}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default JobDetails;