import { useEffect, useState } from "react";
import { FaBell, FaBook, FaBriefcase, FaCheck, FaChevronLeft, FaChevronRight, FaExclamationCircle, FaRoad, FaTimes } from "react-icons/fa";
import {
  dismissUserNotification,
  getUserNotificationPreferences,
  getUserNotifications,
  markAllUserNotificationsRead,
  markUserNotificationRead,
  updateUserNotificationPreferences,
} from "../../services/userNotificationService";

const typeOptions = [["all", "All categories"], ["job_match", "Job matches"], ["saved_company_job", "Saved companies"], ["saved_job_deadline", "Saved job deadlines"], ["resource_update", "Resources"], ["roadmap_update", "Roadmaps"], ["roadmap_milestone", "Milestones"], ["interview_result", "Interviews"], ["profile_reminder", "Profile"]];
const iconFor = type => type?.includes("roadmap") ? <FaRoad /> : type === "resource_update" ? <FaBook /> : type === "profile_reminder" ? <FaExclamationCircle /> : type === "interview_result" ? <FaCheck /> : <FaBriefcase />;

export default function Notifications() {
  const [filters, setFilters] = useState({ type: "all", unread: "all" });
  const [data, setData] = useState({ notifications: [], page: 1, total: 0, totalPages: 1 });
  const [preferences, setPreferences] = useState({ jobAlerts: true, resourceUpdates: true, learningReminders: true, announcements: true });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [notifications, preferenceResponse] = await Promise.all([
        getUserNotifications({ ...filters, page, limit: 15 }),
        getUserNotificationPreferences(),
      ]);
      setData(notifications.data);
      setPreferences(current => ({ ...current, ...(preferenceResponse.data.preferences || {}) }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Notifications could not be loaded.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const refresh = setTimeout(load, 0);
    return () => clearTimeout(refresh);
    // load is scoped to the current page and filter values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const updateFilter = (name, value) => { setPage(1); setFilters(current => ({ ...current, [name]: value })); };
  const markRead = async id => { await markUserNotificationRead(id); setData(current => ({ ...current, notifications: current.notifications.map(item => item.id === id ? { ...item, isRead: true } : item) })); };
  const dismiss = async id => { await dismissUserNotification(id); setData(current => ({ ...current, notifications: current.notifications.filter(item => item.id !== id), total: Math.max(0, current.total - 1) })); };
  const markAllRead = async () => { await markAllUserNotificationsRead(); setData(current => ({ ...current, notifications: current.notifications.map(item => ({ ...item, isRead: true })) })); };
  const togglePreference = async (key, value) => { const next = { ...preferences, [key]: value }; setPreferences(next); await updateUserNotificationPreferences({ [key]: value }); };

  return <div className="cl-page min-h-full p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-3 text-[var(--cl-primary)]"><FaBell /><span className="text-xs font-bold uppercase tracking-wider">Your activity</span></div><h1 className="text-2xl font-bold text-[var(--cl-text)] sm:text-3xl">Notifications</h1><p className="mt-1 text-sm text-[var(--cl-text-muted)]">Updates selected for your career journey.</p></div><button type="button" onClick={markAllRead} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--cl-text)]"><FaCheck /> Mark all as read</button></div>
    <div className="grid gap-3 rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-4 shadow-[var(--cl-shadow)] sm:grid-cols-2"><select value={filters.type} onChange={event => updateFilter("type", event.target.value)} className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-2.5 text-sm text-[var(--cl-text)]">{typeOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><select value={filters.unread} onChange={event => updateFilter("unread", event.target.value)} className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-2.5 text-sm text-[var(--cl-text)]"><option value="all">Read and unread</option><option value="true">Unread only</option></select></div>
    {error && <div className="rounded-xl border border-[var(--cl-danger)]/30 bg-[var(--cl-danger-soft)] p-4 text-sm text-[var(--cl-danger)]">{error} <button type="button" onClick={load} className="ml-2 font-semibold underline">Retry</button></div>}
    <div className="overflow-hidden rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] shadow-[var(--cl-shadow)]">{loading ? <div className="p-12 text-center text-sm text-[var(--cl-text-muted)]">Loading notifications...</div> : data.notifications.length === 0 ? <div className="p-12 text-center text-sm text-[var(--cl-text-muted)]">No notifications match these filters.</div> : data.notifications.map(item => <article key={item.id} className={`flex gap-3 border-b border-[var(--cl-border)] p-4 last:border-b-0 sm:gap-4 sm:p-5 ${item.isRead ? "opacity-70" : ""}`}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cl-primary-soft)] text-[var(--cl-primary)]">{iconFor(item.type)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-[var(--cl-text)]">{item.title}</h2>{!item.isRead && <span className="rounded-full bg-[var(--cl-primary-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--cl-primary)]">Unread</span>}</div><p className="mt-1 text-sm text-[var(--cl-text-muted)]">{item.description}</p><p className="mt-2 text-xs text-[var(--cl-text-soft)]">{new Date(item.createdAt).toLocaleString()}</p></div><div className="flex shrink-0 gap-1"><button type="button" aria-label="Mark notification as read" onClick={() => markRead(item.id)} className="h-9 w-9 rounded-lg text-[var(--cl-text-muted)] hover:bg-[var(--cl-surface-soft)]"><FaCheck /></button><button type="button" aria-label="Dismiss notification" onClick={() => dismiss(item.id)} className="h-9 w-9 rounded-lg text-[var(--cl-text-muted)] hover:bg-[var(--cl-danger-soft)] hover:text-[var(--cl-danger)]"><FaTimes /></button></div></article>)}</div>
    <div className="flex items-center justify-between rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] px-4 py-3 text-sm text-[var(--cl-text-muted)]"><span>{data.total || 0} notification{data.total === 1 ? "" : "s"}</span><div className="flex items-center gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--cl-border)] disabled:opacity-40"><FaChevronLeft /></button><span>Page {page} of {data.totalPages || 1}</span><button type="button" disabled={page >= (data.totalPages || 1)} onClick={() => setPage(value => value + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--cl-border)] disabled:opacity-40"><FaChevronRight /></button></div></div>
    <section className="rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-5 shadow-[var(--cl-shadow)]"><h2 className="text-lg font-bold text-[var(--cl-text)]">Notification preferences</h2><p className="mt-1 text-sm text-[var(--cl-text-muted)]">Choose which optional updates appear in your account.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{[["jobAlerts", "Job alerts"], ["resourceUpdates", "Resource updates"], ["learningReminders", "Learning reminders"], ["announcements", "Announcements"]].map(([key, label]) => <label key={key} className="flex items-center justify-between rounded-xl bg-[var(--cl-surface-soft)] px-4 py-3 text-sm text-[var(--cl-text)]"><span>{label}</span><input type="checkbox" checked={Boolean(preferences[key])} onChange={event => togglePreference(key, event.target.checked)} className="h-4 w-4 accent-[var(--cl-primary)]" /></label>)}</div></section>
  </div></div>;
}
