import { memo } from "react";
import {
  FaBook,
  FaExternalLinkAlt,
  FaBookmark,
} from "react-icons/fa";

function ResourceCard({ resource, onBookmark }) {
  return (
    <div className="rounded-[28px] border border-[var(--cl-border)] bg-[var(--cl-surface)] p-6 shadow-[var(--cl-shadow)] transition hover:-translate-y-0.5 hover:border-[var(--cl-primary)]">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex items-center rounded-full bg-[var(--cl-primary-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cl-primary)] ring-1 ring-[var(--cl-primary)]/20">
          {resource.category}
        </span>
        <button
          onClick={() => onBookmark(resource.id)}
          className="rounded-full p-2 text-[var(--cl-text-muted)] transition hover:bg-[var(--cl-surface-soft)] hover:text-[var(--cl-primary)]"
          aria-label={`Bookmark ${resource.title}`}>
          <FaBookmark size={18} />
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-3">
          <FaBook className="text-[var(--cl-primary)]" size={22} />
          <h2 className="text-xl font-semibold text-[var(--cl-text)]">{resource.title}</h2>
        </div>
        <p className="text-sm leading-7 text-[var(--cl-text-muted)]">{resource.description}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-[var(--cl-text-soft)]">Added by Admin</span>
        <a
          href={resource.link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--cl-success)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Open
          <FaExternalLinkAlt size={12} />
        </a>
      </div>
    </div>
  );
}

export default memo(ResourceCard);