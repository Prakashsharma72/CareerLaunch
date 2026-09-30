import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  FaSearch, FaTrash, FaEye, FaTimes, FaUsers, FaChevronLeft, FaChevronRight,
} from "react-icons/fa";
import adminService from "../../services/adminService";

const formatDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toISOString().slice(0, 10);
};

function ManageUsers() {
  const currentUser = useSelector((state) => state.auth.user);
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm,   setSearchTerm]   = useState("");
  const [roleFilter,   setRoleFilter]   = useState("All");
  const [page,         setPage]         = useState(1);
  const [pagination,   setPagination]   = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal,    setShowModal]    = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const result = await adminService.getAdminUsers({
          page,
          limit: 20,
          search: searchTerm.trim(),
          role: roleFilter === "All" ? "" : roleFilter,
        });
        if (cancelled) return;
        setUsers(Array.isArray(result.users) ? result.users : []);
        setPagination(result.pagination || { page, limit: 20, total: 0, totalPages: 0 });
        if (result.pagination?.page && result.pagination.page !== page) {
          setPage(result.pagination.page);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error?.response?.data?.message || "Unable to load users. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, searchTerm ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [page, searchTerm, roleFilter, refreshVersion]);

  const handleDeleteUser = async (user) => {
    if (String(currentUser?.id) === String(user.id)) return;
    if (!window.confirm(`Delete ${user.name || user.email}? This cannot be undone.`)) return;
    setDeletingUserId(user.id);
    setErrorMessage("");
    try {
      await adminService.deleteAdminUser(user.id);
      setRefreshVersion((value) => value + 1);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to delete this user. Please try again.");
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleRoleChange = async (userId, role) => {
    setUpdatingRoleId(userId);
    setErrorMessage("");
    try {
      const result = await adminService.updateAdminUserRole(userId, role);
      if (roleFilter !== "All" && result.user.role !== roleFilter) {
        setRefreshVersion((value) => value + 1);
      } else {
        setUsers((currentUsers) => currentUsers.map((user) => user.id === userId ? result.user : user));
      }
      if (selectedUser?.id === userId) setSelectedUser(result.user);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Unable to update the user role. Please try again.");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const retryFetch = () => setRefreshVersion((value) => value + 1);

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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="cl-control w-full pl-10 pr-4 py-2.5 text-sm"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="cl-control px-3 py-2.5 text-sm"
          >
            <option value="All">All Roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--cl-danger)]/30 bg-[var(--cl-danger-soft)] px-4 py-3 text-sm text-[var(--cl-danger)]">
          <span>{errorMessage}</span>
          <button type="button" onClick={retryFetch} className="font-semibold underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      <div className="cl-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-[var(--cl-text-muted)]" role="status">
            Loading users…
          </div>
        ) : errorMessage ? null : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cl-surface-soft)]">
              <FaUsers className="text-2xl text-[var(--cl-text-soft)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--cl-text)]">No users found</h3>
            <p className="max-w-xs text-sm text-[var(--cl-text-muted)]">
              {searchTerm || roleFilter !== "All" ? "Try adjusting your search or role filter." : "There are no users to display."}
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
                {users.map((user) => (
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
                        disabled={updatingRoleId === user.id}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="rounded-lg border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-2.5 py-1.5 text-xs font-semibold text-[var(--cl-text)] transition-colors focus:border-[var(--cl-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cl-ring)]"
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="px-5 py-4 align-top text-xs whitespace-nowrap text-[var(--cl-text-soft)]">
                      {formatDate(user.createdAt)}
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
                          onClick={() => handleDeleteUser(user)}
                          disabled={String(currentUser?.id) === String(user.id) || deletingUserId === user.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--cl-danger-soft)] text-[var(--cl-danger)] transition-colors hover:bg-[var(--cl-danger)] hover:text-[var(--cl-button-text)] disabled:cursor-not-allowed disabled:opacity-40"
                          title={String(currentUser?.id) === String(user.id) ? "You cannot delete your own account" : "Delete user"}
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
        {!loading && !errorMessage && pagination.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--cl-border)] px-5 py-3 text-xs text-[var(--cl-text-muted)]">
            <span>
              Showing {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={loading || pagination.page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--cl-surface-soft)] text-[var(--cl-text)] disabled:cursor-not-allowed disabled:opacity-40"
                title="Previous page"
              >
                <FaChevronLeft className="text-[10px]" />
              </button>
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((currentPage) => Math.min(pagination.totalPages, currentPage + 1))}
                disabled={loading || pagination.page >= pagination.totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--cl-surface-soft)] text-[var(--cl-text)] disabled:cursor-not-allowed disabled:opacity-40"
                title="Next page"
              >
                <FaChevronRight className="text-[10px]" />
              </button>
            </div>
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
                { label: "User ID", value: selectedUser.id },
                { label: "Name", value: selectedUser.name },
                { label: "Email", value: selectedUser.email },
                { label: "Role", value: selectedUser.role },
                { label: "Joined", value: formatDate(selectedUser.createdAt) },
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
