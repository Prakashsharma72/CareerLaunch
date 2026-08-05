/**
 * ManageJobs.jsx — Admin view of companies cached from Google Places
 *
 * Shows real companies stored in the DB (seeded by user searches).
 * Read-only — data is owned by Google Places, not editable here.
 */
import { useEffect, useState, useCallback } from "react";
import {
  FaSearch, FaBuilding, FaStar, FaMapMarkerAlt,
  FaGlobe, FaPhone, FaSyncAlt, FaExternalLinkAlt,
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
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            Companies Index
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Companies cached from Google Places API · {total} total
          </p>
        </div>
        <button onClick={() => fetchCompanies(page, searchTerm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
            text-white font-semibold text-sm rounded-xl transition-colors self-start md:self-auto">
          <FaSyncAlt className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm p-4">
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
          <input
            type="text"
            placeholder="Search companies by name…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl
              bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
              text-gray-800 dark:text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0f1123] rounded-2xl border border-neutral-200 dark:border-white/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FaSyncAlt className="animate-spin text-2xl text-blue-500" />
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/8 flex items-center justify-center">
              <FaBuilding className="text-2xl text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-700 dark:text-white">No companies yet</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Companies appear here after users search on the Jobs or Companies page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/4 border-b border-gray-100 dark:border-white/8 text-left">
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Company</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Rating</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">City</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Industry</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/6">
                {companies.map(c => (
                  <tr key={c.id || c.placeId}
                    className="hover:bg-gray-50 dark:hover:bg-white/4 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white truncate max-w-50">
                        {c.companyName}
                      </div>
                      {c.address && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400 dark:text-gray-500 truncate max-w-50">
                          <FaMapMarkerAlt className="shrink-0 text-[9px]" />
                          {c.address}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {c.rating ? (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                          <FaStar className="text-xs" />{Number(c.rating).toFixed(1)}
                          {c.reviewCount && <span className="text-gray-400 font-normal text-xs">({c.reviewCount})</span>}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300 capitalize">
                      {c.city || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300 capitalize text-xs">
                      {c.industry || "—"}
                    </td>
                    <td className="px-5 py-4">
                      {c.businessStatus === "OPERATIONAL" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
                          bg-emerald-100 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Open
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs capitalize">
                          {c.businessStatus?.replace(/_/g, " ").toLowerCase() || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {c.website && (
                          <a href={c.website} target="_blank" rel="noopener noreferrer"
                            title="Website"
                            className="w-7 h-7 rounded-lg flex items-center justify-center
                              bg-gray-100 dark:bg-white/8 text-gray-500 hover:text-blue-600
                              hover:bg-blue-50 dark:hover:bg-blue-900/25 transition-colors">
                            <FaGlobe className="text-xs" />
                          </a>
                        )}
                        {c.mapsUrl && (
                          <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer"
                            title="Google Maps"
                            className="w-7 h-7 rounded-lg flex items-center justify-center
                              bg-gray-100 dark:bg-white/8 text-gray-500 hover:text-red-500
                              hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <FaMapMarkerAlt className="text-xs" />
                          </a>
                        )}
                        {c.phone && (
                          <a href={`tel:${c.phone}`}
                            title={c.phone}
                            className="w-7 h-7 rounded-lg flex items-center justify-center
                              bg-gray-100 dark:bg-white/8 text-gray-500 hover:text-emerald-600
                              hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
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
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 dark:border-white/8">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} · {total} companies
            </p>
            <div className="flex gap-2">
              <button onClick={() => fetchCompanies(page - 1, searchTerm)} disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-white/10
                  text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/8 transition-colors">
                ← Prev
              </button>
              <button onClick={() => fetchCompanies(page + 1, searchTerm)} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-white/10
                  text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/8 transition-colors">
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
