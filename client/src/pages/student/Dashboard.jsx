import { useNavigate } from "react-router-dom";

import {
  FaBriefcase,
  FaBookmark,
  FaFileAlt,
  FaRobot,
} from "react-icons/fa";

import DashboardCard from "../../components/dashboard/DashboardCard";

function Dashboard() {
  const navigate = useNavigate();

  // Temporary data
  const dashboardStats = {
    appliedJobs: 12,
    savedJobs: 8,
    resumeScore: 85,
    interviews: 5,
  };

  const recentJobs = [
    {
      id: 1,
      title: "React Developer",
      company: "Google",
      location: "Pune",
    },
    {
      id: 2,
      title: "MERN Stack Developer",
      company: "Infosys",
      location: "Bangalore",
    },
    {
      id: 3,
      title: "Frontend Developer",
      company: "TCS",
      location: "Mumbai",
    },
  ];

  return (
    <div className="p-6">

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Student Dashboard
        </h1>

        <p className="text-gray-600 mt-2">
          Welcome back! Track your learning,
          jobs, and AI activities here.
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        <DashboardCard
          title="Applied Jobs"
          value={dashboardStats.appliedJobs}
          icon={<FaBriefcase />}
          bgColor="bg-blue-600"
          onClick={() => navigate("/jobs")}
        />

        <DashboardCard
          title="Saved Jobs"
          value={dashboardStats.savedJobs}
          icon={<FaBookmark />}
          bgColor="bg-green-600"
          onClick={() => navigate("/saved-jobs")}
        />

        <DashboardCard
          title="Resume Score"
          value={`${dashboardStats.resumeScore}%`}
          icon={<FaFileAlt />}
          bgColor="bg-yellow-500"
          onClick={() =>
            navigate("/resume-analyzer")
          }
        />

        <DashboardCard
          title="Mock Interviews"
          value={dashboardStats.interviews}
          icon={<FaRobot />}
          bgColor="bg-purple-600"
          onClick={() =>
            navigate("/mock-interview")
          }
        />

      </div>

      {/* Main Dashboard Content */}
      <div className="grid lg:grid-cols-3 gap-6 mt-10">

        {/* Recent Jobs */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-xl font-semibold">
              Recent Jobs
            </h2>

            <button
              onClick={() => navigate("/jobs")}
              className="text-blue-600 font-medium"
            >
              View All
            </button>

          </div>

          <div className="space-y-4">

            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="
                border
                rounded-lg
                p-4
                hover:bg-gray-50
                cursor-pointer
              "
                onClick={() =>
                  navigate(`/jobs/${job.id}`)
                }
              >
                <h3 className="font-semibold">
                  {job.title}
                </h3>

                <p className="text-gray-600">
                  {job.company}
                </p>

                <p className="text-sm text-gray-500">
                  {job.location}
                </p>
              </div>
            ))}

          </div>

        </div>

        {/* AI Progress */}
        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold mb-4">
            AI Career Progress
          </h2>

          <div className="space-y-5">

            <div>
              <div className="flex justify-between mb-2">
                <span>Resume Strength</span>
                <span>85%</span>
              </div>

              <div className="bg-gray-200 h-3 rounded-full">
                <div
                  className="
                  bg-green-500
                  h-3
                  rounded-full
                "
                  style={{ width: "85%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Interview Readiness</span>
                <span>70%</span>
              </div>

              <div className="bg-gray-200 h-3 rounded-full">
                <div
                  className="
                  bg-blue-500
                  h-3
                  rounded-full
                "
                  style={{ width: "70%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Roadmap Completion</span>
                <span>45%</span>
              </div>

              <div className="bg-gray-200 h-3 rounded-full">
                <div
                  className="
                  bg-purple-500
                  h-3
                  rounded-full
                "
                  style={{ width: "45%" }}
                />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">

        <h2 className="text-xl font-semibold mb-5">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

          <button
            onClick={() =>
              navigate("/resume-analyzer")
            }
            className="
            bg-blue-600
            text-white
            p-4
            rounded-lg
            hover:bg-blue-700
          "
          >
            Analyze Resume
          </button>

          <button
            onClick={() =>
              navigate("/roadmap-generator")
            }
            className="
            bg-green-600
            text-white
            p-4
            rounded-lg
            hover:bg-green-700
          "
          >
            Generate Roadmap
          </button>

          <button
            onClick={() =>
              navigate("/mock-interview")
            }
            className="
            bg-purple-600
            text-white
            p-4
            rounded-lg
            hover:bg-purple-700
          "
          >
            Mock Interview
          </button>

          <button
            onClick={() =>
              navigate("/jobs")
            }
            className="
            bg-orange-500
            text-white
            p-4
            rounded-lg
            hover:bg-orange-600
          "
          >
            Find Jobs
          </button>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;