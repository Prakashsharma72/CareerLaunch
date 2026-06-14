import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./styles/landing.css";
import {
  FaBriefcase,
  FaRobot,
  FaBook,
  FaRoad,
  FaUsers,
  FaCheckCircle,
  FaBuilding,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaDollarSign,
} from "react-icons/fa";
import { getAllJobs } from "../services/jobService";

const TrustLogos = () => (
  <div className="trust-logos">
    {[
      "Google",
      "Microsoft",
      "Amazon",
      "Infosys",
      "Accenture",
      "TCS",
    ].map((c) => (
      <div key={c} className="logo">
        <div className="logo-inner">{c}</div>
      </div>
    ))}
  </div>
);

const StatCard = ({ value, label }) => (
  <div className="stat-card">
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h4>{title}</h4>
    <p>{desc}</p>
  </div>
);

const JobCard = ({ job }) => (
  <div className="job-card">
    <div className="job-header">
      <div className="job-company">{job.company}</div>
      <span className="job-type">{job.type}</span>
    </div>
    <h4 className="job-title">{job.title}</h4>
    <p className="job-desc">{job.description}</p>
    <div className="job-meta">
      <div className="meta-item">
        <FaMapMarkerAlt /> {job.location}
      </div>
      <div className="meta-item">
        <FaDollarSign /> {job.salary}
      </div>
    </div>
    <Link to={`/student/jobs/${job.id}`} className="btn-small">
      View Details
    </Link>
  </div>
);

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        const res = await getAllJobs();
        setJobs(res.data.slice(0, 6));
      } catch (e) {
        console.error("Failed to fetch jobs:", e);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);
  return (
    <div className="landing-root">
      <header className="nav-glass">
        <div className="nav-inner">
          <div className="brand">CareerLaunch AI</div>
          <nav className="nav-links">
            <Link to="/jobs">Jobs</Link>
            <Link to="/resources">Resources</Link>
            <Link to="/roadmaps">Roadmaps</Link>
            <Link to="/resume-analyzer">Resume Builder</Link>
            <Link to="/mock-interview">Mock Interviews</Link>
          </nav>
          <div className="nav-cta">
            <Link className="link" to="/login">
              Login
            </Link>
            <Link className="link" to="/register">
              Register
            </Link>
            <Link className="btn-primary" to="/register">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="hero">
        <section className="hero-left">
          <h1>Launch Your Tech Career Faster With AI</h1>
          <p className="sub">Discover jobs, build ATS-friendly resumes, prepare for interviews, and follow personalized learning roadmaps powered by AI.</p>

          <div className="hero-actions">
            <Link to="/register" className="btn-ghost">
              Get Started Free
            </Link>
            <Link to="/jobs" className="btn-outline">
              Explore Jobs
            </Link>
          </div>

          <div className="trust">
            <StatCard value="5,000+" label="Students" />
            <StatCard value="1,200+" label="Jobs" />
            <StatCard value="300+" label="Resources" />
            <StatCard value="150+" label="Companies" />
          </div>

          <div className="companies">
            <TrustLogos />
          </div>
        </section>

        <aside className="hero-right">
          <div className="dashboard-mock">
            <div className="mock-top">
              <div className="mock-left">
                <h3>AI Job Recommendations</h3>
                <ul>
                  <li>Frontend Engineer — Google</li>
                  <li>Data Analyst — Amazon</li>
                  <li>Backend Intern — Microsoft</li>
                </ul>
              </div>
              <div className="mock-right">
                <div className="score">
                  <div>Resume Score</div>
                  <div className="badge">86</div>
                </div>
                <div className="score">
                  <div>Interview Readiness</div>
                  <div className="badge">72</div>
                </div>
              </div>
            </div>

            <div className="mock-progress">
              <div className="prog">
                <div>Weekly Learning</div>
                <div className="bar"><div style={{width:'62%'}}/></div>
              </div>
              <div className="prog">
                <div>Skill Progress</div>
                <div className="bar"><div style={{width:'45%'}}/></div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <section className="stats-grid">
        <StatCard value="5,000+" label="Students" />
        <StatCard value="1,200+" label="Open Jobs" />
        <StatCard value="300+" label="Learning Resources" />
        <StatCard value="150+" label="Hiring Partners" />
      </section>

      <section className="features">
        <h2>Everything You Need To Get Hired</h2>
        <div className="features-grid">
          <FeatureCard icon={<FaRobot/>} title="AI Resume Builder" desc="Generate ATS-optimized resumes instantly." />
          <FeatureCard icon={<FaBriefcase/>} title="Smart Job Board" desc="Discover fresher jobs and internships." />
          <FeatureCard icon={<FaRoad/>} title="Career Roadmaps" desc="Follow structured learning paths." />
          <FeatureCard icon={<FaRobot/>} title="AI Mock Interviews" desc="Practice real interview scenarios." />
          <FeatureCard icon={<FaCheckCircle/>} title="Skill Assessments" desc="Measure job readiness and progress." />
          <FeatureCard icon={<FaBuilding/>} title="Company Insights" desc="Research hiring companies and requirements." />
        </div>
      </section>

      <section className="featured-jobs">
        <h2>Featured Job Opportunities</h2>
        <p className="section-desc">Latest opportunities from top companies</p>
        {loadingJobs ? (
          <div className="loading">Loading jobs...</div>
        ) : jobs.length > 0 ? (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="loading">No jobs available yet</div>
        )}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link to="/student/jobs" className="btn-outline">
            View All Jobs →
          </Link>
        </div>
      </section>

      <section className="timeline">
        <h2>Your Career Journey</h2>
        <div className="timeline-grid">
          <div className="time-card">
            <div className="step">1</div>
            <h4>Discover Opportunities</h4>
            <p>Find roles that match your profile and goals.</p>
          </div>
          <div className="connector" />
          <div className="time-card">
            <div className="step">2</div>
            <h4>Learn & Build Skills</h4>
            <p>Follow roadmaps and complete hands-on modules.</p>
          </div>
          <div className="connector" />
          <div className="time-card">
            <div className="step">3</div>
            <h4>Get Hired</h4>
            <p>Apply, interview, and land your first role.</p>
          </div>
        </div>
      </section>

      <section className="cta-gradient">
        <div className="cta-inner">
          <h2>Ready To Launch Your Career?</h2>
          <p>Join thousands of students accelerating their careers with AI-powered tools.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn-primary large">Start Free</Link>
            <Link to="/jobs" className="btn-outline large">Browse Jobs</Link>
          </div>
        </div>
      </section>

      <footer className="enterprise-footer">
        <div className="footer-grid">
          <div>
            <h5>Company</h5>
            <a>About</a>
            <a>Careers</a>
            <a>Contact</a>
            <a>Blog</a>
          </div>
          <div>
            <h5>Product</h5>
            <a>Jobs</a>
            <a>Resume Builder</a>
            <a>Roadmaps</a>
            <a>Mock Interviews</a>
          </div>
          <div>
            <h5>Resources</h5>
            <a>Guides</a>
            <a>Tutorials</a>
            <a>FAQs</a>
            <a>Community</a>
          </div>
          <div>
            <h5>Social</h5>
            <a>LinkedIn</a>
            <a>GitHub</a>
            <a>Twitter</a>
            <a>Discord</a>
          </div>
        </div>
        <div className="footer-bottom">© 2025 CareerLaunch AI. All Rights Reserved.</div>
      </footer>
    </div>
  );
}