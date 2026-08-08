import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  FaBriefcase, FaRobot, FaRoad, FaCheckCircle, FaBuilding,
  FaMapMarkerAlt, FaDollarSign, FaSearch, FaMapPin, FaClock,
  FaHeart, FaUserGraduate, FaTrophy, FaChartLine, FaLaptopCode,
  FaChevronDown, FaChevronUp, FaStar, FaQuoteLeft,
  FaArrowRight, FaBolt, FaShieldAlt, FaCode, FaRocket,
  FaLinkedin, FaTwitter, FaGithub, FaEnvelope,
  FaPlay, FaTimes, FaFilter,
} from "react-icons/fa";

/* ── helpers ── */
const getGradient = (text) => {
  const g = ["from-primary-400 to-primary-600","from-accent-400 to-accent-600","from-success-400 to-success-600","from-warning-400 to-warning-600","from-danger-400 to-danger-600"];
  return g[text ? text.charCodeAt(0) % g.length : 0];
};

/* ── animation variants ── */
const fadeUp  = { hidden:{opacity:0,y:24}, visible:{opacity:1,y:0,transition:{duration:0.55,ease:[0.22,1,0.36,1]}} };
const fadeIn  = { hidden:{opacity:0},     visible:{opacity:1,transition:{duration:0.5}} };
const stagger = { visible:{transition:{staggerChildren:0.09}} };

/* ── animated counter ── */
function Counter({ to, suffix="" }) {
  const ref   = useRef(null);
  const inView= useInView(ref,{once:true,margin:"-60px"});
  const mv    = useMotionValue(0);
  const spring= useSpring(mv,{stiffness:60,damping:18});
  const [display,setDisplay]=useState(0);
  useEffect(()=>{ if(inView) mv.set(to); },[inView,mv,to]);
  useEffect(()=>spring.on("change",v=>setDisplay(Math.round(v))),[spring]);
  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

/* ── typing effect ── */
function TypingText({ words }) {
  const [idx,setIdx]=useState(0);
  const [sub,setSub]=useState(0);
  const [del,setDel]=useState(false);
  useEffect(()=>{
    const w=words[idx];
    if(!del && sub<w.length){ const t=setTimeout(()=>setSub(s=>s+1),60); return ()=>clearTimeout(t); }
    if(!del && sub===w.length){ const t=setTimeout(()=>setDel(true),1800); return ()=>clearTimeout(t); }
    if(del && sub>0){ const t=setTimeout(()=>setSub(s=>s-1),35); return ()=>clearTimeout(t); }
    if(del && sub===0){ setDel(false); setIdx(i=>(i+1)%words.length); }
  },[idx,sub,del,words]);
  return (
    <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-400 via-accent-400 to-warning-400">
      {words[idx].substring(0,sub)}<span className="animate-pulse">|</span>
    </span>
  );
}

/* ── section wrapper ── */
function Section({ id, children, className="" }) {
  const ref   = useRef(null);
  const inView= useInView(ref,{once:true,margin:"-80px"});
  return (
    <motion.section id={id} ref={ref} variants={stagger}
      initial="hidden" animate={inView?"visible":"hidden"}
      className={className}>
      {children}
    </motion.section>
  );
}

/* ── job card ── */
function JobCard({ job, isSaved, onSave }) {
  return (
    <motion.div variants={fadeUp}
      className="bg-white dark:bg-white/3 border border-neutral-100 dark:border-white/8 rounded-2xl p-5
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]
        hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-primary-400/5 to-accent-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="flex justify-between items-start gap-3 mb-4 relative z-10">
        <div className="flex gap-3 items-center min-w-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white bg-linear-to-br ${getGradient(job.company)}
            group-hover:scale-105 group-hover:rotate-2 transition-transform duration-200`}>
            <span className="text-lg font-bold">{job.company?.charAt(0) || "C"}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-neutral-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">{job.title}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">{job.company}</p>
          </div>
        </div>
        <button onClick={onSave}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSaved?"bg-red-500 text-white":"bg-neutral-50 dark:bg-white/5 text-neutral-400 hover:bg-red-50 hover:text-red-500"}`}>
          <FaHeart className="text-xs" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3 relative z-10">
        {job.location && <span className="flex items-center gap-1 text-[11px] font-semibold bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-full"><FaMapPin className="text-[9px]" />{job.location}</span>}
        {job.salary  && <span className="flex items-center gap-1 text-[11px] font-semibold bg-success-50 dark:bg-success-500/10 text-success-700 dark:text-success-400 px-2.5 py-1 rounded-full"><FaDollarSign className="text-[9px]" />{job.salary}</span>}
        {job.type    && <span className="flex items-center gap-1 text-[11px] font-semibold bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-400 px-2.5 py-1 rounded-full"><FaClock className="text-[9px]" />{job.type}</span>}
      </div>
      {job.description && <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed relative z-10">{job.description}</p>}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-white/8 relative z-10">
        <span className="text-[10px] font-bold px-2.5 py-1 bg-linear-to-r from-warning-400 to-warning-500 text-white rounded-full">Featured</span>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-neutral-400"><FaCheckCircle className="text-success-400" />Actively Hiring</span>
      </div>
    </motion.div>
  );
}

/* ── feature card ── */
const THEMES = {
  blue:   { ring:"ring-primary-500/20",  icon:"text-primary-500",  bg:"bg-primary-50 dark:bg-primary-500/10",  glow:"group-hover:shadow-primary-500/20" },
  purple: { ring:"ring-accent-500/20",   icon:"text-accent-500",   bg:"bg-accent-50 dark:bg-accent-500/10",    glow:"group-hover:shadow-accent-500/20"  },
  orange: { ring:"ring-warning-500/20",  icon:"text-warning-500",  bg:"bg-warning-50 dark:bg-warning-500/10",  glow:"group-hover:shadow-warning-500/20" },
  green:  { ring:"ring-success-500/20",  icon:"text-success-500",  bg:"bg-success-50 dark:bg-success-500/10",  glow:"group-hover:shadow-success-500/20" },
};
function FeatureCard({ icon: Icon, title, desc, colorTheme, to }) {
  const t = THEMES[colorTheme] ?? THEMES.blue;
  return (
    <motion.div variants={fadeUp}
      className={`bg-white dark:bg-white/3 border border-neutral-100 dark:border-white/8 rounded-2xl p-6
        hover:-translate-y-1 hover:shadow-xl ${t.glow} transition-all duration-200 group cursor-pointer ring-1 ring-transparent hover:${t.ring}`}>
      <div className={`w-12 h-12 ${t.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`text-xl ${t.icon}`} />
      </div>
      <h4 className="font-bold text-neutral-900 dark:text-white text-base mb-2">{title}</h4>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">{desc}</p>
      {to && (
        <Link to={to} className={`flex items-center gap-1.5 text-sm font-semibold ${t.icon} hover:gap-2.5 transition-all`}>
          Learn more <FaArrowRight className="text-xs" />
        </Link>
      )}
    </motion.div>
  );
}

/* ── testimonial ── */
const TESTIMONIALS = [
  { name:"Arjun Mehta",  role:"Frontend Dev @ Razorpay",     text:"CareerLaunch AI helped me land my dream job in 3 weeks. The AI roadmap was spot on!", rating:5, avatar:"A" },
  { name:"Priya Sharma", role:"Data Scientist @ Infosys",     text:"The resume analyzer boosted my ATS score from 42% to 91%. Got 5 interviews in a week!", rating:5, avatar:"P" },
  { name:"Rahul Gupta",  role:"Backend Dev @ Flipkart",       text:"Mock interviews prepared me for every tricky question. The feedback was brutally honest and helpful.", rating:5, avatar:"R" },
  { name:"Sneha Patel",  role:"Full Stack Dev @ Paytm",       text:"The career roadmap feature showed me exactly what to learn. No more wasted time on random tutorials.", rating:5, avatar:"S" },
];

/* ── FAQ ── */
const FAQS = [
  { q:"Is CareerLaunch AI free to use?",         a:"Yes! The core features — job search, resume analysis, career roadmaps, and mock interviews — are completely free for students." },
  { q:"How does the AI resume analyzer work?",   a:"Upload your PDF resume and we'll analyze it against ATS systems, job descriptions, and industry standards to give you a score and actionable improvements." },
  { q:"Can I practice real interview questions?", a:"Absolutely. Our AI conducts role-specific mock interviews with 12 questions, provides instant feedback, scores each answer 1–10, and generates a full performance report." },
  { q:"How are job listings curated?",           a:"Listings are aggregated from trusted sources and company career pages, verified for freshness, and ranked by relevance to your profile." },
  { q:"Do you support non-tech roles?",          a:"While we specialize in tech roles, our platform supports Business Analyst, Product Manager, Digital Marketing, and other adjacent career paths." },
];
function FAQ({ q, a }) {
  const [open,setOpen]=useState(false);
  return (
    <motion.div variants={fadeUp}
      className="border border-neutral-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-white/3">
      <button onClick={()=>setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
        <span className="font-semibold text-sm text-neutral-800 dark:text-white pr-4">{q}</span>
        <motion.span animate={{rotate:open?180:0}} transition={{duration:0.2}} className="shrink-0 text-neutral-400">
          <FaChevronDown className="text-xs" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
            transition={{duration:0.25}} className="overflow-hidden">
            <p className="px-5 pb-4 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();

  /* ── existing state — ALL PRESERVED ── */
  const [searchQuery,        setSearchQuery]        = useState("");
  const [locationFilter,     setLocationFilter]     = useState("");
  const [sortBy,             setSortBy]             = useState("relevant");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedCompanyType,setSelectedCompanyType]= useState([]);
  const [remoteOnly,         setRemoteOnly]         = useState(false);
  const [freshersOnly,       setFreshersOnly]       = useState(false);
  const [savedJobs,          setSavedJobs]          = useState(new Set());
  const [expandedFilters,    setExpandedFilters]    = useState({ categories:true, experience:true, company:true });

  /* ── new UI state ── */
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [locFocused,     setLocFocused]     = useState(false);
  const [showFilters,    setShowFilters]    = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  /* Jobs are now on the dedicated Jobs page (Google Places).
     Keep empty arrays so any remaining render references stay safe. */
  const loadingJobs  = false;
  const jobs         = [];
  const filteredJobs = [];

  /* ── existing helpers — PRESERVED ── */
  const toggleJobSave=useCallback((jobId)=>{
    setSavedJobs(prev=>{ const n=new Set(prev); n.has(jobId)?n.delete(jobId):n.add(jobId); return n; });
  },[]);
  const clearAllFilters=()=>{
    setSearchQuery(""); setLocationFilter(""); setRemoteOnly(false); setFreshersOnly(false);
    setSelectedCategories([]); setSelectedExperience([]); setSelectedCompanyType([]); setSortBy("relevant");
  };

  /* testimonial auto-advance */
  useEffect(()=>{
    const t=setInterval(()=>setActiveTestimonial(i=>(i+1)%TESTIMONIALS.length),4500);
    return ()=>clearInterval(t);
  },[]);

  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-[#080810]">

      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden"
        style={{ background:"linear-gradient(160deg,#060818 0%,#0d1030 40%,#0a0a18 100%)" }}>

        {/* animated mesh blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div className="absolute top-[-15%] left-[-10%] w-[65%] h-[80%] rounded-full opacity-35"
            style={{ background:"radial-gradient(circle,#0062c3 0%,transparent 70%)" }}
            animate={{ scale:[1,1.12,1], rotate:[0,15,0] }} transition={{ duration:12, repeat:Infinity, ease:"easeInOut" }} />
          <motion.div className="absolute top-[10%] right-[-10%] w-[55%] h-[70%] rounded-full opacity-25"
            style={{ background:"radial-gradient(circle,#6d28d9 0%,transparent 70%)" }}
            animate={{ scale:[1,1.15,1], rotate:[0,-20,0] }} transition={{ duration:14, repeat:Infinity, ease:"easeInOut", delay:2 }} />
          <motion.div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[60%] rounded-full opacity-20"
            style={{ background:"radial-gradient(circle,#d97706 0%,transparent 70%)" }}
            animate={{ scale:[1,1.1,1] }} transition={{ duration:10, repeat:Infinity, ease:"easeInOut", delay:4 }} />
          {/* floating shapes */}
          {[
            { size:60,  top:"18%",  left:"8%",  delay:0,   dur:7  },
            { size:40,  top:"65%",  right:"6%", delay:1.5, dur:9  },
            { size:80,  top:"35%",  left:"3%",  delay:0.8, dur:11 },
            { size:30,  bottom:"25%",right:"18%",delay:3,  dur:8  },
            { size:50,  top:"75%",  left:"15%", delay:2,   dur:12 },
          ].map((s,i)=>(
            <motion.div key={i}
              className="absolute rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
              style={{ width:s.size, height:s.size, top:s.top, left:s.left, right:s.right, bottom:s.bottom }}
              animate={{ y:[0,-20,0], x:[0,10,0], opacity:[0.3,0.7,0.3] }}
              transition={{ duration:s.dur, delay:s.delay, repeat:Infinity, ease:"easeInOut" }} />
          ))}
          {/* grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          {/* badge */}
          <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:[0.22,1,0.36,1]}}>
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/8 border border-white/15 text-white/90 text-sm font-semibold mb-8 backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Over 10,000+ Students Placed
            </span>
          </motion.div>

          {/* headline */}
          <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.65,delay:0.1,ease:[0.22,1,0.36,1]}}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 tracking-tight leading-none">
            Launch Your <br className="hidden sm:block" />
            <TypingText words={["Dream Career","Perfect Resume","Future Job","Tech Journey"]} />
            <br />With AI Precision.
          </motion.h1>

          <motion.p initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.55,delay:0.25,ease:[0.22,1,0.36,1]}}
            className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover top-tier tech opportunities, craft the perfect ATS-friendly resume, and ace your interviews with our AI-powered platform.
          </motion.p>

          {/* CTA row */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.55,delay:0.35,ease:[0.22,1,0.36,1]}}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <motion.div whileHover={{y:-2,boxShadow:"0 16px 40px rgba(11,165,255,0.4)"}} whileTap={{scale:0.97}}>
              <Link to="/register"
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold text-white
                  bg-linear-to-r from-primary-500 to-accent-500 shadow-lg transition-shadow">
                <FaRocket className="text-sm" /> Get Started Free
              </Link>
            </motion.div>
            <motion.div whileHover={{y:-2}} whileTap={{scale:0.97}}>
              <Link to="/student/jobs"
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold text-white
                  bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/15 transition-colors">
                <FaBriefcase className="text-sm" /> Explore Jobs
              </Link>
            </motion.div>
          </motion.div>

          {/* Search bar */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.45,ease:[0.22,1,0.36,1]}}
            className="max-w-3xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
            <div className={`relative flex-1 bg-white dark:bg-white/10 rounded-xl overflow-hidden border-2 transition-all duration-200 ${searchFocused?"border-primary-400 shadow-[0_0_0_4px_rgba(11,165,255,0.15)]":"border-transparent"}`}>
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500 text-sm" />
              <input type="text" placeholder="Job title, keywords, or company"
                value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)}
                className="w-full pl-10 pr-4 py-3.5 bg-transparent outline-none text-sm font-medium text-neutral-900 dark:text-white placeholder-neutral-400" />
            </div>
            <div className={`relative flex-1 bg-white dark:bg-white/10 rounded-xl overflow-hidden border-2 transition-all duration-200 ${locFocused?"border-accent-400 shadow-[0_0_0_4px_rgba(139,92,246,0.15)]":"border-transparent"}`}>
              <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent-500 text-sm" />
              <input type="text" placeholder="City, state, or remote"
                value={locationFilter} onChange={e=>setLocationFilter(e.target.value)}
                onFocus={()=>setLocFocused(true)} onBlur={()=>setLocFocused(false)}
                className="w-full pl-10 pr-4 py-3.5 bg-transparent outline-none text-sm font-medium text-neutral-900 dark:text-white placeholder-neutral-400" />
            </div>
            <motion.button whileHover={{boxShadow:"0 8px 24px rgba(11,165,255,0.4)"}} whileTap={{scale:0.97}}
              className="bg-linear-to-r from-primary-500 to-accent-500 text-white px-7 py-3.5 rounded-xl font-bold text-sm whitespace-nowrap transition-shadow">
              Find Jobs
            </motion.button>
          </motion.div>

          {/* quick pills */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6,duration:0.5}}
            className="flex flex-wrap justify-center gap-2.5 mt-6">
            <span className="text-white/50 text-xs py-1.5 font-medium">Popular:</span>
            {[
              {term:"Frontend",   color:"hover:bg-primary-500/20 hover:text-primary-300 hover:border-primary-500/30"},
              {term:"Backend",    color:"hover:bg-accent-500/20 hover:text-accent-300 hover:border-accent-500/30"},
              {term:"Data Science",color:"hover:bg-success-500/20 hover:text-success-300 hover:border-success-500/30"},
              {term:"Remote",     color:"hover:bg-warning-500/20 hover:text-warning-300 hover:border-warning-500/30"},
            ].map(item=>(
              <button key={item.term}
                onClick={()=>{ item.term==="Remote"?setRemoteOnly(true):setSearchQuery(item.term); document.getElementById("jobs-section")?.scrollIntoView({behavior:"smooth"}); }}
                className={`px-4 py-1.5 rounded-full bg-white/8 border border-white/12 text-white/80 text-xs font-medium backdrop-blur-sm transition-all ${item.color}`}>
                {item.term}
              </button>
            ))}
          </motion.div>
        </div>

        {/* scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{y:[0,8,0]}} transition={{duration:1.5,repeat:Infinity}}>
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          STATS
      ═══════════════════════════════════════ */}
      <section className="relative z-20 -mt-8 mb-20 max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-60px"}}
          transition={{duration:0.6,ease:[0.22,1,0.36,1]}}
          className="bg-[#1E293B]/90 backdrop-blur-2xl rounded-3xl shadow-2xl grid grid-cols-2 md:grid-cols-4
            divide-y md:divide-y-0 md:divide-x divide-white/8 border border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
          {[
            { value:5000,  suffix:"+", label:"Students",  Icon:FaUserGraduate, bg:"bg-primary-500/20", col:"text-primary-400" },
            { value:1200,  suffix:"+", label:"Listings",   Icon:FaBriefcase,   bg:"bg-accent-500/20",  col:"text-accent-400"  },
            { value:150,   suffix:"+", label:"Companies",  Icon:FaBuilding,    bg:"bg-warning-500/20", col:"text-warning-400" },
            { value:10000, suffix:"+", label:"Placements", Icon:FaTrophy,      bg:"bg-success-500/20", col:"text-success-400" },
          ].map(({value,suffix,label,Icon,bg,col})=>(
            <div key={label} className="flex flex-col items-center py-8 px-4 relative group hover:bg-white/5 transition-colors">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`text-xl ${col}`} />
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                <Counter to={value} suffix={suffix} />
              </div>
              <div className="text-neutral-400 text-xs font-semibold uppercase tracking-widest mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          JOBS SECTION
      ═══════════════════════════════════════ */}
      <section id="jobs-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* Sidebar */}
          <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
            transition={{duration:0.5,ease:[0.22,1,0.36,1]}}
            className="w-full lg:w-72 shrink-0">
            <div className="bg-white dark:bg-white/3 rounded-2xl border border-neutral-200 dark:border-white/8 p-5 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-neutral-100 dark:border-white/8">
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <FaFilter className="text-primary-500 text-xs" /> Filters
                </h2>
                {(searchQuery||locationFilter||remoteOnly||freshersOnly||selectedCategories.length>0)&&(
                  <button onClick={clearAllFilters} className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-full transition-colors">Reset</button>
                )}
              </div>

              {/* toggles */}
              <div className="space-y-3 mb-5">
                {[
                  {label:"Remote Only",   val:remoteOnly,   set:setRemoteOnly,   col:"accent"},
                  {label:"Freshers",      val:freshersOnly, set:setFreshersOnly, col:"success"},
                ].map(({label,val,set,col})=>(
                  <label key={label} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{label}</span>
                    <div onClick={()=>set(!val)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${val?`bg-${col}-500`:"bg-neutral-200 dark:bg-white/15"}`}>
                      <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow transition-transform ${val?"translate-x-5":""}`} />
                    </div>
                  </label>
                ))}
              </div>

              {/* category filter */}
              <div>
                <button onClick={()=>setExpandedFilters(p=>({...p,categories:!p.categories}))}
                  className="w-full flex justify-between items-center mb-3 text-left">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Role Categories</span>
                  {expandedFilters.categories?<FaChevronUp className="text-xs text-neutral-400"/>:<FaChevronDown className="text-xs text-neutral-400"/>}
                </button>
                <AnimatePresence>
                  {expandedFilters.categories&&(
                    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                      transition={{duration:0.2}} className="overflow-hidden space-y-1.5">
                      {[
                        {name:"Frontend",    count:284,col:"text-primary-600",bg:"bg-primary-50 dark:bg-primary-500/15"},
                        {name:"Backend",     count:156,col:"text-accent-600",  bg:"bg-accent-50 dark:bg-accent-500/15"},
                        {name:"Full Stack",  count:312,col:"text-success-600", bg:"bg-success-50 dark:bg-success-500/15"},
                        {name:"Data Science",count:89, col:"text-warning-600", bg:"bg-warning-50 dark:bg-warning-500/15"},
                      ].map(cat=>{
                        const sel=selectedCategories.includes(cat.name);
                        return (
                          <label key={cat.name}
                            className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-4 h-4 rounded border-2 transition-colors flex items-center justify-center ${sel?"border-transparent "+cat.bg:"border-neutral-300 dark:border-neutral-600"}`}>
                                {sel&&<FaCheckCircle className={`text-[10px] ${cat.col}`}/>}
                              </div>
                              <input type="checkbox" className="sr-only" checked={sel}
                                onChange={()=>setSelectedCategories(sel?selectedCategories.filter(c=>c!==cat.name):[...selectedCategories,cat.name])} />
                              <span className={`text-xs font-semibold transition-colors ${sel?"text-neutral-900 dark:text-white":"text-neutral-600 dark:text-neutral-400"}`}>{cat.name}</span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sel?cat.bg+" "+cat.col:"bg-neutral-100 dark:bg-white/8 text-neutral-500 dark:text-neutral-400"}`}>{cat.count}</span>
                          </label>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA box */}
              <div className="mt-6 p-4 rounded-2xl text-center relative overflow-hidden"
                style={{ background:"linear-gradient(135deg,#8b5cf6,#0062c3)" }}>
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                <FaRocket className="text-white text-xl mx-auto mb-2 relative z-10" />
                <h4 className="font-bold text-white text-sm mb-1 relative z-10">Stand out!</h4>
                <p className="text-white/70 text-xs mb-3 relative z-10">AI resume scoring & job matches</p>
                <Link to="/register"
                  className="block w-full py-2 bg-white text-primary-600 rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors relative z-10 shadow">
                  Join Free
                </Link>
              </div>
            </div>
          </motion.div>

          {/* job feed */}
          <div className="flex-1 min-w-0">
            {/* header */}
            <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-white/3
                border border-neutral-100 dark:border-white/8 rounded-2xl px-5 py-3.5 mb-5 shadow-sm gap-3">
              <p className="text-sm font-bold text-neutral-900 dark:text-white">
                <span className="text-primary-600">{filteredJobs.length}</span> opportunities found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Sort</span>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10
                    rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 outline-none
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer">
                  <option value="relevant">Most Relevant</option>
                  <option value="recent">Newest First</option>
                  <option value="salary">Highest Salary</option>
                </select>
              </div>
            </motion.div>

            {loadingJobs ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-white/3 rounded-2xl border border-neutral-100 dark:border-white/8">
                <div className="relative w-12 h-12 mb-5">
                  <div className="absolute inset-0 border-4 border-primary-100 dark:border-primary-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-semibold">Discovering opportunities…</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredJobs.map(job=>(
                  <Link key={job.id} to={`/student/jobs/${job.id}`} className="outline-none focus:ring-2 focus:ring-primary-500 rounded-2xl">
                    <JobCard job={job} isSaved={savedJobs.has(job.id)}
                      onSave={e=>{ e.preventDefault(); toggleJobSave(job.id); }} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-white/3 rounded-2xl border border-neutral-100 dark:border-white/8 p-16 text-center">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaSearch className="text-2xl text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No matches found</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">Try adjusting your search or filters.</p>
                <button onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-primary-500 text-white font-bold rounded-xl text-sm hover:bg-primary-600 transition-colors">
                  Clear Filters
                </button>
              </div>
            )}

            {filteredJobs.length > 0 && (
              <div className="mt-8 text-center">
                <motion.button whileHover={{y:-1}} whileTap={{scale:0.97}}
                  className="px-8 py-3 bg-white dark:bg-white/5 border-2 border-neutral-200 dark:border-white/10
                    text-sm font-bold text-neutral-700 dark:text-neutral-300 rounded-xl
                    hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-all">
                  Load More Jobs
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          AI FEATURES
      ═══════════════════════════════════════ */}
      <Section id="features" className="py-28 bg-white dark:bg-[#0d0f1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest mb-4">
              <FaBolt className="text-[10px]" /> AI-Powered Tools
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-4">More than just a job board.</h2>
            <p className="text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
              CareerLaunch AI provides a complete suite of intelligent tools to help you prepare, practice, and secure your dream offer.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard icon={FaChartLine} title="AI Resume Analysis"  desc="Score your resume against ATS systems and real job descriptions. Get instant improvement tips." colorTheme="blue"   to="/student/resume-analyzer" />
            <FeatureCard icon={FaRoad}      title="Career Roadmaps"     desc="Step-by-step learning paths tailored to your target role and current skill level."                 colorTheme="purple" to="/student/roadmap-generator" />
            <FeatureCard icon={FaRobot}     title="Mock Interviews"      desc="Practice with our AI interviewer, get scored answers, and receive a full performance report."      colorTheme="orange" to="/student/mock-interview" />
            <FeatureCard icon={FaTrophy}    title="Skill Assessments"   desc="Validate expertise with standardized tests and showcase verified badges to employers."              colorTheme="green"  to="/student/dashboard" />
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
      <Section id="testimonials" className="py-28 bg-slate-50 dark:bg-[#080810]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 text-xs font-bold uppercase tracking-widest mb-4">
              <FaStar className="text-[10px]" /> Success Stories
            </span>
            <h2 className="text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Students love CareerLaunch AI</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t,i)=>(
              <motion.div key={i} variants={fadeUp}
                className={`p-6 rounded-2xl border transition-all duration-300 ${i===activeTestimonial
                  ?"border-primary-300 dark:border-primary-500/40 bg-primary-50/50 dark:bg-primary-500/5 shadow-lg"
                  :"border-neutral-200 dark:border-white/8 bg-white dark:bg-white/3 hover:border-primary-200 dark:hover:border-primary-500/30"}`}>
                <FaQuoteLeft className="text-primary-300 dark:text-primary-500/50 text-2xl mb-3" />
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{background:"linear-gradient(135deg,#0ba5ff,#8b5cf6)"}}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-800 dark:text-white">{t.name}</p>
                    <p className="text-xs text-neutral-400">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(t.rating)].map((_,s)=><FaStar key={s} className="text-yellow-400 text-xs" />)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_,i)=>(
              <button key={i} onClick={()=>setActiveTestimonial(i)}
                className={`rounded-full transition-all ${i===activeTestimonial?"w-6 h-2 bg-primary-500":"w-2 h-2 bg-neutral-300 dark:bg-white/20 hover:bg-primary-300"}`} />
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
          FAQ
      ═══════════════════════════════════════ */}
      <Section id="faq" className="py-28 bg-white dark:bg-[#0d0f1e]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 text-xs font-bold uppercase tracking-widest mb-4">
              <FaShieldAlt className="text-[10px]" /> FAQ
            </span>
            <h2 className="text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Frequently asked questions</h2>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((f,i)=><FAQ key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden" style={{background:"linear-gradient(135deg,#0062c3 0%,#0ba5ff 40%,#8b5cf6 100%)"}}>
        <motion.div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{background:"radial-gradient(circle,#38bfff 0%,transparent 70%)"}}
          animate={{scale:[1,1.15,1]}} transition={{duration:8,repeat:Infinity}} />
        <motion.div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full opacity-15 pointer-events-none"
          style={{background:"radial-gradient(circle,#a78bfa 0%,transparent 70%)"}}
          animate={{scale:[1,1.2,1]}} transition={{duration:10,repeat:Infinity,delay:2}} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6,ease:[0.22,1,0.36,1]}}>
            <span className="inline-block py-1 px-4 rounded-full bg-white/15 text-white font-bold text-xs tracking-widest mb-6 uppercase border border-white/20">
              Start Your Journey
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 tracking-tight">Your next great opportunity awaits</h2>
            <p className="text-lg text-white/85 mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of students who've launched their careers with CareerLaunch AI. It takes less than 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{y:-2,boxShadow:"0 16px 40px rgba(255,255,255,0.25)"}} whileTap={{scale:0.97}}>
                <Link to="/register"
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary-600 rounded-xl font-extrabold text-base hover:bg-neutral-50 transition-colors shadow-lg">
                  <FaRocket className="text-sm" /> Create Free Account
                </Link>
              </motion.div>
              <motion.div whileHover={{y:-2}} whileTap={{scale:0.97}}>
                <Link to="/student/jobs"
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white/15 text-white rounded-xl font-extrabold text-base hover:bg-white/25 transition-colors border border-white/30 backdrop-blur-sm">
                  <FaBriefcase className="text-sm" /> Browse All Jobs
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      
     
    </div>
  );
}
