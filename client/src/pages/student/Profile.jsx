/**
 * Profile.jsx — Student profile page
 *
 * Responsive:
 *  Mobile  : stacked single-column layout, horizontally scrollable tab bar
 *  Tablet  : 2-col form fields, right sidebar moves below on < xl
 *  Desktop : xl:grid-cols-3 with form (2 cols) + sidebar (1 col)
 *
 * Dark-mode: all cards use dark: variants.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  FaUser, FaEnvelope, FaPhone, FaUniversity, FaGraduationCap,
  FaMapMarkerAlt, FaGithub, FaLinkedin, FaGlobe, FaFileAlt,
  FaDownload, FaTimes, FaPlus, FaCamera, FaCheck,
  FaBriefcase, FaBookmark, FaRobot, FaStar,
  FaCode, FaFire, FaTrophy, FaMedal, FaLightbulb, FaChartLine,
  FaCalendarAlt, FaBuilding, FaSpinner, FaBolt,
} from "react-icons/fa";
import { updateProfile as updateProfileApi, fetchStats, uploadResumeFile, uploadAvatarFile } from "../../services/authService";
import { refreshProfile } from "../../redux/authSlice";

/* ── Shared primitives ── */
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-white/3
      border border-neutral-200/70 dark:border-white/8
      rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)]
      dark:shadow-[0_2px_24px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-4 sm:mb-5">
      <h3 className="text-xs font-bold text-neutral-800 dark:text-white uppercase tracking-widest">
        {children}
      </h3>
      {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Field({ id, label, type = "text", name, value, onChange, readOnly, icon: Icon, multiline, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  const active = focused || (value && String(value).length > 0);
  const base = `w-full pl-10 pr-4 ${multiline ? "pt-5 pb-2" : "pt-5 pb-1.5"} rounded-xl border text-sm font-medium
    bg-white/60 dark:bg-white/5 text-neutral-900 dark:text-white
    placeholder-neutral-400 dark:placeholder-neutral-600 outline-none resize-none transition-all duration-200
    ${readOnly ? "opacity-60 cursor-default" : ""}
    ${focused
      ? "border-blue-500/70 ring-2 ring-blue-500/20"
      : "border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20"}`;
  return (
    <div className="relative">
      <label htmlFor={id}
        className={`absolute left-10 pointer-events-none z-10 font-medium transition-all duration-200
          ${active
            ? "top-1.5 text-[10px] text-blue-500"
            : "top-1/2 -translate-y-1/2 text-sm text-neutral-400 dark:text-neutral-500"}`}>
        {label}
      </label>
      <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200
        ${focused ? "text-blue-500" : "text-neutral-400 dark:text-neutral-500"}`} />
      {multiline
        ? <textarea id={id} name={name} value={value ?? ""} onChange={onChange}
            rows={rows} readOnly={readOnly}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            className={base} />
        : <input id={id} type={type} name={name} value={value ?? ""} onChange={onChange}
            readOnly={readOnly}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            className={base} />}
    </div>
  );
}

function SkillChip({ label, onRemove }) {
  return (
    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.18 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
        bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300
        border border-blue-200 dark:border-blue-500/25">
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove}
          className="hover:text-red-500 transition-colors">
          <FaTimes className="text-[9px]" />
        </button>
      )}
    </motion.span>
  );
}

function Ring({ value, size = 76, stroke = 6, color = "#3b82f6" }) {
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke}
        className="text-neutral-200 dark:text-white/10" />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (value / 100) * circ }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }} />
    </svg>
  );
}

function SaveBtn({ loading, saved }) {
  return (
    <div className="flex justify-end mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-neutral-100 dark:border-white/8">
      <motion.button type="submit"
        whileHover={!loading ? { y: -1 } : {}}
        whileTap={!loading ? { scale: 0.97 } : {}}
        disabled={loading}
        className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold text-white
          bg-linear-to-r from-blue-500 to-violet-500
          disabled:opacity-60 disabled:cursor-not-allowed transition-shadow">
        {loading
          ? <><FaSpinner className="animate-spin text-xs" /> Saving…</>
          : saved
          ? <><FaCheck className="text-xs" /> Saved!</>
          : "Save Changes"}
      </motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: "", phone: "", location: "", bio: "",
    dob: "", gender: "", college: "", degree: "", branch: "", gradYear: "",
    education: "", experience: "", languages: "",
    resumeUrl: "", github: "", linkedin: "", portfolio: "",
  });
  const [skillsList, setSkillsList] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [avatarUrl,      setAvatarUrl]      = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [saved,          setSaved]          = useState(false);
  const [saveError,      setSaveError]      = useState(null);
  const [activeTab,      setActiveTab]      = useState("personal");
  const [stats,          setStats]          = useState(null);
  // upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress,  setAvatarProgress]  = useState(0);
  const [avatarError,     setAvatarError]     = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeProgress,  setResumeProgress]  = useState(0);
  const [resumeError,     setResumeError]     = useState(null);
  const [resumeSuccess,   setResumeSuccess]   = useState(false);
  const fileRef   = useRef();
  const resumeRef = useRef();

  /* seed from Redux user */
  useEffect(() => {
    if (!user) return;
    setForm({
      name:       user.name       ?? "",
      phone:      user.phone      ?? "",
      location:   user.location   ?? "",
      bio:        user.bio        ?? "",
      dob:        user.dob        ?? "",
      gender:     user.gender     ?? "",
      college:    user.college    ?? "",
      degree:     user.degree     ?? "",
      branch:     user.branch     ?? "",
      gradYear:   user.gradYear   ?? "",
      education:  user.education  ?? "",
      experience: user.experience ?? "",
      languages:  user.languages  ?? "",
      resumeUrl:  user.resumeUrl  ?? "",
      github:     user.github     ?? "",
      linkedin:   user.linkedin   ?? "",
      portfolio:  user.portfolio  ?? "",
    });
    if (user.skills)       setSkillsList(user.skills.split(",").map(s => s.trim()).filter(Boolean));
    if (user.profileImage) setAvatarUrl(user.profileImage);
  }, [user]);

  useEffect(() => {
    fetchStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skillsList.includes(s)) setSkillsList(p => [...p, s]);
    setSkillInput("");
  };
  const removeSkill = s => setSkillsList(p => p.filter(x => x !== s));

  const handleResumeUpload = async (file) => {
    setResumeError(null);
    setResumeSuccess(false);
    setResumeUploading(true);
    setResumeProgress(0);
    try {
      const res = await uploadResumeFile(file, setResumeProgress);
      setForm(p => ({ ...p, resumeUrl: res.data.resumeUrl }));
      await dispatch(refreshProfile());
      setResumeSuccess(true);
      setTimeout(() => setResumeSuccess(false), 4000);
    } catch (err) {
      setResumeError(err?.response?.data?.message || "Resume upload failed");
    } finally {
      setResumeUploading(false);
      setResumeProgress(0);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true); setSaveError(null);
    try {
      await updateProfileApi({ ...form, skills: skillsList.join(", ") });
      await dispatch(refreshProfile());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* completion ring */
  const completionFields = [
    form.name, form.phone, form.college, form.degree,
    skillsList.length > 0 ? "y" : "", form.resumeUrl,
    form.bio, form.github, user?.email,
  ];
  const completion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  const statCards = [
    { label: "Saved Jobs",     value: stats?.savedJobs     ?? "—", icon: FaBookmark  },
    { label: "Saved Companies",value: stats?.savedCompanies ?? "—", icon: FaBriefcase },
    { label: "Resume",         value: stats?.resumeScore != null ? `${stats.resumeScore}%` : "—", icon: FaFileAlt },
    { label: "Interviews",     value: stats?.interviews    ?? "—", icon: FaRobot     },
  ];

  const tabs = [
    { id: "personal",     label: "Personal Info" },
    { id: "professional", label: "Professional"  },
    { id: "resume",       label: "Resume"        },
  ];

  const initial = (user?.name || "S")[0].toUpperCase();
  const stagger  = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
  const fadeUp   = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible"
      className="space-y-4 sm:space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

      {/* ── Header banner ── */}
      <motion.div variants={fadeUp}
        className="relative overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(135deg,#0062c3 0%,#3b82f6 45%,#8b5cf6 100%)" }}>
        <div className="relative z-10 p-4 sm:p-6 md:p-8">

          {/* top row: avatar + info — full row on all sizes */}
          <div className="flex flex-row items-start gap-3 sm:gap-6">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden
                ring-4 ring-white/30 flex items-center justify-center
                text-2xl sm:text-3xl md:text-4xl font-bold text-white bg-white/20">
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" loading="lazy" className="w-full h-full object-cover" />
                  : initial}
                {/* Upload overlay */}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-2xl">
                    <FaSpinner className="animate-spin text-white text-lg" />
                    <span className="text-white text-[10px] mt-1">{avatarProgress}%</span>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-xl
                  flex items-center justify-center bg-white text-blue-600
                  shadow-lg hover:scale-110 transition-all disabled:opacity-60">
                <FaCamera className="text-[9px] sm:text-[10px]" />
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={async e => {
                  const f = e.target.files[0];
                  if (!f) return;
                  // Show local preview immediately
                  setAvatarUrl(URL.createObjectURL(f));
                  setAvatarError(null);
                  setAvatarUploading(true);
                  setAvatarProgress(0);
                  try {
                    const res = await uploadAvatarFile(f, setAvatarProgress);
                    setAvatarUrl(res.data.profileImage);
                    await dispatch(refreshProfile());
                  } catch (err) {
                    setAvatarError(err?.response?.data?.message || "Avatar upload failed");
                  } finally {
                    setAvatarUploading(false);
                    setAvatarProgress(0);
                    e.target.value = "";
                  }
                }} />
            </div>

            {/* Name + stats chips */}
            <div className="flex-1 min-w-0">
              {avatarError && (
                <p className="text-red-300 text-[10px] mb-1">{avatarError}</p>
              )}
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white truncate">
                {user?.name || "—"}
              </h1>
              <p className="text-white/70 text-[11px] sm:text-sm mt-0.5 truncate">{user?.email}</p>
              {form.location && (
                <p className="text-white/60 text-[11px] mt-0.5 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-[9px] shrink-0" />
                  <span className="truncate">{form.location}</span>
                </p>
              )}
              {/* stat chips — 2-col grid on mobile, flex-wrap on sm+ */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                {statCards.map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label}
                      className="flex items-center gap-1 sm:gap-1.5 bg-white/15 border border-white/20
                        rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 min-w-0 overflow-hidden">
                      <Icon className="text-white/70 text-[9px] sm:text-[10px] shrink-0" />
                      <span className="text-white font-bold text-[11px] sm:text-xs truncate">{s.value}</span>
                      <span className="text-white/60 text-[9px] sm:text-[10px] truncate hidden xs:inline sm:inline">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Completion ring — hidden on mobile to save space */}
            <div className="hidden sm:flex shrink-0 flex-col items-center gap-1 self-center">
              <div className="relative">
                <Ring value={completion} size={56} stroke={5} color="#fff" />
                <div className="absolute inset-0 flex items-center justify-center
                  text-white font-bold text-sm">
                  {completion}%
                </div>
              </div>
              <span className="text-white/70 text-[10px] font-medium">Complete</span>
            </div>
          </div>

          {/* Mobile-only completion bar */}
          <div className="sm:hidden mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/70 text-[11px]">Profile Completion</span>
              <span className="text-white font-bold text-[11px]">{completion}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Main grid: form (2/3) + sidebar (1/3) — stacks below xl ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">

        {/* ── Form column ── */}
        <motion.div variants={fadeUp} className="xl:col-span-2 space-y-4">

          {/* Tab bar — horizontally scrollable on mobile */}
          <div className="overflow-x-auto pb-0.5 -mx-1 px-1">
            <div className="flex gap-1 p-1 bg-neutral-100/80 dark:bg-white/5 rounded-xl w-fit min-w-full sm:min-w-0">
              {tabs.map(t => (
                <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                  className={`relative px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium
                    whitespace-nowrap transition-all duration-200
                    ${activeTab === t.id
                      ? "text-neutral-900 dark:text-white"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}>
                  {activeTab === t.id && (
                    <motion.div layoutId="tab-bg"
                      className="absolute inset-0 bg-white dark:bg-white/10 rounded-lg shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
                  )}
                  <span className="relative z-10">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save error */}
          {saveError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20
              border border-red-200 dark:border-red-500/30 text-sm text-red-600 dark:text-red-400">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">

              {/* ── PERSONAL ── */}
              {activeTab === "personal" && (
                <motion.div key="personal"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                  <Card className="p-4 sm:p-6 md:p-7">
                    <SectionTitle sub="Fetched live from your database account">
                      Personal Information
                    </SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Field id="name"     label="Full Name"     name="name"     value={form.name}     onChange={handleChange} icon={FaUser}         />
                      <Field id="email"    label="Email Address" name="email"    value={user?.email}   onChange={() => {}}     icon={FaEnvelope} readOnly />
                      <Field id="phone"    label="Phone Number"  name="phone"    value={form.phone}    onChange={handleChange} icon={FaPhone}        />
                      <Field id="dob"      label="Date of Birth" name="dob"      value={form.dob}      onChange={handleChange} icon={FaCalendarAlt} type="date" />
                      <Field id="gender"   label="Gender"        name="gender"   value={form.gender}   onChange={handleChange} icon={FaUser}         />
                      <Field id="location" label="Current City"  name="location" value={form.location} onChange={handleChange} icon={FaMapMarkerAlt} />
                    </div>
                    <div className="mt-3 sm:mt-4">
                      <Field id="bio" label="Bio / About Me" name="bio" value={form.bio} onChange={handleChange} icon={FaUser} multiline rows={3} />
                    </div>
                    <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-neutral-100 dark:border-white/8">
                      <SectionTitle sub="Academic background">Education</SectionTitle>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <Field id="college"  label="College / University" name="college"  value={form.college}  onChange={handleChange} icon={FaUniversity}    />
                        <Field id="degree"   label="Degree"               name="degree"   value={form.degree}   onChange={handleChange} icon={FaGraduationCap} />
                        <Field id="branch"   label="Branch / Major"       name="branch"   value={form.branch}   onChange={handleChange} icon={FaBuilding}      />
                        <Field id="gradYear" label="Graduation Year"      name="gradYear" value={form.gradYear} onChange={handleChange} icon={FaCalendarAlt}   />
                      </div>
                      <div className="mt-3 sm:mt-4">
                        <Field id="education" label="Education Summary" name="education" value={form.education} onChange={handleChange} icon={FaGraduationCap} multiline rows={3} />
                      </div>
                    </div>
                    <SaveBtn loading={saving} saved={saved} />
                  </Card>
                </motion.div>
              )}

              {/* ── PROFESSIONAL ── */}
              {activeTab === "professional" && (
                <motion.div key="professional"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                  <Card className="p-4 sm:p-6 md:p-7 space-y-5 sm:space-y-6">
                    {/* Skills */}
                    <div>
                      <SectionTitle sub="Saved in MySQL — drives job matching">Skills</SectionTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <AnimatePresence>
                          {skillsList.map(s => <SkillChip key={s} label={s} onRemove={() => removeSkill(s)} />)}
                        </AnimatePresence>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 relative min-w-0">
                          <FaCode className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400" />
                          <input value={skillInput}
                            onChange={e => setSkillInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                            placeholder="Add a skill and press Enter"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10
                              bg-white/60 dark:bg-white/5 text-sm text-neutral-800 dark:text-white
                              placeholder-neutral-400 outline-none
                              focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                        </div>
                        <button type="button" onClick={addSkill}
                          className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold
                            text-white bg-linear-to-r from-blue-500 to-violet-500 shrink-0">
                          <FaPlus className="text-xs" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>
                    </div>
                    {/* Experience */}
                    <div>
                      <SectionTitle sub="Work history summary">Experience</SectionTitle>
                      <Field id="experience" label="Experience" name="experience" value={form.experience} onChange={handleChange} icon={FaBriefcase} multiline rows={3} />
                    </div>
                    {/* Languages */}
                    <div>
                      <SectionTitle sub="Languages you speak">Languages</SectionTitle>
                      <Field id="languages" label="Languages Known" name="languages" value={form.languages} onChange={handleChange} icon={FaGlobe} />
                    </div>
                    {/* Links */}
                    <div>
                      <SectionTitle sub="Online presence">Links</SectionTitle>
                      <div className="space-y-3">
                        <Field id="github"    label="GitHub URL"    name="github"    value={form.github}    onChange={handleChange} icon={FaGithub}   />
                        <Field id="linkedin"  label="LinkedIn URL"  name="linkedin"  value={form.linkedin}  onChange={handleChange} icon={FaLinkedin} />
                        <Field id="portfolio" label="Portfolio URL" name="portfolio" value={form.portfolio} onChange={handleChange} icon={FaGlobe}    />
                      </div>
                    </div>
                    <SaveBtn loading={saving} saved={saved} />
                  </Card>
                </motion.div>
              )}

              {/* ── RESUME ── */}
              {activeTab === "resume" && (
                <motion.div key="resume"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                  <Card className="p-4 sm:p-6 md:p-7 space-y-4 sm:space-y-5">
                    <SectionTitle sub="Upload PDF — stored in Cloudinary, URL saved to your profile">Resume</SectionTitle>

                    {/* ── Drop zone ── */}
                    <div
                      onClick={() => resumeRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={async e => {
                        e.preventDefault();
                        const f = e.dataTransfer.files[0];
                        if (f) resumeRef.current && handleResumeUpload(f);
                      }}
                      className="relative flex flex-col items-center justify-center gap-3 p-8
                        border-2 border-dashed border-neutral-300 dark:border-white/15
                        rounded-2xl cursor-pointer
                        hover:border-blue-400 dark:hover:border-blue-500/60
                        hover:bg-blue-50/40 dark:hover:bg-blue-500/5
                        transition-all duration-200">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center
                        bg-blue-100 dark:bg-blue-500/15">
                        <FaFileAlt className="text-blue-500 dark:text-blue-400 text-xl" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-neutral-700 dark:text-white">
                          {resumeUploading ? "Uploading…" : "Click or drag & drop your resume"}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">PDF only · max 5 MB</p>
                      </div>
                      <input ref={resumeRef} type="file" accept="application/pdf" className="hidden"
                        onChange={e => {
                          const f = e.target.files[0];
                          if (f) handleResumeUpload(f);
                          e.target.value = "";
                        }} />
                    </div>

                    {/* ── Progress bar ── */}
                    {resumeUploading && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                            <FaSpinner className="animate-spin text-blue-500" /> Uploading to Cloudinary…
                          </span>
                          <span className="font-bold text-blue-500">{resumeProgress}%</span>
                        </div>
                        <div className="h-2 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                            animate={{ width: `${resumeProgress}%` }}
                            transition={{ duration: 0.3 }} />
                        </div>
                      </div>
                    )}

                    {/* ── Error ── */}
                    {resumeError && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl
                        bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30
                        text-sm text-red-600 dark:text-red-400">
                        <FaTimes className="shrink-0" /> {resumeError}
                      </div>
                    )}

                    {/* ── Success / current resume ── */}
                    {form.resumeUrl && (
                      <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl
                        bg-green-50 dark:bg-green-500/10
                        border border-green-200/60 dark:border-green-500/20">
                        <FaFileAlt className="text-green-600 dark:text-green-400 text-lg shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            {resumeSuccess ? "✅ Resume uploaded successfully!" : "Current resume"}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                            {form.resumeUrl}
                          </p>
                        </div>
                        <a href={form.resumeUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                            text-blue-600 dark:text-blue-400
                            bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-100 transition-colors shrink-0">
                          <FaDownload className="text-[10px]" /> Open
                        </a>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* ── Right sidebar — 2-col grid on tablet, single col on mobile/desktop ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-5 content-start">

          {/* Career Progress */}
          <Card className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center
                bg-linear-to-br from-blue-500 to-violet-500">
                <FaChartLine className="text-white text-[10px]" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white">Career Progress</h3>
            </div>
            {[
              { label: "Profile Completion",  value: completion,                                    colors: "from-blue-400 to-blue-600"    },
              { label: "Resume Score",        value: stats?.resumeScore ?? 0,                        colors: "from-green-400 to-green-600"  },
              { label: "Interview Readiness", value: Math.min((stats?.interviews ?? 0) * 20, 100),  colors: "from-violet-400 to-violet-600" },
            ].map((p, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{p.label}</span>
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{p.value}%</span>
                </div>
                <div className="h-1.5 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full bg-linear-to-r ${p.colors}`}
                    initial={{ width: 0 }} animate={{ width: `${p.value}%` }}
                    transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 + i * 0.1 }} />
                </div>
              </div>
            ))}
          </Card>

          {/* Account Info */}
          <Card className="p-4 sm:p-5">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-white mb-3">Account Info</h3>
            <div className="space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2 min-w-0">
                <FaEnvelope className="text-blue-400 text-xs shrink-0" />
                <span className="truncate">{user?.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUser className="text-violet-400 text-xs shrink-0" />
                <span className="capitalize">{user?.role || "student"}</span>
              </div>
              {user?.createdAt && (
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-green-400 text-xs shrink-0" />
                  <span className="text-xs">Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              )}
              {form.github    && <a href={form.github}    target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition-colors min-w-0"><FaGithub   className="text-xs shrink-0" /><span className="truncate">GitHub</span></a>}
              {form.linkedin  && <a href={form.linkedin}  target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition-colors min-w-0"><FaLinkedin className="text-xs shrink-0" /><span className="truncate">LinkedIn</span></a>}
              {form.portfolio && <a href={form.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition-colors min-w-0"><FaGlobe    className="text-xs shrink-0" /><span className="truncate">Portfolio</span></a>}
            </div>
          </Card>

          {/* AI Tips */}
          <Card className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center
                bg-linear-to-br from-blue-500 to-violet-500">
                <FaLightbulb className="text-white text-[10px]" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white">AI Career Tips</h3>
            </div>
            <div className="space-y-2">
              {[
                { icon: FaBolt,      text: "Add a portfolio URL to boost profile visibility by 40%.",   color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" },
                { icon: FaFire,      text: !form.github ? "Connect your GitHub to showcase projects." : "GitHub connected — great for recruiters!", color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10" },
                { icon: FaLightbulb, text: skillsList.length < 5 ? "Add more skills to match more job requirements." : `${skillsList.length} skills added — keep it up!`, color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" },
              ].map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl
                    bg-neutral-50 dark:bg-white/4
                    border border-neutral-100 dark:border-white/6">
                    <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center ${t.color}`}>
                      <Icon className="text-[10px]" />
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{t.text}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
