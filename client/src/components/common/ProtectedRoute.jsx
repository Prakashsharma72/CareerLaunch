import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  const { user, bootstrapping } = useSelector((state) => state.auth);
  const token = localStorage.getItem("token");

  // Still verifying token on app start — don't redirect yet
  if (bootstrapping) return null;

  if (!user && !token) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;