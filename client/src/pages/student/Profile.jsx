import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser, FaEnvelope, FaPhone, FaUniversity, FaGraduationCap,
  FaMapMarkerAlt, FaGithub, FaLinkedin, FaGlobe, FaFileAlt,
  FaDownload, FaTimes, FaPlus, FaCamera, FaCheck,
  FaBriefcase, FaBookmark, FaRobot, FaStar, FaBolt,
  FaCode, FaFire, FaTrophy, FaMedal, FaLightbulb, FaChartLine,
  FaCalendarAlt, FaTransgender, FaBuilding,
} from "react-icons/fa";
import { useSelector } from "react-redux";

/* ══════════════ SHARED PRIMITIVES ══════════════ */

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-white/3 border border-neutral-200/70
      dark:border-white/8 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)]
      dark:shadow-[0_2px_24px_rgba(0,0,0,0.3)] backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-neutral-800 dark:text-white uppercase tracking-widest">{children}</h3>
      {sub && <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{sub}</p>}
    </div>
  );
}

/* Floating-label input */
function Field({ id, label, type = "text", name, value, onChange, placeholder, readOnly, icon: Icon, multiline, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  const active = focused || (value && value.length > 0);
  const base = `w-full pl-10 pr-4 ${multiline ? "pt-5 pb-2" : "pt-5 pb-1.5"} rounded-xl border text-sm font-medium
    bg-white/60 dark:bg-white/5 backdrop-blur-sm text-neutral-900 dark:text-white
    placeholder-neutral-400 dark:placeholder-neutral-600 transition-all duration-200 outline-none resize-none
    ${readOnly ? "opacity-60 cursor-default" : ""}
    ${focused
      ? "border-primary-500/70 ring-2 ring-primary-500/20 shadow-[0_0_0_4px_rgba(11,165,255,0.08)]"
      : "border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20"}`;
  return (
    <div className="relative">
      <label htmlFor={id}
        className={`absolute left-10 pointer-events-none z-10 font-medium transition-all duration-200
          ${active ? "top-1.5 text-[10px] text-primary-500 dark:text-primary-400"
                   : "top-1/2 -translate-y-1/2 text-sm text-neutral-400 dark:text-neutral-500"
          }`}>
        {label}
      </label>
      <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200
        ${focused ? "text-primary-500 dark:text-primary-400" : "text-neutral-400 dark:text-neutral-500"}`}
        aria-hidden="true" />
      {multiline ? (
        <textarea id={id} name={name} value={value} onChange={onChange} rows={rows}
          readOnly={readOnly} placeholder={focused ? placeholder : ""}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className={base} />
      ) : (
        <input id={id} type={type} name={name} value={value} onChange={onChange}
          readOnly={readOnly} placeholder={focused ? placeholder : ""}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className={base} />
      )}
    </div>
  );
}

/* Select field */
function SelectField({ id, label, name, value, onChange, options, icon: Icon }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative">
      <label htmlFor={id}
        className={`absolute left-10 pointer-events-none z-10 font-medium transition-all duration-200
          ${active ? "top-1.5 text-[10px] text-primary-500 dark:text-primary-400"
                   : "top-1/2 -translate-y-1/2 text-sm text-neutral-400 dark:text-neutral-500"}`}>
        {label}
      </label>
      <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200 z-10
        ${focused ? "text-primary-500 dark:text-primary-400" : "text-neutral-400 dark:text-neutral-500"}`}
        aria-hidden="true" />
      <select id={id} name={name} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className={`w-full pl-10 pr-4 pt-5 pb-1.5 rounded-xl border text-sm font-medium appearance-none
          bg-white/60 dark:bg-white/5 text-neutral-900 dark:text-white outline-none transition-all duration-200
          ${focused ? "border-primary-500/70 ring-2 ring-primary-500/20 shadow-[0_0_0_4px_rgba(11,165,255,0.08)]"
                    : "border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20"}`}>
        <option value="">{/* placeholder shown via floating label */}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* SVG progress ring */
function Ring({ value, size = 80, stroke = 6, color = "#0ba5ff" }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor"
        strokeWidth={stroke} className="text-neutral-200 dark:text-white/10" />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (value / 100) * circ }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }} />
    </svg>
  );
}

/* Skill chip */
function SkillChip({ label, onRemove }) {
  return (
    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.18 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
        bg-primary-100 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300
        border border-primary-200 dark:border-primary-500/25">
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${label}`}
          className="hover:text-red-500 transition-colors leading-none">
          <FaTimes className="text-[9px]" />
        </button>
      )}
    </motion.span>
  );
}

/* ══════════════ MAIN COMPONENT ══════════════ */
function Profile() {
  const { user } = useSelector((s) => s.auth);

  /* ─── existing state (preserved exactly) ─── */
  const [profile, setProfile] = useState({
    name:      user?.name  || "Prakash Sharma",
    email:     user?.email || "prakash@gmail.com",
    phone:     "",
    education: "",
    skills:    "",
    resumeUrl: "",
  });
  const [loading, setLoading] = useState(false);

  /* ─── extended UI-only state ─── */
  const [extraProfile, setExtraProfile] = useState({
    dob: "", gender: "", college: "", degree: "", branch: "",
    gradYear: "", city: "", bio: "",
    github: "", linkedin: "", portfolio: "",
    languages: "",
  });
  const [skillsList, setSkillsList]   = useState(["React", "Node.js", "PostgreSQL"]);
  const [skillInput, setSkillInput]   = useState("");
  const [avatarUrl, setAvatarUrl]     = useState(null);
  const [dragOver, setDragOver]       = useState(false);
  const [saved, setSaved]             = useState(false);
  const [activeTab, setActiveTab]     = useState("personal");
  const fileRef  = useRef();
  const resumeRef= useRef();

  /* ─── existing handlers (preserved exactly) ─── */
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("Profile Data:", profile);
      // API Call Here
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      alert("Profile Updated Successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  /* ─── UI-only handlers ─── */
  const handleExtra = (e) => setExtraProfile({ ...extraProfile, [e.target.name]: e.target.value });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skillsList.includes(s)) { setSkillsList([...skillsList, s]); }
    setSkillInput("");
  };
  const removeSkill = (s) => setSkillsList(skillsList.filter((x) => x !== s));

  const onAvatarPick = (e) => {
    const f = e.target.files[0];
    if (f) setAvatarUrl(URL.createObjectURL(f));
  };
  const onResumeDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setProfile((p) => ({ ...p, resumeUrl: f.name }));
  }, []);

  /* ─── derived ─── */
  const initial = (profile.name || "S")[0].toUpperCase();
  const completionFields = [
    profile.name, profile.email, profile.phone, extraProfile.college,
    extraProfile.degree, skillsList.length > 0 ? "y" : "",
    profile.resumeUrl, extraProfile.bio, extraProfile.github,
  ];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  const stats = [
    { label: "Applied", value: 12, icon: FaBriefcase, color: "text-primary-500 bg-primary-50 dark:bg-primary-500/10" },
    { label: "Saved",   value: 8,  icon: FaBookmark,  color: "text-success-600 bg-success-50 dark:bg-success-500/10" },
    { label: "Resume",  value: "85%", icon: FaFileAlt, color: "text-warning-600 bg-warning-50 dark:bg-warning-500/10" },
    { label: "Interviews", value: 5, icon: FaRobot,   color: "text-accent-600 bg-accent-50 dark:bg-accent-500/10" },
  ];

  const badges = [
    { icon: FaTrophy, label: "Job Hunter",   color: "text-yellow-500",  bg: "bg-yellow-50 dark:bg-yellow-500/10", earned: true  },
    { icon: FaMedal,  label: "Resume Pro",   color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-500/10",    earned: true  },
    { icon: FaFire,   label: "On a Streak",  color: "text-orange-500",  bg: "bg-orange-50 dark:bg-orange-500/10",earned: true  },
    { icon: FaStar,   label: "Top Learner",  color: "text-purple-500",  bg: "bg-purple-50 dark:bg-purple-500/10",earned: false },
  ];

  const aiTips = [
    { icon: FaBolt,      text: "Add a portfolio URL to boost profile visibility by 40%.",  color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10" },
    { icon: FaCode,      text: "Add 3+ more skills to match senior-level job requirements.", color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10"     },
    { icon: FaLightbulb, text: "Complete your bio to improve recruiter response rate.",      color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" },
  ];

  const activity = [
    { text: "Applied to React Developer at Google",  time: "2h ago",  dot: "bg-primary-500"  },
    { text: "Resume analyzed — score: 85%",           time: "5h ago",  dot: "bg-success-500"  },
    { text: "Mock Interview session #3 completed",    time: "1d ago",  dot: "bg-accent-500"   },
    { text: "Saved MERN role at Infosys",             time: "2d ago",  dot: "bg-warning-500"  },
  ];

  const tabs = [
    { id: "personal",      label: "Personal Info"  },
    { id: "professional",  label: "Professional"   },
    { id: "resume",        label: "Resume"         },
  ];

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
  const fadeUp  = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22,1,0.36,1] } } };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible"
      className="space-y-6 max-w-300 mx-auto">

      {/* ══════════════ PROFILE HEADER ══════════════ */}
      <motion.div variants={fadeUp}
        className="relative overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(135deg,#0062c3 0%,#0ba5ff 45%,#8b5cf6 100%)" }}>
        {/* decorative blobs */}
        <motion.div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle,#38bfff 0%,transparent 70%)" }}
          animate={{ scale:[1,1.1,1] }} transition={{ duration:8, repeat:Infinity }} />
        <motion.div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle,#a78bfa 0%,transparent 70%)" }}
          animate={{ scale:[1,1.15,1] }} transition={{ duration:10, repeat:Infinity, delay:2 }} />

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden ring-4 ring-white/30
                flex items-center justify-center text-4xl font-bold text-white"
                style={{ background: avatarUrl ? undefined : "rgba(255,255,255,0.2)" }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  : initial}
              </div>
              <button type="button" onClick={() => fileRef.current?.click()}
                aria-label="Change profile photo"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center
                  bg-white text-primary-600 shadow-lg hover:shadow-xl hover:scale-110 transition-all">
                <FaCamera className="text-xs" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarPick} />
            </div>

            {/* Name / role */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{profile.name}</h1>
                <span className="px-2.5 py-0.5 bg-white/20 border border-white/30 rounded-full text-white/90 text-xs font-semibold">Student</span>
              </div>
              <p className="text-white/70 text-sm mt-1 flex items-center gap-1.5">
                <FaEnvelope className="text-[11px]" />{profile.email}
              </p>
              {extraProfile.city && (
                <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-[10px]" />{extraProfile.city}
                </p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap gap-3 mt-4">
                {stats.map((s) => {
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

            {/* Completion ring */}
            <div className="shrink-0 flex flex-col items-center gap-1">
              <div className="relative">
                <Ring value={completion} size={76} stroke={6} color="#fff" />
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                  {completion}%
                </div>
              </div>
              <span className="text-white/70 text-xs font-medium">Complete</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════ MAIN GRID ══════════════ */}
      <div className="grid xl:grid-cols-3 gap-6">

        {/* ── LEFT: form tabs (2/3) ── */}
        <motion.div variants={fadeUp} className="xl:col-span-2 space-y-4">

          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-neutral-100/80 dark:bg-white/5 rounded-xl w-fit">
            {tabs.map((t) => (
              <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === t.id
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}>
                {activeTab === t.id && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 bg-white dark:bg-white/10 rounded-lg shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">

              {/* ── PERSONAL INFO ── */}
              {activeTab === "personal" && (
                <motion.div key="personal" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-12 }}
                  transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}>
                  <Card className="p-6 md:p-7">
                    <SectionTitle sub="Update your personal details">Personal Information</SectionTitle>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field id="name"  label="Full Name"     name="name"  value={profile.name}  onChange={handleChange} icon={FaUser}    placeholder="John Doe" />
                      <Field id="email" label="Email Address" name="email" value={profile.email} onChange={handleChange} icon={FaEnvelope} readOnly />
                      <Field id="phone" label="Phone Number"  name="phone" value={profile.phone} onChange={handleChange} icon={FaPhone}    placeholder="+91 98765 43210" />
                      <Field id="dob"   label="Date of Birth" name="dob"   value={extraProfile.dob} onChange={handleExtra} icon={FaCalendarAlt} type="date" />
                      <SelectField id="gender" label="Gender" name="gender" value={extraProfile.gender} onChange={handleExtra}
                        icon={FaTransgender} options={["Male","Female","Non-binary","Prefer not to say"]} />
                      <Field id="city" label="Current City" name="city" value={extraProfile.city} onChange={handleExtra} icon={FaMapMarkerAlt} placeholder="Mumbai" />
                    </div>
                    <div className="mt-4">
                      <Field id="bio" label="Bio / About Me" name="bio" value={extraProfile.bio} onChange={handleExtra}
                        icon={FaUser} placeholder="A passionate developer..." multiline rows={3} />
                    </div>

                    <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-white/8">
                      <SectionTitle sub="Your academic background">Education</SectionTitle>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field id="college"  label="College / University" name="college"  value={extraProfile.college}  onChange={handleExtra} icon={FaUniversity} placeholder="IIT Bombay" />
                        <Field id="degree"   label="Degree"               name="degree"   value={extraProfile.degree}   onChange={handleExtra} icon={FaGraduationCap} placeholder="B.Tech" />
                        <Field id="branch"   label="Branch / Major"       name="branch"   value={extraProfile.branch}   onChange={handleExtra} icon={FaBuilding} placeholder="Computer Science" />
                        <Field id="gradYear" label="Graduation Year"      name="gradYear" value={extraProfile.gradYear} onChange={handleExtra} icon={FaCalendarAlt} placeholder="2025" />
                      </div>
                      <div className="mt-4">
                        <Field id="education" label="Education Details" name="education" value={profile.education} onChange={handleChange}
                          icon={FaGraduationCap} placeholder="B.Tech Computer Science..." multiline rows={3} />
                      </div>
                    </div>

                    <SaveBtn loading={loading} saved={saved} />
                  </Card>
                </motion.div>
              )}

              {/* ── PROFESSIONAL ── */}
              {activeTab === "professional" && (
                <motion.div key="professional" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-12 }}
                  transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}>
                  <Card className="p-6 md:p-7 space-y-6">
                    {/* Skills */}
                    <div>
                      <SectionTitle sub="Add skills to match job requirements">Skills</SectionTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <AnimatePresence>
                          {skillsList.map((s) => (
                            <SkillChip key={s} label={s} onRemove={() => removeSkill(s)} />
                          ))}
                        </AnimatePresence>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <FaCode className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400" />
                          <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                            placeholder="Add a skill (press Enter)"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10
                              bg-white/60 dark:bg-white/5 text-sm text-neutral-800 dark:text-white
                              placeholder-neutral-400 dark:placeholder-neutral-600 outline-none
                              focus:border-primary-500/70 focus:ring-2 focus:ring-primary-500/20 transition-all" />
                        </div>
                        <motion.button type="button" onClick={addSkill}
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                            bg-linear-to-r from-primary-500 to-accent-500 hover:shadow-lg transition-shadow">
                          <FaPlus className="text-xs" /> Add
                        </motion.button>
                      </div>
                      {/* Also keep skills textarea in state */}
                      <textarea className="hidden" name="skills" value={profile.skills} onChange={handleChange} />
                    </div>

                    {/* Languages */}
                    <div>
                      <SectionTitle sub="Languages you speak">Languages</SectionTitle>
                      <Field id="languages" label="Languages Known" name="languages" value={extraProfile.languages}
                        onChange={handleExtra} icon={FaGlobe} placeholder="English, Hindi, Marathi" />
                    </div>

                    {/* Social links */}
                    <div>
                      <SectionTitle sub="Your online presence">Links</SectionTitle>
                      <div className="space-y-3">
                        <Field id="github"    label="GitHub URL"    name="github"    value={extraProfile.github}    onChange={handleExtra} icon={FaGithub}   placeholder="https://github.com/username" />
                        <Field id="linkedin"  label="LinkedIn URL"  name="linkedin"  value={extraProfile.linkedin}  onChange={handleExtra} icon={FaLinkedin} placeholder="https://linkedin.com/in/username" />
                        <Field id="portfolio" label="Portfolio URL" name="portfolio" value={extraProfile.portfolio} onChange={handleExtra} icon={FaGlobe}    placeholder="https://yourportfolio.com" />
                      </div>
                    </div>

                    <SaveBtn loading={loading} saved={saved} />
                  </Card>
                </motion.div>
              )}

              {/* ── RESUME ── */}
              {activeTab === "resume" && (
                <motion.div key="resume" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-12 }}
                  transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}>
                  <Card className="p-6 md:p-7 space-y-6">
                    <SectionTitle sub="Upload or link your resume">Resume</SectionTitle>

                    {/* Drag-and-drop zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onResumeDrop}
                      onClick={() => resumeRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer
                        transition-all duration-200 text-center
                        ${dragOver
                          ? "border-primary-400 bg-primary-50 dark:bg-primary-500/10 scale-[1.01]"
                          : "border-neutral-200 dark:border-white/15 hover:border-primary-300 dark:hover:border-primary-500/50 hover:bg-neutral-50/80 dark:hover:bg-white/5"}`}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
                        <FaFileAlt className="text-white text-lg" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-700 dark:text-neutral-200 text-sm">
                          {profile.resumeUrl ? profile.resumeUrl : "Drop your resume here"}
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">PDF, DOCX up to 5MB · or click to browse</p>
                      </div>
                      <input ref={resumeRef} type="file" accept=".pdf,.docx" className="hidden"
                        onChange={(e) => { const f = e.target.files[0]; if (f) setProfile((p) => ({ ...p, resumeUrl: f.name })); }} />
                    </div>

                    {/* Resume URL input (existing field) */}
                    <Field id="resumeUrl" label="Or paste Resume URL (Cloudinary)" name="resumeUrl"
                      value={profile.resumeUrl} onChange={handleChange} icon={FaGlobe} placeholder="https://res.cloudinary.com/..." />

                    {profile.resumeUrl && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-success-50 dark:bg-success-500/10 border border-success-200/60 dark:border-success-500/20">
                        <FaFileAlt className="text-success-600 dark:text-success-400 text-lg shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-neutral-800 dark:text-white truncate">{profile.resumeUrl}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Last updated today</p>
                        </div>
                        <a href={profile.resumeUrl.startsWith("http") ? profile.resumeUrl : "#"}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                            text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/15
                            hover:bg-primary-100 dark:hover:bg-primary-500/25 transition-colors">
                          <FaDownload className="text-[10px]" /> Download
                        </a>
                      </div>
                    )}

                    <SaveBtn loading={loading} saved={saved} />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* ── RIGHT COLUMN (1/3) ── */}
        <motion.div variants={fadeUp} className="space-y-5">

          {/* Career progress */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
                <FaChartLine className="text-white text-[10px]" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white">Career Progress</h3>
            </div>
            {[
              { label: "Resume Strength",     value: 85, color: "from-success-400 to-success-500" },
              { label: "Profile Completion",  value: completion, color: "from-primary-400 to-primary-600" },
              { label: "Interview Readiness", value: 70, color: "from-accent-400 to-accent-600"  },
            ].map((p, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{p.label}</span>
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{p.value}%</span>
                </div>
                <div className="h-1.5 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full bg-linear-to-r ${p.color}`}
                    initial={{ width: 0 }} animate={{ width: `${p.value}%` }}
                    transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 + i * 0.1 }} />
                </div>
              </div>
            ))}
          </Card>

          {/* Badges */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-white mb-4">Achievements</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {badges.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.div key={i} whileHover={{ y: -2 }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center
                      ${b.earned
                        ? `${b.bg} border-transparent`
                        : "bg-neutral-50 dark:bg-white/3 border-neutral-200 dark:border-white/8 opacity-50"}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${b.bg}`}>
                      <Icon className={`text-sm ${b.color}`} />
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 leading-tight">{b.label}</span>
                    {!b.earned && <span className="text-[9px] text-neutral-400">Locked</span>}
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {/* AI Tips */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg,#0ba5ff,#8b5cf6)" }}>
                <FaLightbulb className="text-white text-[10px]" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white">AI Career Tips</h3>
            </div>
            <div className="space-y-2.5">
              {aiTips.map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-50 dark:bg-white/4
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

          {/* Activity */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-white mb-4">Recent Activity</h3>
            <div className="relative space-y-0">
              <div className="absolute left-1.25 top-2 bottom-2 w-px bg-neutral-200 dark:bg-white/10" />
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3.5 pb-3.5 last:pb-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 border-2 border-white dark:border-[#0d0f1e] ${a.dot}`} />
                  <div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{a.text}</p>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-600 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Save button (shared) ── */
function SaveBtn({ loading, saved }) {
  return (
    <div className="flex justify-end mt-6 pt-5 border-t border-neutral-100 dark:border-white/8">
      <motion.button type="submit"
        whileHover={!loading ? { y: -1, boxShadow: "0 8px 24px rgba(11,165,255,0.3)" } : {}}
        whileTap={!loading ? { scale: 0.97 } : {}}
        disabled={loading}
        className="relative overflow-hidden flex items-center gap-2 px-6 py-2.5 rounded-xl
          text-sm font-semibold text-white
          bg-linear-to-r from-primary-500 to-accent-500
          disabled:opacity-60 disabled:cursor-not-allowed
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
          transition-shadow duration-200">
        {/* shimmer */}
        {!loading && !saved && (
          <motion.span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }} animate={{ x: "200%" }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            aria-hidden="true" />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <><motion.span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
              Saving…</>
          ) : saved ? (
            <><FaCheck className="text-xs" /> Saved!</>
          ) : "Save Changes"}
        </span>
      </motion.button>
    </div>
  );
}

export default Profile;
