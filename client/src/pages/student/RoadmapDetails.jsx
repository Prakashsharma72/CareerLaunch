import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaDownload, FaExternalLinkAlt, FaFilePdf, FaLock } from "react-icons/fa";
import { getRoadmap, updateRoadmapProgress } from "../../services/roadmapService";
import api from "../../services/api";

function videoEmbed(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) return `https://www.youtube.com/embed/${parsed.searchParams.get("v") || parsed.pathname.split("/").pop()}`;
    if (parsed.hostname === "youtu.be") return `https://www.youtube.com/embed${parsed.pathname}`;
    if (parsed.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video${parsed.pathname}`;
  } catch { return null; }
  return null;
}

function getDownloadFilename(response, fallback) {
  const header = response.headers["content-disposition"] || "";
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) return decodeURIComponent(encoded);
  const plain = header.match(/filename="?([^";]+)"?/i)?.[1];
  return plain || fallback;
}

function downloadBlob(response, filename) {
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function ResourceView({ resource }) {
  const [blobUrl, setBlobUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const file = resource.sourceType === "file";
  const isPdf = resource.mimeType === "application/pdf" || resource.originalName?.toLowerCase().endsWith(".pdf");
  const isVideo = resource.mimeType?.startsWith("video/") || /\.(mp4|webm)$/i.test(resource.originalName || "");
  const contentUrl = `/roadmaps/resource/${resource.id}/content`;
  const embed = !file && resource.type === "Video" ? videoEmbed(resource.url) : null;

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    useEffect(() => {
      if (!file || !isPdf) return undefined;
      let active = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      api.get(contentUrl, { responseType: "blob" })
        .then((response) => { if (active) setBlobUrl(URL.createObjectURL(response.data)); })
        .catch(() => { if (active) setError("PDF preview unavailable."); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [file, isPdf, resource.id]);

  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  const download = async () => {
    try {
      const response = await api.get(`${contentUrl}?download=1`, { responseType: "blob" });
      const contentType = String(response.headers["content-type"] || "").toLowerCase();
      if (response.status < 200 || response.status >= 300 || !contentType.includes("application/pdf")) throw new Error("Invalid PDF response");
      downloadBlob(response, resource.originalName || `${resource.label || "resource"}.pdf`);
    } catch { setError("PDF download failed. Please try again."); }
  };

  return <div className="rounded-lg border border-[var(--cl-border)] bg-[var(--cl-surface)] p-3">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-xs font-bold text-[var(--cl-text)]">{resource.label}</p><p className="mt-1 text-[10px] text-[var(--cl-text-muted)]">{resource.type}{resource.fileSize ? ` Â· ${(Number(resource.fileSize) / 1024 / 1024).toFixed(1)} MB` : ""}</p></div>
      {file && isPdf && blobUrl ? <div className="flex gap-1.5"><a href={blobUrl} target="_blank" rel="noreferrer" className="rounded border border-[var(--cl-border)] px-2 py-1 text-[10px] text-[var(--cl-text-soft)]">View PDF</a><button type="button" onClick={download} className="inline-flex items-center gap-1 rounded bg-[var(--cl-primary)] px-2 py-1 text-[10px] font-bold text-[var(--cl-button-text)]"><FaDownload /> Download</button></div> : !file ? <a href={resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded bg-[var(--cl-primary)] px-2 py-1 text-[10px] font-bold text-[var(--cl-button-text)]"><FaExternalLinkAlt /> Open</a> : <a href={contentUrl} target="_blank" rel="noreferrer" className="text-[10px] text-[var(--cl-primary)]">Open</a>}
    </div>
    {loading && <p className="mt-3 text-xs text-[var(--cl-text-muted)]">Loading resource...</p>}
    {error && <p className="mt-3 text-xs text-[var(--cl-danger)]">{error} <a href={resource.url} target="_blank" rel="noreferrer" className="underline">Open original</a></p>}
    {file && isPdf && blobUrl && <iframe title={resource.label} src={blobUrl} className="mt-3 h-48 w-full rounded bg-[var(--cl-surface)]" />}
    {file && isVideo && <video controls preload="metadata" src={resource.url} className="mt-3 w-full rounded" />}
    {embed && <iframe title={resource.label} src={embed} allowFullScreen className="mt-3 aspect-video w-full rounded" />}
  </div>;
}

function RoadmapPdfButton({ roadmapId, filename }) {
  const [error, setError] = useState("");
  const download = async () => {
    try {
      const response = await api.get(`/roadmaps/${roadmapId}/pdf`, { responseType: "blob" });
      const contentType = String(response.headers["content-type"] || "").toLowerCase();
      if (response.status < 200 || response.status >= 300 || !contentType.includes("application/pdf")) throw new Error("Invalid PDF response");
      downloadBlob(response, getDownloadFilename(response, filename || "roadmap.pdf"));
    } catch { setError("The roadmap PDF could not be downloaded."); }
  };
  return <div className="mt-3"><button type="button" onClick={download} className="inline-flex items-center gap-2 rounded-lg border border-[var(--cl-border)] bg-[var(--cl-surface)] px-3 py-2 text-xs text-[var(--cl-text)]"><FaFilePdf className="text-[var(--cl-danger)]" /> Download roadmap PDF</button>{error && <p className="mt-2 text-xs text-[var(--cl-danger)]">{error}</p>}</div>;
}

export default function RoadmapDetails() {
  const { id } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState("");
  const load = async () => { try { const result = await getRoadmap(id); setRoadmap(result.data); } catch (err) { setError(err?.response?.data?.message || "Roadmap unavailable."); } };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [id]);
  const toggle = async (step) => { const completed = !step.completed; await updateRoadmapProgress(id, step.id, completed); setRoadmap((current) => { const steps = current.steps.map((item) => item.id === step.id ? { ...item, completed } : item); return { ...current, steps, progress: steps.length ? Math.round((steps.filter((item) => item.completed).length / steps.length) * 100) : 0 }; }); };
  if (error) return <div className="p-8 text-center text-[var(--cl-danger)]">{error}</div>;
  if (!roadmap) return <div className="p-8 text-center text-[var(--cl-text-muted)]">Loading roadmap...</div>;
  const step = roadmap.steps[selected];
  const completed = roadmap.steps.filter((item) => item.completed).length;
  return <div className="cl-page min-h-full"><div className="mx-auto max-w-[1000px] px-4 py-5 sm:px-6 lg:px-8"><Link to="/student/roadmap-generator" className="inline-flex items-center gap-2 text-[11px] text-[var(--cl-primary)]"><FaArrowLeft /> Back to Roadmap Library</Link><div className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--cl-primary)]">02 / Student <span className="text-[var(--cl-text-muted)]">•</span> Roadmap Details</div><header className="mt-3 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-4"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-xl font-black">&lt;/&gt;</div><div><h1 className="text-xl font-extrabold text-[var(--cl-text)]">{roadmap.title}</h1><p className="mt-1 max-w-xl text-[11px] text-[var(--cl-text-muted)]">{roadmap.shortDescription}</p></div></div><div className="flex gap-4 text-[10px] text-[var(--cl-text-muted)]"><span><strong className="block text-sm text-[var(--cl-text)]">{roadmap.durationWeeks || "—"}</strong>weeks</span><span><strong className="block text-sm text-[var(--cl-text)]">{roadmap.topicCount || 0}</strong>topics</span><span><strong className="block text-sm text-[var(--cl-text)]">{roadmap.progress}%</strong>complete</span></div></div><div className="mt-4 flex items-center justify-between text-[10px] text-[var(--cl-text-muted)]"><span>Learning Progress</span><span>{completed} of {roadmap.steps.length} completed</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--cl-track)]"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${roadmap.progress}%` }} /></div></header><div className="mt-3 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]"><nav className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-3"><h2 className="mb-3 text-sm font-extrabold text-white">Learning steps</h2>{roadmap.steps.length ? roadmap.steps.map((item, index) => <button key={item.id} onClick={() => setSelected(index)} className={`relative flex w-full items-center gap-2 border-l-2 p-2.5 text-left ${selected === index ? "border-blue-400 bg-[#142647]" : "border-[#253653] hover:bg-[var(--cl-surface)]/5"}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${item.completed ? "bg-emerald-500 text-white" : selected === index ? "bg-blue-500 text-white" : "bg-[#1b2b46] text-[var(--cl-text-muted)]"}`}>{item.completed ? <FaCheck /> : index + 1}</span><span className="min-w-0"><strong className="block truncate text-xs text-white">{item.title}</strong><small className="text-[10px] text-[var(--cl-text-muted)]">{item.estimatedTime || "Self-paced"}</small></span></button>) : <p className="text-xs text-[var(--cl-text-muted)]">No learning steps yet.</p>}</nav><section className="rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-4">{step ? <><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cl-primary)]">Step {selected + 1}</p><h2 className="mt-1 text-2xl font-extrabold text-white">{step.title}</h2></div><button onClick={() => toggle(step)} className={`rounded-lg px-3 py-2 text-[11px] font-bold ${step.completed ? "border border-[var(--cl-border)] text-[var(--cl-text-soft)]" : "bg-blue-600 text-white"}`}>{step.completed ? "Mark Incomplete" : "Mark Complete"}</button></div><p className="mt-4 text-sm leading-6 text-[var(--cl-text-soft)]">{step.description}</p>{step.topics?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{step.topics.map((topic) => <span key={topic} className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] text-blue-200">{topic}</span>)}</div>}<div className="mt-5 space-y-2"><h3 className="text-sm font-bold text-white">Learning resources</h3>{step.resources?.length ? step.resources.map((resource) => <ResourceView key={resource.id} resource={resource} />) : <p className="text-xs text-[var(--cl-text-muted)]">No resources for this step.</p>}</div>{step.practiceTask && <div className="mt-4 rounded-lg border border-amber-400/20 bg-amber-500/10 p-3 text-xs leading-5 text-amber-100"><strong>Practice task</strong><p className="mt-1">{step.practiceTask}</p></div>}</> : <div className="flex h-64 items-center justify-center text-sm text-[var(--cl-text-muted)]"><FaLock className="mr-2" /> Select a learning step</div>}</section></div>{roadmap.pdfUrl && <RoadmapPdfButton roadmapId={roadmap.id} filename={roadmap.pdfName} />}</div></div>;
}


