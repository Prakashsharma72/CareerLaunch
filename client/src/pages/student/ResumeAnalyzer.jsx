import { useState } from "react";
import {
  FaFileUpload,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

import Loader from "../../components/common/Loader";

function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");

  const [loading, setLoading] = useState(false);

  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      alert("Please paste your resume content");
      return;
    }

    try {
      setLoading(true);

      // Replace with Gemini API call later
      const dummyResponse = {
        atsScore: 82,

        missingSkills: [
          "Redux",
          "Docker",
          "CI/CD",
        ],

        suggestions: [
          "Add measurable achievements.",
          "Improve project descriptions.",
          "Include GitHub profile link.",
          "Highlight technical skills section.",
        ],

        careerAdvice:
          "Focus on React, PostgreSQL, and Docker to improve your chances of getting shortlisted for MERN roles.",
      };

      setTimeout(() => {
        setAnalysis(dummyResponse);
        setLoading(false);
      }, 1500);

    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          AI Resume Analyzer
        </h1>

        <p className="text-gray-600 mt-2">
          Analyze your resume and get
          ATS-friendly suggestions.
        </p>

      </div>

      {/* Resume Input */}
      <div className="bg-white shadow rounded-xl p-6">

        <div className="flex items-center gap-3 mb-4">

          <FaFileUpload
            className="text-blue-600 text-2xl"
          />

          <h2 className="text-xl font-semibold">
            Paste Resume Content
          </h2>

        </div>

        <textarea
          rows="15"
          placeholder="
Paste your resume content here...

Example:

Name: Prakash Sharma

Skills:
React, Node.js, PostgreSQL

Projects:
CareerLaunch AI
E-commerce Website

Education:
B.Tech Computer Science
"
          value={resumeText}
          onChange={(e) =>
            setResumeText(e.target.value)
          }
          className="
            w-full
            border
            rounded-lg
            p-4
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />

        <button
          onClick={handleAnalyze}
          className="
            mt-4
            bg-blue-600
            text-white
            px-6
            py-3
            rounded-lg
            hover:bg-blue-700
          "
        >
          Analyze Resume
        </button>

      </div>

      {/* Results */}
      {analysis && (
        <div className="space-y-6 mt-8">

          {/* ATS Score */}
          <div className="bg-white shadow rounded-xl p-6">

            <h2 className="text-xl font-semibold mb-4">
              ATS Score
            </h2>

            <div className="flex items-center gap-4">

              <div
                className="
                text-5xl
                font-bold
                text-green-600
              "
              >
                {analysis.atsScore}%
              </div>

            </div>

          </div>

          {/* Missing Skills */}
          <div className="bg-white shadow rounded-xl p-6">

            <h2 className="text-xl font-semibold mb-4">
              Missing Skills
            </h2>

            <div className="flex flex-wrap gap-3">

              {analysis.missingSkills.map(
                (skill, index) => (
                  <span
                    key={index}
                    className="
                    bg-red-100
                    text-red-700
                    px-4
                    py-2
                    rounded-full
                  "
                  >
                    {skill}
                  </span>
                )
              )}

            </div>

          </div>

          {/* Suggestions */}
          <div className="bg-white shadow rounded-xl p-6">

            <h2 className="text-xl font-semibold mb-4">
              Improvement Suggestions
            </h2>

            <ul className="space-y-3">

              {analysis.suggestions.map(
                (item, index) => (
                  <li
                    key={index}
                    className="
                    flex
                    items-start
                    gap-3
                  "
                  >
                    <FaCheckCircle
                      className="
                      text-green-600
                      mt-1
                    "
                    />

                    <span>{item}</span>
                  </li>
                )
              )}

            </ul>

          </div>

          {/* Career Advice */}
          <div className="bg-white shadow rounded-xl p-6">

            <h2 className="text-xl font-semibold mb-4">
              Career Advice
            </h2>

            <div
              className="
              flex
              gap-3
              items-start
            "
            >
              <FaExclamationTriangle
                className="
                text-yellow-500
                mt-1
              "
              />

              <p className="leading-7">
                {analysis.careerAdvice}
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default ResumeAnalyzer;