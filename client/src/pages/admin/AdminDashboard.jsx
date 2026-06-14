import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUsers,
  FaBriefcase,
  FaBook,
  FaFileAlt,
  FaArrowUp,
} from "react-icons/fa";

import DashboardCard from "../../components/dashboard/DashboardCard";
import Loader from "../../components/common/Loader";

function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalResources: 0,
    totalApplications: 0,
  });

  const [recentActivities, setRecentActivities] =
    useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Replace with API call later

      const dashboardData = {
        totalUsers: 245,
        totalJobs: 58,
        totalResources: 132,
        totalApplications: 489,
      };

      const activities = [
        {
          id: 1,
          activity:
            "New user registered on platform",
          time: "10 mins ago",
        },
        {
          id: 2,
          activity:
            "Admin added a new MERN Developer job",
          time: "30 mins ago",
        },
        {
          id: 3,
          activity:
            "New resource uploaded for React",
          time: "1 hour ago",
        },
        {
          id: 4,
          activity:
            "Student applied for Frontend Developer role",
          time: "2 hours ago",
        },
      ];

      setStats(dashboardData);
      setRecentActivities(activities);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="text-gray-600 mt-2">
          Manage jobs, resources, users,
          and monitor platform activity.
        </p>

      </div>

      {/* Statistics Cards */}
      <div
        className="
        grid
        md:grid-cols-2
        lg:grid-cols-4
        gap-6
      "
      >

        <DashboardCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FaUsers />}
          bgColor="bg-blue-600"
        />

        <DashboardCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={<FaBriefcase />}
          bgColor="bg-green-600"
        />

        <DashboardCard
          title="Resources"
          value={stats.totalResources}
          icon={<FaBook />}
          bgColor="bg-purple-600"
        />

        <DashboardCard
          title="Applications"
          value={stats.totalApplications}
          icon={<FaFileAlt />}
          bgColor="bg-orange-500"
        />

      </div>

      {/* Quick Actions */}
      <div
        className="
        bg-white
        rounded-xl
        shadow
        p-6
        mt-8
      "
      >

        <h2 className="text-xl font-semibold mb-5">
          Quick Actions
        </h2>

        <div
          className="
          grid
          md:grid-cols-2
          lg:grid-cols-4
          gap-4
        "
        >

          <button
            onClick={() =>
              navigate("/admin/jobs")
            }
            className="
            bg-blue-600
            text-white
            p-4
            rounded-lg
            hover:bg-blue-700
          "
          >
            Manage Jobs
          </button>

          <button
            onClick={() =>
              navigate("/admin/resources")
            }
            className="
            bg-green-600
            text-white
            p-4
            rounded-lg
            hover:bg-green-700
          "
          >
            Manage Resources
          </button>

          <button
            onClick={() =>
              navigate("/admin/users")
            }
            className="
            bg-purple-600
            text-white
            p-4
            rounded-lg
            hover:bg-purple-700
          "
          >
            Manage Users
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
            View Platform
          </button>

        </div>

      </div>

      {/* Main Content */}
      <div
        className="
        grid
        lg:grid-cols-3
        gap-6
        mt-8
      "
      >

        {/* Recent Activities */}
        <div
          className="
          lg:col-span-2
          bg-white
          rounded-xl
          shadow
          p-6
        "
        >

          <h2 className="text-xl font-semibold mb-5">
            Recent Activities
          </h2>

          <div className="space-y-4">

            {recentActivities.map(
              (item) => (
                <div
                  key={item.id}
                  className="
                  border-b
                  pb-4
                "
                >
                  <p className="font-medium">
                    {item.activity}
                  </p>

                  <p className="text-sm text-gray-500">
                    {item.time}
                  </p>
                </div>
              )
            )}

          </div>

        </div>

        {/* Platform Growth */}
        <div
          className="
          bg-white
          rounded-xl
          shadow
          p-6
        "
        >

          <h2 className="text-xl font-semibold mb-5">
            Platform Growth
          </h2>

          <div className="space-y-6">

            <div>

              <div className="flex justify-between mb-2">

                <span>Users Growth</span>

                <span className="flex items-center gap-1 text-green-600">
                  <FaArrowUp />
                  12%
                </span>

              </div>

              <div className="bg-gray-200 rounded-full h-3">

                <div
                  className="
                  bg-blue-600
                  h-3
                  rounded-full
                "
                  style={{
                    width: "80%",
                  }}
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>Job Posts</span>

                <span className="flex items-center gap-1 text-green-600">
                  <FaArrowUp />
                  18%
                </span>

              </div>

              <div className="bg-gray-200 rounded-full h-3">

                <div
                  className="
                  bg-green-600
                  h-3
                  rounded-full
                "
                  style={{
                    width: "70%",
                  }}
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <span>Applications</span>

                <span className="flex items-center gap-1 text-green-600">
                  <FaArrowUp />
                  25%
                </span>

              </div>

              <div className="bg-gray-200 rounded-full h-3">

                <div
                  className="
                  bg-orange-500
                  h-3
                  rounded-full
                "
                  style={{
                    width: "90%",
                  }}
                />

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Summary Section */}
      <div
        className="
        bg-white
        rounded-xl
        shadow
        p-6
        mt-8
      "
      >

        <h2 className="text-xl font-semibold mb-4">
          Platform Summary
        </h2>

        <p className="text-gray-700 leading-7">
          CareerLaunch AI currently has{" "}
          <strong>{stats.totalUsers}</strong>
          {" "}registered users,
          <strong> {stats.totalJobs}</strong>
          {" "}active jobs,
          <strong> {stats.totalResources}</strong>
          {" "}learning resources, and
          <strong> {stats.totalApplications}</strong>
          {" "}job applications submitted
          through the platform.
        </p>

      </div>

    </div>
  );
}

export default AdminDashboard;