import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {

  const { user } = useSelector(
    (state) => state.auth
  );

  const token = localStorage.getItem("token");

  if (!user && !token) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;