import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaBuilding,
  FaBriefcase,
} from "react-icons/fa";

function JobCard({ job, onSaveJob }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {job.title}
          </h2>

          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <FaBuilding />
            <span>{job.company}</span>
          </div>
        </div>

        <button
          onClick={() => onSaveJob(job.id)}
          className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-200"
        >
          Save
        </button>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mt-4 text-gray-600">
        <FaMapMarkerAlt />
        <span>{job.location}</span>
      </div>

      {/* Job Type */}
      <div className="flex items-center gap-2 mt-2 text-gray-600">
        <FaBriefcase />
        <span>{job.jobType}</span>
      </div>

      {/* Skills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {job.skillsRequired?.map((skill) => (
          <span
            key={skill}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="mt-4 text-gray-600 line-clamp-3">
        {job.description}
      </p>

      {/* Footer */}
      <div className="mt-6 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Posted: {job.createdAt}
        </span>

        <Link
          to={`/jobs/${job.id}`}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default JobCard;