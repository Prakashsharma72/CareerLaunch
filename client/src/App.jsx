import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ── Layouts (eager – shared shells, always needed) ──────────────────────────
import MainLayout      from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout     from "./layouts/AdminLayout";

// ── Auth pages (eager – entry points, minimal weight) ───────────────────────
import Login         from "./pages/auth/Login";
import Register      from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword  from "./pages/auth/ResetPassword";

// ── Public pages ─────────────────────────────────────────────────────────────
// Home is the landing page and loads on every first visit → keep eager
import Home     from "./pages/Home";
const  NotFound = lazy(() => import("./pages/NotFound"));

// ── Student pages (lazy – only loaded when user navigates there) ──────────────
const Dashboard        = lazy(() => import("./pages/student/Dashboard"));
const Profile          = lazy(() => import("./pages/student/Profile"));
const Jobs             = lazy(() => import("./pages/student/Jobs"));
const JobDetails       = lazy(() => import("./pages/student/JobDetails"));
const Resources        = lazy(() => import("./pages/student/Resources"));
const SavedJobs        = lazy(() => import("./pages/student/SavedJobs"));
const RoadmapGenerator = lazy(() => import("./pages/student/RoadmapGenerator"));
const MockInterview    = lazy(() => import("./pages/student/MockInterview"));
const CompanySearch    = lazy(() => import("./pages/student/CompanySearch"));
const CompanyDetails   = lazy(() => import("./pages/student/CompanyDetails"));
const SavedCompanies   = lazy(() => import("./pages/student/SavedCompanies"));

// ── Admin pages (lazy – role-gated, rarely visited by most users) ─────────────
const AdminDashboard  = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageJobs      = lazy(() => import("./pages/admin/ManageJobs"));
const ManageResources = lazy(() => import("./pages/admin/ManageResources"));
const ManageUsers     = lazy(() => import("./pages/admin/ManageUsers"));
const ManageRoadmaps  = lazy(() => import("./pages/admin/ManageRoadmaps"));
const AdminSettings   = lazy(() => import("./pages/admin/AdminSettings"));

// ── Route-level loading fallback ─────────────────────────────────────────────
// Lightweight spinner — does not import framer-motion or react-icons
function PageLoader() {
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        minHeight:      "60vh",
      }}
    >
      <div
        style={{
          width:       40,
          height:      40,
          border:      "3px solid rgba(11,165,255,0.2)",
          borderTop:   "3px solid #0ba5ff",
          borderRadius:"50%",
          animation:   "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Route guards ─────────────────────────────────────────────────────────────

/**
 * ProtectedRoute
 * Waits for bootstrapAuth to finish before deciding to redirect.
 * Without this guard, the redirect fires before the token is verified,
 * causing a flash to /login on every page refresh.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, bootstrapping } = useSelector((s) => s.auth);
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
  if (!isAuthenticated)       return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/"      replace />;
  return children;
};

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ── Public auth ── */}
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      {/* ── Public main ── */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
      </Route>

      {/* ── Student dashboard (protected) ── */}
      <Route
        path="/student"
        element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
      >
        <Route path="dashboard"          element={<Dashboard />} />
        <Route path="profile"            element={<Profile />} />
        <Route path="jobs"               element={<Jobs />} />
        <Route path="jobs/:id"           element={<JobDetails />} />
        <Route path="resources"          element={<Resources />} />
        <Route path="saved-jobs"         element={<SavedJobs />} />
        <Route path="roadmap-generator"  element={<RoadmapGenerator />} />
        <Route path="mock-interview"     element={<MockInterview />} />
        <Route path="companies"          element={<CompanySearch />} />
        <Route path="companies/:placeId" element={<CompanyDetails />} />
        <Route path="saved-companies"    element={<SavedCompanies />} />
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
        <Route path="roadmaps"  element={<ManageRoadmaps />} />
        <Route path="settings"  element={<AdminSettings />} />
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default App;
