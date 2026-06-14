import { useEffect, useState } from "react";

import {
  FaSearch,
  FaTrash,
  FaUserEdit,
  FaEye,
  FaTimes,
} from "react-icons/fa";

import Loader from "../../components/common/Loader";

function ManageUsers() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("All");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Replace with API later

      const dummyUsers = [
        {
          id: 1,
          name: "Prakash Sharma",
          email: "prakash@gmail.com",
          role: "student",
          skills: [
            "React",
            "Node.js",
            "PostgreSQL",
          ],
          joinedAt: "2026-01-10",
        },

        {
          id: 2,
          name: "Admin User",
          email: "admin@gmail.com",
          role: "admin",
          skills: [],
          joinedAt: "2025-12-01",
        },

        {
          id: 3,
          name: "John Doe",
          email: "john@gmail.com",
          role: "student",
          skills: [
            "Java",
            "Spring Boot",
          ],
          joinedAt: "2026-02-15",
        },
      ];

      setUsers(dummyUsers);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (
    userId
  ) => {
    const confirmDelete =
      window.confirm(
        "Delete this user?"
      );

    if (!confirmDelete) return;

    const updatedUsers =
      users.filter(
        (user) =>
          user.id !== userId
      );

    setUsers(updatedUsers);

    alert(
      "User deleted successfully"
    );
  };

  const handleRoleChange = (
    userId,
    newRole
  ) => {
    const updatedUsers =
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              role: newRole,
            }
          : user
      );

    setUsers(updatedUsers);

    alert(
      "User role updated"
    );
  };

  const viewUserDetails = (
    user
  ) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const filteredUsers =
    users.filter((user) => {
      const searchMatch =
        user.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        user.email
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const roleMatch =
        roleFilter === "All"
          ? true
          : user.role === roleFilter;

      return (
        searchMatch &&
        roleMatch
      );
    });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Manage Users
        </h1>

        <p className="text-gray-600 mt-2">
          View users, manage roles,
          and control platform access.
        </p>

      </div>

      {/* Search & Filter */}
      <div
        className="
        bg-white
        shadow
        rounded-xl
        p-5
        mb-6
      "
      >

        <div
          className="
          grid
          md:grid-cols-2
          gap-4
        "
        >

          <div className="relative">

            <FaSearch
              className="
              absolute
              left-4
              top-4
              text-gray-500
            "
            />

            <input
              type="text"
              placeholder="Search user..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="
              w-full
              border
              rounded-lg
              py-3
              pl-12
              pr-4
            "
            />

          </div>

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(
                e.target.value
              )
            }
            className="
            border
            rounded-lg
            p-3
          "
          >
            <option value="All">
              All Roles
            </option>

            <option value="student">
              Student
            </option>

            <option value="admin">
              Admin
            </option>
          </select>

        </div>

      </div>

      {/* Users Table */}
      <div
        className="
        bg-white
        shadow
        rounded-xl
        overflow-x-auto
      "
      >

        <table className="w-full">

          <thead>
            <tr
              className="
              bg-gray-100
              text-left
            "
            >

              <th className="p-4">
                Name
              </th>

              <th className="p-4">
                Email
              </th>

              <th className="p-4">
                Role
              </th>

              <th className="p-4">
                Joined
              </th>

              <th className="p-4">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {filteredUsers.map(
              (user) => (
                <tr
                  key={user.id}
                  className="border-t"
                >

                  <td className="p-4">
                    {user.name}
                  </td>

                  <td className="p-4">
                    {user.email}
                  </td>

                  <td className="p-4">

                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value
                        )
                      }
                      className="
                      border
                      rounded
                      p-2
                    "
                    >
                      <option value="student">
                        Student
                      </option>

                      <option value="admin">
                        Admin
                      </option>
                    </select>

                  </td>

                  <td className="p-4">
                    {user.joinedAt}
                  </td>

                  <td className="p-4">

                    <div className="flex gap-4">

                      <button
                        onClick={() =>
                          viewUserDetails(
                            user
                          )
                        }
                        className="
                        text-blue-600
                      "
                      >
                        <FaEye />
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteUser(
                            user.id
                          )
                        }
                        className="
                        text-red-600
                      "
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

      {/* User Details Modal */}
      {showModal &&
        selectedUser && (
          <div
            className="
            fixed
            inset-0
            bg-black/50
            flex
            justify-center
            items-center
            z-50
          "
          >

            <div
              className="
              bg-white
              rounded-xl
              p-6
              w-full
              max-w-xl
            "
            >

              <div
                className="
                flex
                justify-between
                items-center
                mb-6
              "
              >

                <h2 className="text-2xl font-bold">
                  User Details
                </h2>

                <button
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                >
                  <FaTimes />
                </button>

              </div>

              <div className="space-y-4">

                <div>
                  <strong>Name:</strong>{" "}
                  {selectedUser.name}
                </div>

                <div>
                  <strong>Email:</strong>{" "}
                  {selectedUser.email}
                </div>

                <div>
                  <strong>Role:</strong>{" "}
                  {selectedUser.role}
                </div>

                <div>
                  <strong>Joined:</strong>{" "}
                  {selectedUser.joinedAt}
                </div>

                <div>
                  <strong>Skills:</strong>

                  <div className="flex flex-wrap gap-2 mt-2">

                    {selectedUser.skills
                      ?.length > 0 ? (
                      selectedUser.skills.map(
                        (
                          skill,
                          index
                        ) => (
                          <span
                            key={index}
                            className="
                            bg-blue-100
                            text-blue-700
                            px-3
                            py-1
                            rounded-full
                          "
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <span>
                        No skills added
                      </span>
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default ManageUsers;