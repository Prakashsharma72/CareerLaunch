import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  FaUser, FaEnvelope, FaPhone, FaUniversity, FaGraduationCap,
  FaMapMarkerAlt, FaGithub, FaLinkedin, FaGlobe, FaFileAlt,
  FaDownload, FaTimes, FaPlus, FaCamera, FaCheck,
  FaBriefcase, FaBookmark, FaRobot, FaStar, FaBolt,
  FaCode, FaFire, FaTrophy, FaMedal, FaLightbulb, FaChartLine,
  FaCalendarAlt, FaBuilding, FaSpinner,
} from "react-icons/fa";
import { updateProfile as updateProfileApi, fetchStats } from "../../services/authService";
import { refreshProfile } from "../../redux/authSlice";

/* ── Shared primitives ─────────────────────────────────────────────────── */
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-white/3 border border-neutral-200/70
      dark:border-white/8 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)]
      dark:shadow-[0_2px_24px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}
function SectionTitle({ children, sub }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-bold text-neutral-800 dark:text-white uppercase tracking-widest">{children}</h3>
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
    ${focused ? "border-blue-500/70 ring-2 ring-blue-500/20" : "border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20"}`;
  return (
    <div className="relative">
      <label htmlFor={id} className={`absolute left-10 pointer-events-none z-10 font-medium transition-all duration-200
        ${active ? "top-1.5 text-[10px] text-blue-500" : "top-1/2 -translate-y-1/2 text-sm text-neutral-400 dark:text-neutral-500"}`}>
        {label}
      </label>
      <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200
        ${focused ? "text-blue-500" : "text-neutral-400 dark:text-neutral-500"}`} />
      {multiline
        ? <textarea id={id} name={name} value={value ?? ""} onChange={onChange} rows={rows} readOnly={readOnly}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className={base} />
        : <input id={id} type={type} name={name} value={value ?? ""} onChange={onChange} readOnly={readOnly}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className={base} />}
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
        <button type="button" onClick={onRemove} className="hover:text-red-500 transition-colors">
          <FaTimes className="text-[9px]" />
        </button>
      )}
    </motion.span>
  );
}
function Ring({ value, size = 80, stroke = 6, color = "#3b82f6" }) {
  const r = (size - stroke * 2) / 2;
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
    <div className="flex justify-end mt-6 pt-5 border-t border-neutral-100 dark:border-white/8">
      <motion.button type="submit" whileHover={!loading ? { y: -1 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
          bg-linear-to-r from-blue-500 to-violet-500
          disabled:opacity-60 disabled:cursor-not-allowed transition-shadow">
        {loading ? <><FaSpinner className="animate-spin text-xs" /> Saving…</>
          : saved  ? <><FaCheck className="text-xs" /> Saved!</>
          : "Save Changes"}
      </motion.button>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────── */
export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  /* ── Form state — seeded from Redux (DB) user ── */
  const [form, setForm] = useState({
    name: "", phone: "", location: "", bio: "",
    dob: "", gender: "", college: "", degree: "", branch: "", gradYear: "",
    education: "", experience: "", languages: "",
    resumeUrl: "", github: "", linkedin: "", portfolio: "",
  });
  const [skillsList,  setSkillsList]  = useState([]);
  const [skillInput,  setSkillInput]  = useState("");
  const [avatarUrl,   setAvatarUrl]   = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [saveError,   setSaveError]   = useState(null);
  const [activeTab,   setActiveTab]   = useState("personal");
  const [stats,       setStats]       = useState(null);
  const fileRef   = useRef();
  const resumeRef = useRef();

  /* ── Seed form from DB user whenever it changes ── */
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
    if (user.skills) {
      setSkillsList(user.skills.split(",").map((s) => s.trim()).filter(Boolean));
    }
    if (user.profileImage) setAvatarUrl(user.profileImage);
  }, [user]);

  /* ── Load dashboard stats ── */
  useEffect(() => {
    fetchStats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skillsList.includes(s)) setSkillsList((p) => [...p, s]);
    setSkillInput("");
  };
  const removeSkill = (s) => setSkillsList((p) => p.filter((x) => x !== s));

  const handleSubmit = async (e) => {
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

  const completionFields = [
    form.name, form.phone, form.college, form.degree,
    skillsList.length > 0 ? "y" : "", form.resumeUrl,
    form.bio, form.github, user?.email,
  ];
  const completion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  const statCards = [
    { label: "Applied",    value: stats?.appliedJobs ?? "—", icon: FaBriefcase },
    { label: "Saved Jobs", value: stats?.savedJobs   ?? "—", icon: FaBookmark  },
    { label: "Resume",     value: stats?.resumeScore != null ? `${stats.resumeScore}%` : "—", icon: FaFileAlt },
    { label: "Interviews", value: stats?.interviews  ?? "—", icon: FaRobot     },
  ];

  const tabs = [
    { id: "personal",     label: "Personal Info" },
    { id: "professional", label: "Professional"  },
    { id: "resume",       label: "Resume"        },
  ];

  const initial = (user?.name || "S")[0].toUpperCase();
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
  const fadeUp  = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header banner ── */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(135deg,#0062c3 0%,#3b82f6 45%,#8b5cf6 100%)" }}>
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/30
                flex items-center justify-center text-4xl font-bold text-white bg-white/20">
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  : initial}
              </div>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center
                  bg-white text-blue-600 shadow-lg hover:scale-110 transition-all">
                <FaCamera className="text-xs" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files[0]; if (f) setAvatarUrl(URL.createObjectURL(f)); }} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{user?.name || "—"}</h1>
              <p className="text-white/70 text-sm mt-1">{user?.email}</p>
              {form.location && <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1"><FaMapMarkerAlt className="text-[10px]" />{form.location}</p>}
              <div className="flex flex-wrap gap-3 mt-4">
                {statCards.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5">
                      <Icon className="text-white/70 text-xs" />
                      <span className="text-white font-bold text-sm">{s.value}</span>
                      <span className="text-white/60 text-xs">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-center gap-1">
              <div className="relative">
                <Ring value={completion} size={76} stroke={6} color="#fff" />
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">{completion}%</div>
              </div>
              <span className="text-white/70 text-xs font-medium">Complete</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid xl:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="xl:col-span-2 space-y-4">
          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-neutral-100/80 dark:bg-white/5 rounded-xl w-fit">
            {tabs.map((t) => (
              <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === t.id ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}>
                {activeTab === t.id && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 bg-white dark:bg-white/10 rounded-lg shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>

          {saveError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-sm text-red-600 dark:text-red-400">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">

              {/* ── PERSONAL ── */}
              {activeTab === "personal" && (
                <motion.div key="personal" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-12 }} transition={{ duration:0.3 }}>
                  <Card className="p-6 md:p-7">
                    <SectionTitle sub="Fetched live from your database account">Personal Information</SectionTitle>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field id="name"     label="Full Name"       name="name"     value={form.name}     onChange={handleChange} icon={FaUser}        />
                      <Field id="email"    label="Email Address"   name="email"    value={user?.email}   onChange={() => {}}     icon={FaEnvelope} readOnly />
                      <Field id="phone"    label="Phone Number"    name="phone"    value={form.phone}    onChange={handleChange} icon={FaPhone}       />
                      <Field id="dob"      label="Date of Birth"   name="dob"      value={form.dob}      onChange={handleChange} icon={FaCalendarAlt} type="date" />
                      <Field id="gender"   label="Gender"          name="gender"   value={form.gender}   onChange={handleChange} icon={FaUser}        />
                      <Field id="location" label="Current City"    name="location" value={form.location} onChange={handleChange} icon={FaMapMarkerAlt} />
                    </div>
                    <div className="mt-4">
                      <Field id="bio" label="Bio / About Me" name="bio" value={form.bio} onChange={handleChange} icon={FaUser} multiline rows={3} />
                    </div>
                    <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-white/8">
                      <SectionTitle sub="Academic background">Education</SectionTitle>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field id="college"   label="College / University" name="college"   value={form.college}   onChange={handleChange} icon={FaUniversity}    />
                        <Field id="degree"    label="Degree"               name="degree"    value={form.degree}    onChange={handleChange} icon={FaGraduationCap} />
                        <Field id="branch"    label="Branch / Major"       name="branch"    value={form.branch}    onChange={handleChange} icon={FaBuilding}      />
                        <Field id="gradYear"  label="Graduation Year"      name="gradYear"  value={form.gradYear}  onChange={handleChange} icon={FaCalendarAlt}   />
                      </div>
                      <div className="mt-4">
                        <Field id="education" label="Education Summary" name="education" value={form.education} onChange={handleChange} icon={FaGraduationCap} multiline rows={3} />
                      </div>
                    </div>
                    <SaveBtn loading={saving} saved={saved} />
                  </Card>
                </motion.div>
              )}

              {/* ── PROFESSIONAL ── */}
              {activeTab === "professional" && (
                <motion.div key="professional" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-12 }} transition={{ duration:0.3 }}>
                  <Card className="p-6 md:p-7 space-y-6">
                    <div>
                      <SectionTitle sub="Saved in MySQL — drives job matching">Skills</SectionTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <AnimatePresence>
                          {skillsList.map((s) => <SkillChip key={s} label={s} onRemove={() => removeSkill(s)} />)}
                        </AnimatePresence>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <FaCode className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400" />
                          <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                            placeholder="Add a skill and press Enter"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10
                              bg-white/60 dark:bg-white/5 text-sm text-neutral-800 dark:text-white
                              placeholder-neutral-400 outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                        </div>
                        <button type="button" onClick={addSkill}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                            bg-linear-to-r from-blue-500 to-violet-500">
                          <FaPlus className="text-xs" /> Add
                        </button>
                      </div>
                    </div>
                    <div>
                      <SectionTitle sub="Work history summary">Experience</SectionTitle>
                      <Field id="experience" label="Experience" name="experience" value={form.experience} onChange={handleChange} icon={FaBriefcase} multiline rows={3} />
                    </div>
                    <div>
                      <SectionTitle sub="Languages you speak">Languages</SectionTitle>
                      <Field id="languages" label="Languages Known" name="languages" value={form.languages} onChange={handleChange} icon={FaGlobe} />
                    </div>
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
                <motion.div key="resume" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-12 }} transition={{ duration:0.3 }}>
                  <Card className="p-6 md:p-7 space-y-5">
                    <SectionTitle sub="Stored in MySQL — used by Resume Analyzer">Resume</SectionTitle>
                    <Field id="resumeUrl" label="Resume URL (Cloudinary / Drive)" name="resumeUrl" value={form.resumeUrl} onChange={handleChange} icon={FaGlobe} />
                    {form.resumeUrl && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200/60 dark:border-green-500/20">
                        <FaFileAlt className="text-green-600 dark:text-green-400 text-lg shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-neutral-800 dark:text-white truncate">{form.resumeUrl}</p>
                        </div>
                        <a href={form.resumeUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                            text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-100 transition-colors">
                          <FaDownload className="text-[10px]" /> Open
                        </a>
                      </div>
                    )}
                    <SaveBtn loading={saving} saved={saved} />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* ── Right column ── */}
        <motion.div variants={fadeUp} className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-linear-to-br from-blue-500 to-violet-500">
                <FaChartLine className="text-white text-[10px]" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white">Career Progress</h3>
            </div>
            {[
              { label: "Profile Completion",  value: completion,                                    colors: "from-blue-400 to-blue-600"   },
              { label: "Resume Score",        value: stats?.resumeScore ?? 0,                        colors: "from-green-400 to-green-600" },
              { label: "Interview Readiness", value: Math.min((stats?.interviews ?? 0) * 20, 100),  colors: "from-violet-400 to-violet-600" },
            ].map((p, i) => (
              <div key={i} className="mb-4 last:mb-0">
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

          <Card className="p-5">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-white mb-4">Account Info</h3>
            <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2"><FaEnvelope className="text-blue-400 text-xs shrink-0" /><span className="truncate">{user?.email || "—"}</span></div>
              <div className="flex items-center gap-2"><FaUser      className="text-violet-400 text-xs shrink-0" /><span className="capitalize">{user?.role || "student"}</span></div>
              {user?.createdAt && <div className="flex items-center gap-2"><FaCalendarAlt className="text-green-400 text-xs shrink-0" /><span>Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>}
              {form.github    && <a href={form.github}    target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition-colors"><FaGithub   className="text-xs shrink-0" /><span className="truncate">GitHub</span></a>}
              {form.linkedin  && <a href={form.linkedin}  target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition-colors"><FaLinkedin className="text-xs shrink-0" /><span className="truncate">LinkedIn</span></a>}
              {form.portfolio && <a href={form.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-blue-500 transition-colors"><FaGlobe    className="text-xs shrink-0" /><span className="truncate">Portfolio</span></a>}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-linear-to-br from-blue-500 to-violet-500">
                <FaLightbulb className="text-white text-[10px]" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white">AI Career Tips</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { icon: FaBolt,      text: "Add a portfolio URL to boost profile visibility by 40%.",   color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" },
                { icon: FaFire,      text: !form.github ? "Connect your GitHub to showcase projects." : "GitHub connected — great for recruiters!", color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10" },
                { icon: FaLightbulb, text: skillsList.length < 5 ? "Add more skills to match more job requirements." : `${skillsList.length} skills added — keep it up!`, color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" },
              ].map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 dark:bg-white/4 border border-neutral-100 dark:border-white/6">
                    <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center ${t.color}`}><Icon className="text-[10px]" /></div>
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
