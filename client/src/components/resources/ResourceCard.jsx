import { memo } from "react";
import {
  FaBook,
  FaExternalLinkAlt,
  FaBookmark,
} from "react-icons/fa";

function ResourceCard({ resource, onBookmark }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-20px_rgba(15,23,42,0.95)]">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex items-center rounded-full bg-blue-600/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300 ring-1 ring-blue-300/10">
          {resource.category}
        </span>
        <button
          onClick={() => onBookmark(resource.id)}
          className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-blue-300"
          aria-label={`Bookmark ${resource.title}`}>
          <FaBookmark size={18} />
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-3">
          <FaBook className="text-blue-400" size={22} />
          <h2 className="text-xl font-semibold text-white">{resource.title}</h2>
        </div>
        <p className="text-sm leading-7 text-slate-400">{resource.description}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-slate-500">Added by Admin</span>
        <a
          href={resource.link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
        >
          Open
          <FaExternalLinkAlt size={12} />
        </a>
      </div>
    </div>
  );
}

export default memo(ResourceCard);