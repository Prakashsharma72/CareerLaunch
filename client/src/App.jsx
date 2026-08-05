import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Layouts
import MainLayout    from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout   from "./layouts/AdminLayout";

// Pages - Auth
import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Pages - Public
import Home     from "./pages/Home";
import NotFound from "./pages/NotFound";

// Pages - Student
import Dashboard        from "./pages/student/Dashboard";
import Profile          from "./pages/student/Profile";
import Jobs             from "./pages/student/Jobs";
import JobDetails       from "./pages/student/JobDetails";
import Resources        from "./pages/student/Resources";
import SavedJobs        from "./pages/student/SavedJobs";
import ResumeAnalyzer   from "./pages/student/ResumeAnalyzer";
import RoadmapGenerator from "./pages/student/RoadmapGenerator";
import MockInterview    from "./pages/student/MockInterview";
import CompanySearch    from "./pages/student/CompanySearch";
import CompanyDetails   from "./pages/student/CompanyDetails";
import SavedCompanies   from "./pages/student/SavedCompanies";

// Pages - Admin
import AdminDashboard  from "./pages/admin/AdminDashboard";
import ManageJobs      from "./pages/admin/ManageJobs";
import ManageResources from "./pages/admin/ManageResources";
import ManageUsers     from "./pages/admin/ManageUsers";

/**
 * ProtectedRoute
 * Waits for bootstrapAuth to finish before deciding to redirect.
 * Without this guard, the redirect fires before the token is verified,
 * causing a flash to /login on every page refresh.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, bootstrapping } = useSelector((s) => s.auth);

  // Still checking localStorage / verifying token — don't redirect yet
  if (bootstrapping) return null;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * AdminRoute
 * Same pattern; additionally checks role === "admin".
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, bootstrapping, user } = useSelector((s) => s.auth);

  if (bootstrapping) return null;

  if (!isAuthenticated)       return <Navigate to="/login"  replace />;
  if (user?.role !== "admin") return <Navigate to="/"       replace />;
  return children;
};

const App = () => (
  <Routes>
    {/* ── Public auth ── */}
    <Route path="/login"    element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* ── Public main ── */}
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Home />} />
    </Route>

    {/* ── Student dashboard (protected) ── */}
    <Route
      path="/student"
      element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
    >
      <Route path="dashboard"         element={<Dashboard />} />
      <Route path="profile"           element={<Profile />} />
      <Route path="jobs"              element={<Jobs />} />
      <Route path="jobs/:id"          element={<JobDetails />} />
      <Route path="resources"         element={<Resources />} />
      <Route path="saved-jobs"        element={<SavedJobs />} />
      <Route path="resume-analyzer"   element={<ResumeAnalyzer />} />
      {/* fixed: was "roadmap", now matches DashboardLayout link "/student/roadmap-generator" */}
      <Route path="roadmap-generator" element={<RoadmapGenerator />} />
      <Route path="mock-interview"    element={<MockInterview />} />
      <Route path="companies"         element={<CompanySearch />} />
      <Route path="companies/:placeId" element={<CompanyDetails />} />
      <Route path="saved-companies"   element={<SavedCompanies />} />
    </Route>

    {/* ── Admin dashboard (protected + role-gated) ── */}
    <Route
      path="/admin"
      element={<AdminRoute><AdminLayout /></AdminRoute>}
    >
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="jobs"      element={<ManageJobs />} />
      <Route path="resources" element={<ManageResources />} />
      <Route path="users"     element={<ManageUsers />} />
    </Route>

    {/* ── Fallback ── */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
