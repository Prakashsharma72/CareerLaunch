import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";

// Auth Hook
import useAuth from "./hooks/useAuth";

// Pages - Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Pages - Public / Main
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Pages - Student
import Dashboard from "./pages/student/Dashboard";
import Profile from "./pages/student/Profile";
import Jobs from "./pages/student/Jobs";
import JobDetails from "./pages/student/JobDetails";
import Resources from "./pages/student/Resources";
import SavedJobs from "./pages/student/SavedJobs";
import ResumeAnalyzer from "./pages/student/ResumeAnalyzer";
import RoadmapGenerator from "./pages/student/RoadmapGenerator";
import MockInterview from "./pages/student/MockInterview";

// Pages - Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageJobs from "./pages/admin/ManageJobs";
import ManageResources from "./pages/admin/ManageResources";
import ManageUsers from "./pages/admin/ManageUsers";

/**
 * Protected Route Wrapper
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Role-based Route (basic structure for future scaling)
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* ================= PUBLIC AUTH ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= MAIN LAYOUT ================= */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
      </Route>

      {/* ================= STUDENT DASHBOARD ================= */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/:id" element={<JobDetails />} />
        <Route path="resources" element={<Resources />} />
        <Route path="saved-jobs" element={<SavedJobs />} />
        <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
        <Route path="roadmap" element={<RoadmapGenerator />} />
        <Route path="mock-interview" element={<MockInterview />} />
      </Route>

      {/* ================= ADMIN DASHBOARD ================= */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="resources" element={<ManageResources />} />
        <Route path="users" element={<ManageUsers />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;