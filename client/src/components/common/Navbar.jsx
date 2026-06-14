import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem("token");

    dispatch({
      type: "auth/logout",
    });

    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <Link
          to="/"
          className="text-2xl font-bold"
        >
          CareerLaunch AI
        </Link>

        <div className="flex items-center gap-6">

          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-yellow-300"
                : ""
            }
          >
            Jobs
          </NavLink>

          <NavLink
            to="/resources"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-yellow-300"
                : ""
            }
          >
            Resources
          </NavLink>

          <NavLink
            to="/resume-analyzer"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-yellow-300"
                : ""
            }
          >
            Resume AI
          </NavLink>

          <NavLink
            to="/roadmap-generator"
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-yellow-300"
                : ""
            }
          >
            Roadmaps
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "font-semibold text-yellow-300"
                    : ""
                }
              >
                Dashboard
              </NavLink>

              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-green-500 px-4 py-2 rounded"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-yellow-500 px-4 py-2 rounded"
              >
                Register
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;