import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaRocket } from "react-icons/fa";

const linkClass = "rounded-md transition-colors hover:text-[var(--cl-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cl-ring)]";

function Footer() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard";

  return (
    <footer className="mt-auto border-t border-[var(--cl-border)] bg-[var(--cl-surface)] text-[var(--cl-text)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" aria-label="CareerLaunch AI home" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cl-ring)]">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-950/20">
                <FaRocket className="text-sm" aria-hidden="true" />
              </span>
              <span className="text-xl font-bold">CareerLaunch AI</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--cl-text-muted)]">
              Discover jobs, build skills, and prepare for interviews—all in one place.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--cl-text-muted)]">Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--cl-text)]">
              <li><Link to="/student/jobs" className={linkClass}>Jobs</Link></li>
              <li><Link to="/student/companies" className={linkClass}>Companies</Link></li>
              <li><Link to="/student/resources" className={linkClass}>Resources</Link></li>
              <li><Link to="/student/roadmap-generator" className={linkClass}>Roadmaps</Link></li>
              <li><Link to="/student/mock-interview" className={linkClass}>Mock Interview</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--cl-text-muted)]">Account</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--cl-text)]">
              {isAuthenticated ? (
                <>
                  <li><Link to={dashboardPath} className={linkClass}>Dashboard</Link></li>
                  <li><Link to="/student/profile" className={linkClass}>My Profile</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className={linkClass}>Sign In</Link></li>
                  <li><Link to="/register" className={linkClass}>Create Account</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--cl-text-muted)]">Support</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--cl-text)]">
              <li><a href="mailto:careerlaunchaii@gmail.com" className={linkClass}>Contact</a></li>
              <li><Link to="/privacy-policy" className={linkClass}>Privacy Policy</Link></li>
              <li><Link to="/terms-of-use" className={linkClass}>Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--cl-border)] pt-5 text-center text-sm text-[var(--cl-text-soft)]">
          © {new Date().getFullYear()} CareerLaunch AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;