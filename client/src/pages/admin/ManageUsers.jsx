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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

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
    <div className="cl-page p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--cl-text)] sm:text-3xl">
          Manage Users
        </h1>
        <p className="mt-1 text-sm text-[var(--cl-text-muted)]">
          View users, manage roles, and control platform access.
        </p>
      </div>

      <div className="cl-card p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--cl-text-soft)]" />
            <input
              type="text"
              placeholder="Search users…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cl-control w-full pl-10 pr-4 py-2.5 text-sm"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="cl-control px-3 py-2.5 text-sm"
          >
            <option value="All">All Roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="cl-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cl-surface-soft)]">
              <FaUsers className="text-2xl text-[var(--cl-text-soft)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--cl-text)]">No users found</h3>
            <p className="max-w-xs text-sm text-[var(--cl-text-muted)]">
              Try adjusting your search or role filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-[var(--cl-border)] bg-[var(--cl-surface-soft)] text-left">
                  <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Name
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Email
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Joined
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--cl-border)] transition-colors last:border-b-0 hover:bg-[var(--cl-surface-soft)]"
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="max-w-[16rem] truncate font-medium text-[var(--cl-text)]">
                        {user.name}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="max-w-[22rem] truncate text-[var(--cl-text-muted)]">
                        {user.email}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="rounded-lg border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-2.5 py-1.5 text-xs font-semibold text-[var(--cl-text)] transition-colors focus:border-[var(--cl-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cl-ring)]"
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="px-5 py-4 align-top text-xs whitespace-nowrap text-[var(--cl-text-soft)]">
                      {user.joinedAt}
                    </td>

                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--cl-primary-soft)] text-[var(--cl-primary-strong)] transition-colors hover:bg-[var(--cl-primary)] hover:text-[var(--cl-button-text)]"
                          title="View details"
                        >
                          <FaEye className="text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--cl-danger-soft)] text-[var(--cl-danger)] transition-colors hover:bg-[var(--cl-danger)] hover:text-[var(--cl-button-text)]"
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

      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--cl-overlay)] p-4 backdrop-blur-sm">
          <div className="cl-card w-full max-w-md">
            <div className="flex items-center justify-between border-b border-[var(--cl-border)] px-6 py-4">
              <h2 className="text-lg font-bold text-[var(--cl-text)]">User Details</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--cl-surface-soft)] text-[var(--cl-text-muted)] transition-colors hover:bg-[var(--cl-surface-elevated)]"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {[
                { label: "Name", value: selectedUser.name },
                { label: "Email", value: selectedUser.email },
                { label: "Role", value: selectedUser.role },
                { label: "Joined", value: selectedUser.joinedAt },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="w-14 shrink-0 pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-soft)]">
                    {label}
                  </span>
                  <span className="text-sm font-medium capitalize text-[var(--cl-text)]">
                    {value}
                  </span>
                </div>
              ))}

              <div className="flex items-start gap-3">
                <span className="w-14 shrink-0 pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-soft)]">
                  Skills
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.skills?.length > 0 ? (
                    selectedUser.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-[var(--cl-primary-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--cl-primary-strong)]"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[var(--cl-text-muted)]">No skills added</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cl-secondary-btn mt-2 w-full"
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
