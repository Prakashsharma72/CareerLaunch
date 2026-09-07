import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold text-white">CareerLaunch AI</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Helping students and fresh graduates discover opportunities, build practical skills and prepare for interviews.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Explore</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><Link to="/student/jobs" className="transition hover:text-white">Jobs</Link></li>
              <li><Link to="/student/companies" className="transition hover:text-white">Companies</Link></li>
              <li><Link to="/student/resources" className="transition hover:text-white">Resources</Link></li>
              <li><Link to="/student/roadmap-generator" className="transition hover:text-white">Roadmaps</Link></li>
              <li><Link to="/student/mock-interview" className="transition hover:text-white">Mock Interview</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Account</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><Link to="/login" className="transition hover:text-white">Sign In</Link></li>
              <li><Link to="/register" className="transition hover:text-white">Create Account</Link></li>
              <li><Link to="/student/dashboard" className="transition hover:text-white">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Support</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><a href="mailto:careerlaunchaii@gmail.com" className="transition hover:text-white">Contact</a></li>
              <li><a href="mailto:careerlaunchaii@gmail.com" className="transition hover:text-white">Privacy Policy</a></li>
              <li><a href="mailto:careerlaunchaii@gmail.com" className="transition hover:text-white">Terms of Use</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          © 2026 CareerLaunch AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;