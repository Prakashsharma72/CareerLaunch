import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaBook, FaBriefcase, FaCheck, FaExclamationCircle, FaRedo, FaRoad } from "react-icons/fa";
import {
  getUserNotifications,
  getUserNotificationUnreadCount,
  markUserNotificationRead,
  markAllUserNotificationsRead,
} from "../../services/userNotificationService";

const iconFor = type => {
  if (type === "resource_update") return <FaBook />;
  if (type === "roadmap_update" || type === "roadmap_milestone") return <FaRoad />;
  if (type === "interview_result") return <FaCheck />;
  if (type === "profile_reminder") return <FaExclamationCircle />;
  return <FaBriefcase />;
};

const timeLabel = value => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export default function UserNotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, count] = await Promise.all([
        getUserNotifications({ limit: 10, unread: tab === "unread" ? "true" : "all" }),
        getUserNotificationUnreadCount(),
      ]);
      setItems(list.data.notifications || []);
      setUnreadCount(count.data.unreadCount || 0);
    } catch {
      setError("Notifications could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    const refresh = () => load();
    const initial = setTimeout(refresh, 0);
    const timer = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => { clearTimeout(initial); clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [load]);

  useEffect(() => {
    if (!open) return undefined;
    const close = event => { if (!containerRef.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    const refresh = setTimeout(load, 0);
    return () => { clearTimeout(refresh); document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, [open, load]);

  const openItem = async item => {
    if (!item.isRead) {
      await markUserNotificationRead(item.id).catch(() => {});
      setItems(current => current.map(row => row.id === item.id ? { ...row, isRead: true } : row));
      setUnreadCount(current => Math.max(0, current - 1));
    }
    setOpen(false);
    if (item.link) navigate(item.link);
  };

  const markAllRead = async () => {
    await markAllUserNotificationsRead().catch(() => {});
    setItems(current => current.map(item => ({ ...item, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={() => setOpen(value => !value)} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} aria-expanded={open} className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--cl-surface-muted)] text-[var(--cl-text-muted)] transition-colors hover:text-[var(--cl-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cl-primary)]">
        <FaBell className="text-sm" />
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {open && <div role="dialog" aria-label="Notifications" className="absolute right-0 top-12 z-50 w-[min(23rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[var(--cl-border)] bg-[var(--cl-surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--cl-border)] px-4 py-3"><div><h2 className="text-sm font-bold text-[var(--cl-text)]">Notifications</h2><p className="text-xs text-[var(--cl-text-muted)]">{unreadCount} unread</p></div><button type="button" onClick={markAllRead} className="text-xs font-semibold text-[var(--cl-primary)] hover:underline">Mark all as read</button></div>
        <div className="grid grid-cols-2 border-b border-[var(--cl-border)]"><button type="button" onClick={() => setTab("all")} className={`px-4 py-2 text-xs font-semibold ${tab === "all" ? "border-b-2 border-[var(--cl-primary)] text-[var(--cl-primary)]" : "text-[var(--cl-text-muted)]"}`}>All</button><button type="button" onClick={() => setTab("unread")} className={`px-4 py-2 text-xs font-semibold ${tab === "unread" ? "border-b-2 border-[var(--cl-primary)] text-[var(--cl-primary)]" : "text-[var(--cl-text-muted)]"}`}>Unread</button></div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? <div className="p-8 text-center text-sm text-[var(--cl-text-muted)]">Loading notifications...</div> : error ? <div className="p-6 text-center text-sm text-[var(--cl-danger)]"><p>{error}</p><button type="button" onClick={load} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold underline"><FaRedo /> Retry</button></div> : items.length === 0 ? <div className="p-8 text-center text-sm text-[var(--cl-text-muted)]">{tab === "unread" ? "You are all caught up." : "No notifications yet."}</div> : items.map(item => <button type="button" key={item.id} onClick={() => openItem(item)} className={`flex w-full gap-3 border-b border-[var(--cl-border)] px-4 py-3 text-left hover:bg-[var(--cl-surface-soft)] ${item.isRead ? "opacity-65" : ""}`}><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--cl-primary-soft)] text-[var(--cl-primary)]">{iconFor(item.type)}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-sm font-semibold text-[var(--cl-text)]"><span className="truncate">{item.title}</span>{!item.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cl-primary)]" />}</span><span className="mt-1 block line-clamp-2 text-xs text-[var(--cl-text-muted)]">{item.description}</span><span className="mt-1 block text-[10px] text-[var(--cl-text-soft)]">{timeLabel(item.createdAt)}</span></span></button>)}
        </div>
        <button type="button" onClick={() => { setOpen(false); navigate("/student/notifications"); }} className="flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-[var(--cl-primary)] hover:bg-[var(--cl-surface-soft)]"><FaBell /> View all notifications</button>
      </div>}
    </div>
  );
}
