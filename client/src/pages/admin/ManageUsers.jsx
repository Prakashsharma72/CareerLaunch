import { useEffect, useState } from "react";
import {
  FaSearch, FaTrash, FaEye, FaTimes, FaUsers,
} from "react-icons/fa";
import Loader from "../../components/common/Loader";

function ManageUsers() {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [roleFilter,   setRoleFilter]   = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal,    setShowModal]    = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setUsers([
        { id: 1, name: "Prakash Sharma", email: "prakash@gmail.com", role: "student", skills: ["React", "Node.js", "PostgreSQL"], joinedAt: "2026-01-10" },
        { id: 2, name: "Admin User",     email: "admin@gmail.com",   role: "admin",   skills: [],                                 joinedAt: "2025-12-01" },
        { id: 3, name: "John Doe",       email: "john@gmail.com",    role: "student", skills: ["Java", "Spring Boot"],            joinedAt: "2026-02-15" },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm("Delete this user?")) return;
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map((u) => u.id === userId ? { ...u, role: newRole } : u));
  };

  const filtered = users.filter((u) => {
    const searchMatch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = roleFilter === "All" || u.role === roleFilter;
    return searchMatch && roleMatch;
  });

  if (loading) return <Loader />;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Manage Users
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
          View users, manage roles, and control platform access.
        </p>
      </div>

      {/* ── Search + Filter ── */}
      <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search users…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl
                bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                text-gray-800 dark:text-white placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2.5 px-3 text-sm rounded-xl
              bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
              text-gray-800 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
          >
            <option value="All"     className="bg-white dark:bg-[#0f1123]">All Roles</option>
            <option value="student" className="bg-white dark:bg-[#0f1123]">Student</option>
            <option value="admin"   className="bg-white dark:bg-[#0f1123]">Admin</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/8 flex items-center justify-center">
              <FaUsers className="text-2xl text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-700 dark:text-white">No users found</h3>
            <p className="text-sm text-gray-400 max-w-xs">Try adjusting your search or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/4 border-b border-gray-100 dark:border-white/8 text-left">
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Joined</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/6">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/4 transition-colors">

                    {/* Name */}
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {user.name}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {user.email}
                    </td>

                    {/* Role select */}
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="py-1.5 px-2.5 text-xs font-semibold rounded-lg
                          bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/10
                          text-gray-700 dark:text-gray-200
                          focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition"
                      >
                        <option value="student" className="bg-white dark:bg-[#0f1123]">Student</option>
                        <option value="admin"   className="bg-white dark:bg-[#0f1123]">Admin</option>
                      </select>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {user.joinedAt}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedUser(user); setShowModal(true); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                            bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400
                            hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors"
                          title="View details"
                        >
                          <FaEye className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                            bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400
                            hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-colors"
                          title="Delete user"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── User Details Modal ── */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-[#0f1123] border border-neutral-200 dark:border-white/10
            rounded-2xl shadow-2xl w-full max-w-md">

            {/* Modal header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-100 dark:border-white/8">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">User Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center
                  bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-400
                  hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              {[
                { label: "Name",   value: selectedUser.name     },
                { label: "Email",  value: selectedUser.email    },
                { label: "Role",   value: selectedUser.role     },
                { label: "Joined", value: selectedUser.joinedAt },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 w-14 pt-0.5 shrink-0">
                    {label}
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white capitalize">
                    {value}
                  </span>
                </div>
              ))}

              {/* Skills */}
              <div className="flex items-start gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 w-14 pt-0.5 shrink-0">
                  Skills
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.skills?.length > 0 ? (
                    selectedUser.skills.map((skill, i) => (
                      <span key={i}
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold
                          bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">No skills added</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-2 py-2.5 text-sm font-semibold rounded-xl
                  bg-gray-100 dark:bg-white/8 text-gray-700 dark:text-gray-300
                  hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
