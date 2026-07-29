import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUsers,
  FaBriefcase,
  FaBook,
  FaFileAlt,
  FaArrowUp,
  FaRegClock,
  FaPlusCircle,
  FaUsersCog,
  FaExternalLinkAlt,
  FaChartLine,
  FaHistory
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

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Simulated API call delay to show loader
      await new Promise(resolve => setTimeout(resolve, 600));

      const dashboardData = {
        totalUsers: 245,
        totalJobs: 58,
        totalResources: 132,
        totalApplications: 489,
      };

      const activities = [
        {
          id: 1,
          activity: "New user registered on platform",
          time: "10 mins ago",
          type: "user"
        },
        {
          id: 2,
          activity: "Admin added a new MERN Developer job",
          time: "30 mins ago",
          type: "job"
        },
        {
          id: 3,
          activity: "New resource uploaded for React",
          time: "1 hour ago",
          type: "resource"
        },
        {
          id: 4,
          activity: "Student applied for Frontend Developer role",
          time: "2 hours ago",
          type: "application"
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
    <div className="p-4 md:p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-neutral-500 mt-2 text-sm md:text-base">
            Manage jobs, resources, users, and monitor platform activity.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FaUsers />}
          bgColor="from-primary-500 to-primary-700"
          onClick={() => navigate("/admin/users")}
        />
        <DashboardCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={<FaBriefcase />}
          bgColor="from-success-500 to-success-700"
          onClick={() => navigate("/admin/jobs")}
        />
        <DashboardCard
          title="Resources"
          value={stats.totalResources}
          icon={<FaBook />}
          bgColor="from-accent-500 to-accent-700"
          onClick={() => navigate("/admin/resources")}
        />
        <DashboardCard
          title="Applications"
          value={stats.totalApplications}
          icon={<FaFileAlt />}
          bgColor="from-warning-400 to-warning-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-light-md p-6 lg:p-8 animate-slide-up border border-neutral-100" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
            <FaPlusCircle className="text-xl" />
          </div>
          <h2 className="text-xl font-bold text-neutral-800">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/admin/jobs")}
            className="flex items-center justify-center gap-2 bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white p-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-light-md hover:-translate-y-1 group"
          >
            <FaBriefcase className="group-hover:scale-110 transition-transform" />
            Manage Jobs
          </button>
          <button
            onClick={() => navigate("/admin/resources")}
            className="flex items-center justify-center gap-2 bg-success-50 text-success-700 hover:bg-success-600 hover:text-white p-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-light-md hover:-translate-y-1 group"
          >
            <FaBook className="group-hover:scale-110 transition-transform" />
            Manage Resources
          </button>
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center justify-center gap-2 bg-accent-50 text-accent-700 hover:bg-accent-600 hover:text-white p-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-light-md hover:-translate-y-1 group"
          >
            <FaUsersCog className="group-hover:scale-110 transition-transform" />
            Manage Users
          </button>
          <button
            onClick={() => navigate("/jobs")}
            className="flex items-center justify-center gap-2 bg-neutral-50 text-neutral-700 hover:bg-neutral-800 hover:text-white p-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-light-md hover:-translate-y-1 group border border-neutral-200 hover:border-transparent"
          >
            <FaExternalLinkAlt className="group-hover:scale-110 transition-transform text-sm" />
            View Platform
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-light-md p-6 lg:p-8 border border-neutral-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-50 text-accent-600 rounded-lg">
                <FaHistory className="text-xl" />
              </div>
              <h2 className="text-xl font-bold text-neutral-800">Recent Activities</h2>
            </div>
            <button className="text-sm text-primary-600 font-medium hover:text-primary-800 transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-1">
            {recentActivities.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors group"
              >
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  item.type === 'user' ? 'bg-primary-500' :
                  item.type === 'job' ? 'bg-success-500' :
                  item.type === 'resource' ? 'bg-accent-500' : 'bg-warning-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-neutral-800 group-hover:text-primary-700 transition-colors">
                    {item.activity}
                  </p>
                  <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                    <FaRegClock className="text-xs" /> {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Growth */}
        <div className="bg-white rounded-2xl shadow-light-md p-6 lg:p-8 border border-neutral-100 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-success-50 text-success-600 rounded-lg">
              <FaChartLine className="text-xl" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800">Growth Stats</h2>
          </div>

          <div className="space-y-8 flex-1 flex flex-col justify-center">
            {/* Stat 1 */}
            <div className="group">
              <div className="flex justify-between mb-2 items-center">
                <span className="font-medium text-neutral-700">Users Growth</span>
                <span className="flex items-center gap-1 text-sm font-bold text-success-600 bg-success-50 px-2 py-1 rounded-md">
                  <FaArrowUp className="text-xs" /> 12%
                </span>
              </div>
              <div className="bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary-500 h-2.5 rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                  style={{ width: "80%" }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse-gentle"></div>
                </div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="group">
              <div className="flex justify-between mb-2 items-center">
                <span className="font-medium text-neutral-700">Job Posts</span>
                <span className="flex items-center gap-1 text-sm font-bold text-success-600 bg-success-50 px-2 py-1 rounded-md">
                  <FaArrowUp className="text-xs" /> 18%
                </span>
              </div>
              <div className="bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-success-500 h-2.5 rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                  style={{ width: "70%" }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse-gentle"></div>
                </div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="group">
              <div className="flex justify-between mb-2 items-center">
                <span className="font-medium text-neutral-700">Applications</span>
                <span className="flex items-center gap-1 text-sm font-bold text-success-600 bg-success-50 px-2 py-1 rounded-md">
                  <FaArrowUp className="text-xs" /> 25%
                </span>
              </div>
              <div className="bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-warning-500 h-2.5 rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                  style={{ width: "90%" }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse-gentle"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-linear-to-r from-primary-50 to-accent-50 rounded-2xl shadow-light-sm p-6 md:p-8 border border-primary-100 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-lg md:text-xl font-bold text-neutral-800 mb-3">Platform Summary</h2>
        <p className="text-neutral-600 leading-relaxed text-sm md:text-base">
          CareerLaunch AI is currently serving <strong className="text-primary-700">{stats.totalUsers}</strong> registered users, with <strong className="text-success-700">{stats.totalJobs}</strong> active job postings and <strong className="text-accent-700">{stats.totalResources}</strong> learning resources. A total of <strong className="text-warning-600">{stats.totalApplications}</strong> applications have been processed, reflecting steady platform engagement.
        </p>
      </div>
    </div>
  );
}

export default AdminDashboard;