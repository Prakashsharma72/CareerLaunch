import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaBell, FaBook, FaBriefcase, FaBuilding, FaCheck, FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaRedoAlt, FaRoad, FaRobot, FaSearch, FaUndo, FaUser } from "react-icons/fa";
import adminService from "../../services/adminService";

const typeOptions = [["all", "All types"], ["user", "User activity"], ["company", "Company activity"], ["job", "Job activity"], ["ai", "AI provider"], ["content", "Content activity"], ["system", "System activity"]];
const severityOptions = [["all", "All severity"], ["critical", "Critical"], ["high", "High"], ["warning", "Warning"], ["info", "Info"]];

function Icon({ item }) {
  if (item.type === "recovery") return <FaRedoAlt />;
  if (["user_registration", "user_login", "admin_login", "user_logout", "profile_updated", "resume_uploaded"].includes(item.type)) return <FaUser />;
  if (item.type === "job_saved") return <FaBriefcase />;
  if (item.type === "company_saved") return <FaBuilding />;
  if (item.type === "roadmap_activity" || item.type === "roadmap_completed") return <FaRoad />;
  if (item.type === "mock_interview" || item.type === "ai_provider_failure") return <FaRobot />;
  if (item.type === "resource_activity") return <FaBook />;
  if (item.severity === "critical" || item.severity === "high") return <FaExclamationTriangle />;
  return <FaBell />;
}

const relativeTime = (value) => {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Unknown time";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (hours < 48) return "Yesterday";
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(timestamp).toLocaleDateString();
};

const severityStyle = (severity) => ({
  critical: "bg-[var(--cl-danger-soft)] text-[var(--cl-danger)]",
  high: "bg-[var(--cl-danger-soft)] text-[var(--cl-danger)]",
  warning: "bg-amber-500/10 text-amber-500",
  info: "bg-[var(--cl-primary-soft)] text-[var(--cl-primary)]",
}[severity] || "bg-[var(--cl-surface-soft)] text-[var(--cl-text-muted)]");

export default function AdminNotifications() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    type: "all", severity: "all", read: "all", resolved: "all",
    incidentId: searchParams.get("incident") || "", search: "",
  }));
  const [data, setData] = useState({ notifications: [], page: 1, totalPages: 0, total: 0, unreadCount: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await adminService.getNotifications({ ...filters, page, limit: 20 });
        if (cancelled) return;
        setData({ ...result, ...result.pagination });
        if (result.pagination?.page && result.pagination.page !== page) setPage(result.pagination.page);
      } catch (requestError) {
        if (!cancelled) setError(requestError.response?.data?.message || "Unable to load notifications.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, filters.search ? 250 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [page, filters, refreshVersion]);

  useEffect(() => {
    const refresh = () => setRefreshVersion(value => value + 1);
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("admin-notifications-updated", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("admin-notifications-updated", refresh);
    };
  }, []);

  const updateFilter = (name, value) => {
    setPage(1);
    setFilters(current => ({ ...current, [name]: value }));
  };

  const toggleRead = async (item) => {
    setBusyId(item.id);
    setError("");
    try {
      const result = await adminService.markNotificationRead(item.id, !item.isRead);
      setData(current => ({
        ...current,
        unreadCount: result.unreadCount ?? current.unreadCount,
        notifications: current.notifications.map(notification => notification.id === item.id
          ? { ...notification, isRead: !item.isRead }
          : notification),
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update notification status.");
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    try {
      const result = await adminService.markAllNotificationsRead();
      setData(current => ({
        ...current,
        unreadCount: result.unreadCount ?? 0,
        notifications: current.notifications.map(item => ({ ...item, isRead: true })),
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to mark notifications as read.");
    }
  };

  const retry = () => setRefreshVersion(value => value + 1);
  const incidentId = searchParams.get("incident");
  const totalPages = data.totalPages || 1;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-3 text-[var(--cl-primary)]"><FaBell /><span className="text-xs font-bold uppercase tracking-wider">Admin center</span></div>
          <h1 className="text-2xl font-bold text-[var(--cl-text)] sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-[var(--cl-text-muted)]">Provider health and verified platform activity.</p>
          <p className="mt-2 text-xs text-[var(--cl-text-soft)]">{data.unreadCount || 0} unread</p>
        </div>
        <button type="button" onClick={markAllRead} disabled={!data.unreadCount} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--cl-text)] hover:bg-[var(--cl-surface-soft)] disabled:cursor-not-allowed disabled:opacity-50"><FaCheck /> Mark all as read</button>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-4 shadow-[var(--cl-shadow)] sm:grid-cols-2 lg:grid-cols-4">
        <select aria-label="Filter by activity type" value={filters.type} onChange={event => updateFilter("type", event.target.value)} className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-2.5 text-sm text-[var(--cl-text)]">{typeOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
        <select aria-label="Filter by severity" value={filters.severity} onChange={event => updateFilter("severity", event.target.value)} className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-2.5 text-sm text-[var(--cl-text)]">{severityOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
        <select aria-label="Filter by read status" value={filters.read} onChange={event => updateFilter("read", event.target.value)} className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-2.5 text-sm text-[var(--cl-text)]"><option value="all">Read and unread</option><option value="unread">Unread only</option><option value="read">Read only</option></select>
        <select aria-label="Filter by active or resolved" value={filters.resolved} onChange={event => updateFilter("resolved", event.target.value)} className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-2.5 text-sm text-[var(--cl-text)]"><option value="all">Active and resolved</option><option value="false">Active only</option><option value="true">Resolved only</option></select>
        <label className="relative sm:col-span-2 lg:col-span-4">
          <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--cl-text-soft)]" />
          <input aria-label="Search activity" type="search" value={filters.search} onChange={event => updateFilter("search", event.target.value)} placeholder="Search activity, person, or email..." className="w-full rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] py-2.5 pl-10 pr-3 text-sm text-[var(--cl-text)] placeholder:text-[var(--cl-text-soft)]" />
        </label>
      </div>

      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--cl-danger)]/30 bg-[var(--cl-danger-soft)] p-4 text-sm text-[var(--cl-danger)]"><span>{error}</span><button type="button" onClick={retry} className="font-semibold underline">Retry</button></div>}
      <div className="overflow-hidden rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] shadow-[var(--cl-shadow)]">
        {loading ? <div className="p-12 text-center text-sm text-[var(--cl-text-muted)]" role="status">Loading notifications...</div> : data.notifications.length === 0 ? <div className="p-12 text-center text-sm text-[var(--cl-text-muted)]">No notifications match these filters.</div> : data.notifications.map(item => (
          <article key={item.id} className={`flex gap-3 border-b border-[var(--cl-border)] p-4 last:border-b-0 sm:gap-4 sm:p-5 ${item.isRead ? "opacity-75" : ""}`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.severity === "critical" || item.severity === "high" ? "bg-[var(--cl-danger-soft)] text-[var(--cl-danger)]" : "bg-[var(--cl-primary-soft)] text-[var(--cl-primary)]"}`}><Icon item={item} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-[var(--cl-text)]">{item.title}</h2>{!item.isRead && <span className="rounded-full bg-[var(--cl-primary-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--cl-primary)]">Unread</span>}<span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${severityStyle(item.severity)}`}>{item.severity}</span>{item.resolved && <span className="rounded-full bg-[var(--cl-success-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--cl-success)]">Resolved</span>}{item.emailStatus && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${item.emailStatus === "sent" ? "bg-[var(--cl-success-soft)] text-[var(--cl-success)]" : "bg-[var(--cl-danger-soft)] text-[var(--cl-danger)]"}`}>Email {item.emailUncertain ? "uncertain" : item.emailStatus}</span>}</div>
              <p className="mt-1 text-sm text-[var(--cl-text-muted)]">{item.message}</p>
              {(item.userName || item.userEmail || item.userId) && <p className="mt-2 text-xs text-[var(--cl-text-soft)]">{item.userName}{item.userEmail ? ` · ${item.userEmail}` : ""}{item.userId ? ` · User #${item.userId}` : ""}</p>}
              <p className="mt-2 text-xs text-[var(--cl-text-soft)]" title={new Date(item.createdAt).toLocaleString()}>{relativeTime(item.createdAt)}{item.incidentId ? ` · Incident #${item.incidentId}` : ""}{incidentId && String(item.incidentId) === incidentId ? " · Selected" : ""}</p>
            </div>
            <button type="button" onClick={() => toggleRead(item)} disabled={busyId === item.id} aria-label={item.isRead ? "Mark notification as unread" : "Mark notification as read"} title={item.isRead ? "Mark unread" : "Mark read"} className="h-9 w-9 shrink-0 rounded-lg text-[var(--cl-text-muted)] hover:bg-[var(--cl-surface-soft)] hover:text-[var(--cl-primary)] disabled:opacity-50">{item.isRead ? <FaUndo /> : <FaCheck />}</button>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] px-4 py-3 text-sm text-[var(--cl-text-muted)]">
        <span>{data.total || 0} notification{data.total === 1 ? "" : "s"}</span>
        <div className="flex items-center gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage(value => Math.max(1, value - 1))} aria-label="Previous page" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--cl-border)] disabled:opacity-40"><FaChevronLeft /></button><span>Page {data.page || page} of {totalPages}</span><button type="button" disabled={page >= totalPages || loading} onClick={() => setPage(value => Math.min(totalPages, value + 1))} aria-label="Next page" className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--cl-border)] disabled:opacity-40"><FaChevronRight /></button></div>
      </div>
    </div>
  );
}
