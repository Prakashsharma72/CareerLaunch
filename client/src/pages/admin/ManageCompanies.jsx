import { useCallback, useEffect, useState } from "react";
import { FaBuilding, FaEdit, FaPlus, FaSearch, FaSyncAlt } from "react-icons/fa";
import api from "../../services/api";

const EMPTY = { companyName: "", city: "", address: "", website: "", phone: "", industry: "", mapsUrl: "", placeId: "" };
const inputClass = "cl-control w-full px-3 py-2.5 text-sm";

export default function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState({ search: "", city: "", source: "all", status: "all" });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async (nextPage = page) => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/admin/companies", { params: { ...filters, page: nextPage, limit: 20 } });
      setCompanies(data.companies || []); setMeta(data); setPage(nextPage);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load companies.");
    } finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { const timer = setTimeout(() => load(1), 250); return () => clearTimeout(timer); }, [filters]);
  useEffect(() => { load(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const edit = company => { setEditing(company); setForm({ ...EMPTY, ...company }); setShowForm(true); };
  const save = async event => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = editing
        ? await api.put(`/admin/companies/${editing.id}`, form)
        : await api.post("/admin/companies", form);
      setCompanies(current => editing
        ? current.map(item => item.id === response.data.company.id ? response.data.company : item)
        : [response.data.company, ...current]);
      setEditing(null); setForm(EMPTY); setShowForm(false);
      if (!editing) load(1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save company.");
    } finally { setSaving(false); }
  };

  return <div className="cl-page mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><h1 className="text-2xl font-bold tracking-tight text-[var(--cl-text)] sm:text-3xl">Manage Companies</h1><p className="mt-1 text-sm text-[var(--cl-text-muted)]">Stored company records, provenance, and independently maintained entries.</p></div>
      <button type="button" onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }} className="cl-primary-btn flex items-center justify-center gap-2 px-4 py-2.5 text-sm"><FaPlus /> Add company</button>
    </div>
    {error && <div className="flex items-center justify-between rounded-xl border border-[var(--cl-danger)]/20 bg-[var(--cl-danger-soft)] px-4 py-3 text-sm text-[var(--cl-danger)]"><span>{error}</span><button type="button" onClick={() => load(page)} className="font-semibold underline">Retry</button></div>}
    <div className="cl-card grid gap-3 p-4 md:grid-cols-4">
      <label className="relative md:col-span-2"><FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--cl-text-soft)]" /><input className={`${inputClass} pl-10`} placeholder="Search name, address, identifier" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} /></label>
      <input className={inputClass} placeholder="City" value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} />
      <select className={inputClass} value={filters.source} onChange={e => setFilters({ ...filters, source: e.target.value })}><option value="all">All sources</option><option value="google_places">Google Places</option><option value="admin">Admin</option></select>
      <select className={inputClass} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="all">All statuses</option><option value="active">Active</option><option value="expired">Expired</option><option value="admin">Admin maintained</option></select>
    </div>
    <div className="cl-card overflow-hidden">
      {loading ? <div className="flex justify-center py-20"><FaSyncAlt className="animate-spin text-2xl text-[var(--cl-primary)]" /></div> : companies.length === 0 ? <div className="flex flex-col items-center gap-3 py-20 text-center"><FaBuilding className="text-3xl text-[var(--cl-text-soft)]" /><p className="font-semibold text-[var(--cl-text)]">No stored companies found</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="border-b border-[var(--cl-border)] bg-[var(--cl-surface-soft)] text-left">{["Company", "Location", "Website", "Source", "Updated", "Status", ""].map(label => <th key={label} className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cl-text-muted)]">{label}</th>)}</tr></thead><tbody>{companies.map(company => <tr key={company.id} className="border-b border-[var(--cl-border)] last:border-0 hover:bg-[var(--cl-surface-soft)]"><td className="px-5 py-4"><p className="font-semibold text-[var(--cl-text)]">{company.companyName}</p><p className="mt-1 text-xs text-[var(--cl-text-soft)]">{company.placeId || "No provider identifier"}</p></td><td className="px-5 py-4 text-[var(--cl-text-muted)]">{company.city || "—"}<br /><span className="text-xs">{company.address || "—"}</span></td><td className="max-w-[14rem] truncate px-5 py-4 text-[var(--cl-primary)]">{company.website || "—"}</td><td className="px-5 py-4 capitalize text-[var(--cl-text-muted)]">{company.source || "—"}</td><td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--cl-text-muted)]">{company.updatedAt ? new Date(company.updatedAt).toLocaleDateString() : "—"}</td><td className="px-5 py-4 text-xs text-[var(--cl-text-muted)]">{company.adminManaged ? "Admin maintained" : company.expiresAt && new Date(company.expiresAt) < new Date() ? "Expired" : "Stored"}</td><td className="px-5 py-4"><button type="button" title="Edit company" onClick={() => edit(company)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--cl-primary-soft)] text-[var(--cl-primary)]"><FaEdit className="text-xs" /></button></td></tr>)}</tbody></table></div>}
      {meta.totalPages > 1 && <div className="flex items-center justify-between border-t border-[var(--cl-border)] px-5 py-3.5"><span className="text-xs text-[var(--cl-text-muted)]">Page {page} of {meta.totalPages} · {meta.total} records</span><div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => load(page - 1)} className="cl-control px-3 py-1.5 text-xs disabled:opacity-40">Prev</button><button type="button" disabled={page === meta.totalPages} onClick={() => load(page + 1)} className="cl-control px-3 py-1.5 text-xs disabled:opacity-40">Next</button></div></div>}
    </div>
    {showForm && <div className="cl-card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-[var(--cl-text)]">{editing ? "Edit company" : "Add company"}</h2><button type="button" onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(false); }} className="text-sm text-[var(--cl-text-muted)]">Cancel</button></div><form onSubmit={save} className="grid gap-3 md:grid-cols-2">{[["companyName","Name"],["city","City"],["address","Address"],["website","Website"],["phone","Phone"],["industry","Industry"],["mapsUrl","Maps URL"],["placeId","Provider identifier (optional)"]].map(([name, label]) => <label key={name} className="text-xs text-[var(--cl-text-muted)]">{label}<input className={`${inputClass} mt-1`} value={form[name] || ""} onChange={e => setForm({ ...form, [name]: e.target.value })} required={name === "companyName" || name === "city"} /></label>)}<button disabled={saving} className="cl-primary-btn mt-2 px-4 py-2.5 text-sm md:col-span-2">{saving ? "Saving..." : "Save company"}</button></form></div>}
  </div>;
}
