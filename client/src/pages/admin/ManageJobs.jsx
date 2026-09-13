/**
 * ManageJobs.jsx — Admin view of companies cached from Google Places
 *
 * Shows real companies stored in the DB (seeded by user searches).
 * Read-only — data is owned by Google Places, not editable here.
 */
import { useEffect, useState, useCallback } from "react";
import {
  FaSearch, FaBuilding, FaStar, FaMapMarkerAlt,
  FaGlobe, FaPhone, FaSyncAlt,
} from "react-icons/fa";
import api from "../../services/api";

function ManageJobs() {
  const [companies,   setCompanies]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const LIMIT = 20;

  const fetchCompanies = useCallback(async (p = 1, q = "") => {
    try {
      setLoading(true);
      const { data } = await api.get("/companies", {
        params: { page: p, limit: LIMIT, q: q || undefined },
      });
      setCompanies(data.companies || []);
      setTotal(data.total || 0);
      setPage(p);
    } catch (err) {
      console.error("ManageJobs fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCompanies(1, searchTerm); }, []);  // eslint-disable-line

  /* Search with 500ms debounce */
  useEffect(() => {
    const t = setTimeout(() => fetchCompanies(1, searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]); // eslint-disable-line

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="cl-page p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--cl-text)] sm:text-3xl">
            Companies Index
          </h1>
          <p className="mt-1 text-sm text-[var(--cl-text-muted)]">
            Companies cached from Google Places API · {total} total
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchCompanies(page, searchTerm)}
          className="cl-primary-btn flex items-center justify-center gap-2 self-start px-4 py-2.5 text-sm md:self-auto"
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="cl-card p-4 sm:p-5">
        <div className="relative">
          <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--cl-text-soft)]" />
          <input
            type="text"
            placeholder="Search companies by name…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="cl-control w-full pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="cl-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FaSyncAlt className="animate-spin text-2xl text-[var(--cl-primary)]" />
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cl-surface-soft)]">
              <FaBuilding className="text-2xl text-[var(--cl-text-soft)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--cl-text)]">No companies yet</h3>
            <p className="max-w-xs text-sm text-[var(--cl-text-muted)]">
              Companies appear here after users search on the Jobs or Companies page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-[var(--cl-border)] bg-[var(--cl-surface-soft)] text-left">
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Company
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Rating
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    City
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Industry
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">
                    Links
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.map(c => (
                  <tr
                    key={c.id || c.placeId}
                    className="border-b border-[var(--cl-border)] transition-colors last:border-b-0 hover:bg-[var(--cl-surface-soft)]"
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="max-w-[18rem] truncate font-semibold text-[var(--cl-text)]">
                        {c.companyName}
                      </div>
                      {c.address && (
                        <div className="mt-1 flex max-w-[18rem] items-center gap-1 truncate text-xs text-[var(--cl-text-muted)]">
                          <FaMapMarkerAlt className="shrink-0 text-[9px]" />
                          {c.address}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      {c.rating ? (
                        <span className="flex items-center gap-1 font-semibold text-[var(--cl-warning)]">
                          <FaStar className="text-xs" />
                          {Number(c.rating).toFixed(1)}
                          {c.reviewCount && (
                            <span className="text-xs font-normal text-[var(--cl-text-soft)]">
                              ({c.reviewCount})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--cl-text-soft)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top capitalize text-[var(--cl-text)]">
                      {c.city || "—"}
                    </td>
                    <td className="px-5 py-4 align-top text-xs capitalize text-[var(--cl-text-muted)]">
                      {c.industry || "—"}
                    </td>
                    <td className="px-5 py-4 align-top">
                      {c.businessStatus === "OPERATIONAL" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cl-success-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--cl-success)]">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--cl-success)]" />
                          Open
                        </span>
                      ) : (
                        <span className="text-xs capitalize text-[var(--cl-text-soft)]">
                          {c.businessStatus?.replace(/_/g, " ").toLowerCase() || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-2">
                        {c.website && (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Website"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--cl-surface-soft)] text-[var(--cl-text-muted)] transition-colors hover:bg-[var(--cl-primary-soft)] hover:text-[var(--cl-primary-strong)]"
                          >
                            <FaGlobe className="text-xs" />
                          </a>
                        )}
                        {c.mapsUrl && (
                          <a
                            href={c.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Google Maps"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--cl-surface-soft)] text-[var(--cl-text-muted)] transition-colors hover:bg-[var(--cl-danger-soft)] hover:text-[var(--cl-danger)]"
                          >
                            <FaMapMarkerAlt className="text-xs" />
                          </a>
                        )}
                        {c.phone && (
                          <a
                            href={`tel:${c.phone}`}
                            title={c.phone}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--cl-surface-soft)] text-[var(--cl-text-muted)] transition-colors hover:bg-[var(--cl-success-soft)] hover:text-[var(--cl-success)]"
                          >
                            <FaPhone className="text-xs" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-[var(--cl-border)] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--cl-text-muted)]">
              Page {page} of {totalPages} · {total} companies
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fetchCompanies(page - 1, searchTerm)}
                disabled={page === 1}
                className="rounded-lg border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-1.5 text-xs font-medium text-[var(--cl-text)] transition-colors hover:bg-[var(--cl-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => fetchCompanies(page + 1, searchTerm)}
                disabled={page === totalPages}
                className="rounded-lg border border-[var(--cl-border)] bg-[var(--cl-surface-soft)] px-3 py-1.5 text-xs font-medium text-[var(--cl-text)] transition-colors hover:bg-[var(--cl-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageJobs;
