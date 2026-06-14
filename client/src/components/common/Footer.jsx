function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">

      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid md:grid-cols-3 gap-8">

          <div>
            <h2 className="text-xl font-bold">
              CareerLaunch AI
            </h2>

            <p className="mt-3 text-gray-400">
              Helping freshers learn skills,
              prepare for interviews,
              and land their dream jobs.
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-3">
              Quick Links
            </h2>

            <ul className="space-y-2">
              <li>Jobs</li>
              <li>Resources</li>
              <li>Roadmaps</li>
              <li>Mock Interview</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-3">
              Contact
            </h2>

            <p>Email: support@careerlaunch.ai</p>

            <p className="mt-2">
              Built with React, Node.js,
              PostgreSQL & Gemini AI
            </p>
          </div>

        </div>

        <hr className="my-6 border-gray-700" />

        <p className="text-center text-gray-400">
          © 2026 CareerLaunch AI. All Rights Reserved.
        </p>

      </div>

    </footer>
  );
}

export default Footer;