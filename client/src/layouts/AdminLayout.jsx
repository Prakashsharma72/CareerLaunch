import { useState } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  FaTachometerAlt,
  FaBriefcase,
  FaBook,
  FaUsers,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserShield,
} from "react-icons/fa";

function AdminLayout() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/admin/dashboard",
    },

    {
      name: "Manage Jobs",
      icon: <FaBriefcase />,
      path: "/admin/jobs",
    },

    {
      name: "Manage Resources",
      icon: <FaBook />,
      path: "/admin/resources",
    },

    {
      name: "Manage Users",
      icon: <FaUsers />,
      path: "/admin/users",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="
          fixed
          inset-0
          bg-black/50
          z-40
          lg:hidden
        "
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed
        top-0
        left-0
        h-full
        w-72
        bg-white
        shadow-lg
        z-50
        transition-transform
        duration-300

        ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }

        lg:translate-x-0
      `}
      >

        {/* Logo */}
        <div
          className="
          flex
          items-center
          justify-between
          p-5
          border-b
        "
        >
          <div>
            <h2
              className="
              text-2xl
              font-bold
              text-indigo-600
            "
            >
              CareerLaunch AI
            </h2>

            <p
              className="
              text-sm
              text-gray-500
            "
            >
              Admin Panel
            </p>
          </div>

          <button
            className="lg:hidden"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">

          <ul className="space-y-2">

            {menuItems.map((item) => (
              <li key={item.path}>

                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    rounded-lg
                    transition

                    ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-gray-100"
                    }
                  `
                  }
                >
                  {item.icon}

                  <span>
                    {item.name}
                  </span>

                </NavLink>

              </li>
            ))}

          </ul>

        </nav>

        {/* Logout */}
        <div
          className="
          absolute
          bottom-0
          left-0
          w-full
          p-4
          border-t
        "
        >
          <button
            onClick={handleLogout}
            className="
            w-full
            flex
            items-center
            justify-center
            gap-3
            bg-red-500
            text-white
            py-3
            rounded-lg
            hover:bg-red-600
            transition
          "
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">

        {/* Header */}
        <header
          className="
          bg-white
          shadow-sm
          px-6
          py-4
          flex
          justify-between
          items-center
        "
        >

          <div className="flex items-center gap-4">

            <button
              className="lg:hidden"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <FaBars size={22} />
            </button>

            <h1
              className="
              text-2xl
              font-bold
            "
            >
              Admin Dashboard
            </h1>

          </div>

          {/* Admin Info */}
          <div
            className="
            flex
            items-center
            gap-3
          "
          >

            <div
              className="
              w-10
              h-10
              rounded-full
              bg-indigo-600
              text-white
              flex
              items-center
              justify-center
            "
            >
              <FaUserShield />
            </div>

            <div>

              <p className="font-semibold">
                Administrator
              </p>

              <p
                className="
                text-sm
                text-gray-500
              "
              >
                System Manager
              </p>

            </div>

          </div>

        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;